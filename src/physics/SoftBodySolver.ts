import { SolverParams } from '../types';

/**
 * XPBD Soft Body Solver
 * Manages raw memory buffers for high-performance physics simulation.
 */
export class SoftBodySolver {
    // --- Particle Data (SoA - Structure of Arrays) ---
    numParticles: number = 0;
    pos: Float32Array;      // Position [x, y, z, ...]
    prevPos: Float32Array;  // Previous Position (for Verlet/XPBD)
    vel: Float32Array;      // Velocity
    invMass: Float32Array;  // 1 / mass (0 = static)

    // --- Constraint Data ---
    // Distance Constraints: [p1_idx, p2_idx]
    distanceConstraints: Uint32Array;
    restLengths: Float32Array;
    numDistanceConstraints: number = 0;

    // --- Mesh Topology (For Rendering) ---
    indices: Uint32Array;

    // --- Configuration ---
    cols: number = 0;
    rows: number = 0;

    constructor(maxParticles: number = 5000) {
        // Pre-allocate memory buffers
        this.pos = new Float32Array(maxParticles * 3);
        this.prevPos = new Float32Array(maxParticles * 3);
        this.vel = new Float32Array(maxParticles * 3);
        this.invMass = new Float32Array(maxParticles);

        // Allocate max constraints (approximation: ~4 neighbors per particle)
        const maxConstraints = maxParticles * 6;
        this.distanceConstraints = new Uint32Array(maxConstraints * 2);
        this.restLengths = new Float32Array(maxConstraints);

        // Indices for rendering triangles
        this.indices = new Uint32Array(maxParticles * 6);
    }

    /**
     * Initialize a grid cloth
     */
    initGrid(cols: number, rows: number, spacing: number, startPos: [number, number, number]) {
        this.cols = cols;
        this.rows = rows;
        this.numParticles = cols * rows;
        this.numDistanceConstraints = 0;

        let idx = 0;
        // 1. Initialize Particles
        for (let j = 0; j < rows; j++) {
            for (let i = 0; i < cols; i++) {
                // Position
                this.pos[3 * idx] = startPos[0] + (i - cols / 2) * spacing;
                this.pos[3 * idx + 1] = startPos[1]; // Flat horizontally
                this.pos[3 * idx + 2] = startPos[2] + (j - rows / 2) * spacing;

                // Init State
                this.prevPos.set(this.pos.subarray(3 * idx, 3 * idx + 3), 3 * idx);
                this.vel[3 * idx] = 0;
                this.vel[3 * idx + 1] = 0;
                this.vel[3 * idx + 2] = 0;

                // Mass: Pin the top two corners for testing
                // Logic: if (j == 0 && (i == 0 || i == cols - 1)) -> invMass = 0
                const isPinned = (j === 0 && (i === 0 || i === cols - 1));
                this.invMass[idx] = isPinned ? 0 : 1.0;

                idx++;
            }
        }

        // 2. Generate Distance Constraints (Structural & Shear) & Triangles
        let indexCount = 0;
        let constraintCount = 0;

        const addConstraint = (p1: number, p2: number) => {
            this.distanceConstraints[constraintCount * 2] = p1;
            this.distanceConstraints[constraintCount * 2 + 1] = p2;

            // Calculate rest length
            const dx = this.pos[3 * p1] - this.pos[3 * p2];
            const dy = this.pos[3 * p1 + 1] - this.pos[3 * p2 + 1];
            const dz = this.pos[3 * p1 + 2] - this.pos[3 * p2 + 2];
            this.restLengths[constraintCount] = Math.sqrt(dx*dx + dy*dy + dz*dz);

            constraintCount++;
        };

        for (let j = 0; j < rows; j++) {
            for (let i = 0; i < cols; i++) {
                const id = j * cols + i;

                // Structural Constraints
                if (i < cols - 1) addConstraint(id, id + 1);      // Horizontal
                if (j < rows - 1) addConstraint(id, id + cols);   // Vertical

                // Shear Constraints (Optional, adds stiffness)
                if (i < cols - 1 && j < rows - 1) {
                    addConstraint(id, id + cols + 1);
                    addConstraint(id + 1, id + cols);
                }

                // Triangle Indices (for Three.js)
                if (i < cols - 1 && j < rows - 1) {
                    // Triangle 1
                    this.indices[indexCount++] = id;
                    this.indices[indexCount++] = id + cols;
                    this.indices[indexCount++] = id + 1;
                    // Triangle 2
                    this.indices[indexCount++] = id + 1;
                    this.indices[indexCount++] = id + cols;
                    this.indices[indexCount++] = id + cols + 1;
                }
            }
        }
        this.numDistanceConstraints = constraintCount;
    }

