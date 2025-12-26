import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Grid, GizmoHelper, GizmoViewport } from '@react-three/drei';
import {
    Play, Pause, RotateCcw, Save, Upload,
    ChevronDown, ChevronRight, Sun, Wind,
    Layers, Activity, Box, Cpu
} from 'lucide-react';
import * as THREE from 'three';

// ============================================================================
// [MODULE 6] MAIN APP CONTAINER
// ============================================================================

export default function App() {
    const [simState, setSimState] = useState<SimulationState>('stopped');
    const [solverParams, setSolverParams] = useState<SolverParams>(DEFAULT_SOLVER_PARAMS);
    const [matParams, setMatParams] = useState<MaterialParams>(DEFAULT_MATERIAL_PARAMS);
    const [viewParams, setViewParams] = useState<ViewParams>(DEFAULT_VIEW_PARAMS);

    // Persistent Physics Solver Instance
    const solverRef = useRef<SoftBodySolver>(new SoftBodySolver(5000));

    const handleReset = useCallback(() => {
        setSimState('stopped');
        solverRef.current.initGrid(20, 20, 0.2, [0, 2, 0]); // Reset physics
    }, []);

    const handleStep = useCallback(() => {
        solverRef.current.update(solverParams.dt, solverParams);
    }, [solverParams]);

    return (
        <div className="flex h-screen w-full bg-gray-950 text-gray-100 font-sans overflow-hidden select-none">
        <Sidebar solverParams={solverParams} setSolverParams={setSolverParams} matParams={matParams} setMatParams={setMatParams} viewParams={viewParams} setViewParams={setViewParams} />
    <div className="flex-1 relative bg-[#0a0a0a] h-full shadow-inner">
    <ControlBar simState={simState} onTogglePlay={() => setSimState(s => s === 'playing' ? 'paused' : 'playing')} onReset={handleReset} onStep={handleStep} />
    <div className="absolute top-4 right-4 z-10 text-[10px] text-gray-600 font-mono text-right pointer-events-none space-y-1">
    <div className="bg-gray-900/50 px-2 py-1 rounded border border-gray-800">Particles: 400</div>
    <div className="bg-gray-900/50 px-2 py-1 rounded border border-gray-800">Substeps: {solverParams.substeps}</div>
    </div>
    <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }} camera={{ position: [5, 5, 8], fov: 45 }}>
    <OrbitControls makeDefault minDistance={2} maxDistance={30} target={[0, 1, 0]} enableDamping dampingFactor={0.05} />
    <color attach="background" args={['#0a0a0a']} />
    <SimulationScene isPlaying={simState === 'playing'} solverParams={solverParams} viewParams={viewParams} solverRef={solverRef} />
    </Canvas>
    </div>
    </div>
);
}