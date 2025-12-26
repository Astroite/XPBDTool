// ============================================================================
// [MODULE 1] TYPES & INTERFACES
// ============================================================================

export type SimulationState = 'stopped' | 'playing' | 'paused';

export interface SolverParams {
    substeps: number;
    iterations: number;
    gravity: [number, number, number];
    dt: number;
}

export interface MaterialParams {
    stretchCompliance: number;
    bendCompliance: number;
    damping: number;
}

export interface ViewParams {
    showWireframe: boolean;
    showConstraints: boolean;
}