    /**
     * Main Simulation Step
     */
    update(dt: number, params: SolverParams) {
        if (dt <= 0) return;

        const sdt = dt / params.substeps; // Substep delta time
        const numParticles = this.numParticles;

        for (let step = 0; step < params.substeps; step++) {

            // --- 1. Integrate (Predict) ---
            for (let i = 0; i < numParticles; i++) {
                if (this.invMass[i] === 0) continue; // Skip static particles

                const i3 = i * 3;

                // Apply Gravity: v = v + g * dt
                this.vel[i3]     += params.gravity[0] * sdt;
                this.vel[i3 + 1] += params.gravity[1] * sdt;
                this.vel[i3 + 2] += params.gravity[2] * sdt;

                // Predict Position: p = x + v * dt
                this.prevPos[i3]     = this.pos[i3];
                this.prevPos[i3 + 1] = this.pos[i3 + 1];
                this.prevPos[i3 + 2] = this.pos[i3 + 2];

                this.pos[i3]     += this.vel[i3] * sdt;
                this.pos[i3 + 1] += this.vel[i3 + 1] * sdt;
                this.pos[i3 + 2] += this.vel[i3 + 2] * sdt;

                // Simple Ground Collision (Temporary)
                if (this.pos[i3 + 1] < 0) {
                    this.pos[i3 + 1] = 0;
                    this.vel[i3 + 1] = 0;
                    // Friction could go here
                }
            }

            // --- 2. Solve Constraints (The XPBD Heart) ---
            this.solveDistanceConstraints(sdt);

            // --- 3. Update Velocity ---
            for (let i = 0; i < numParticles; i++) {
                if (this.invMass[i] === 0) continue;

                const i3 = i * 3;
                // v = (p - prevPos) / dt
                this.vel[i3]     = (this.pos[i3]     - this.prevPos[i3])     / sdt;
                this.vel[i3 + 1] = (this.pos[i3 + 1] - this.prevPos[i3 + 1]) / sdt;
                this.vel[i3 + 2] = (this.pos[i3 + 2] - this.prevPos[i3 + 2]) / sdt;
            }
        }
    }

    solveDistanceConstraints(dt: number) {
        for (let i = 0; i < this.numDistanceConstraints; i++) {
            const p1 = this.distanceConstraints[i * 2];
            const p2 = this.distanceConstraints[i * 2 + 1];

            const i1 = p1 * 3;
            const i2 = p2 * 3;

            const w1 = this.invMass[p1];
            const w2 = this.invMass[p2];
            const wSum = w1 + w2;
            if (wSum === 0) continue;

            const dx = this.pos[i1] - this.pos[i2];
            const dy = this.pos[i1 + 1] - this.pos[i2 + 1];
            const dz = this.pos[i1 + 2] - this.pos[i2 + 2];

            const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
            const restLen = this.restLengths[i];

            // PBD Correction
            const correction = (dist - restLen) / wSum;
            const gradX = dx / dist * correction;
            const gradY = dy / dist * correction;
            const gradZ = dz / dist * correction;

            if (w1 > 0) {
                this.pos[i1] -= gradX * w1;
                this.pos[i1 + 1] -= gradY * w1;
                this.pos[i1 + 2] -= gradZ * w1;
            }
            if (w2 > 0) {
                this.pos[i2] += gradX * w2;
                this.pos[i2 + 1] += gradY * w2;
                this.pos[i2 + 2] += gradZ * w2;
            }
        }
    }
}