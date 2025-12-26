// ============================================================================
// [MODULE 3] CONSTANTS & DEFAULTS
// ============================================================================
import { SolverParams, MaterialParams, ViewParams } from '../types';

export const DEFAULT_SOLVER_PARAMS: SolverParams = {
    substeps: 10,
    iterations: 2,
    gravity: [0, -9.8, 0],
    dt: 0.016
};

export const DEFAULT_MATERIAL_PARAMS: MaterialParams = {
    stretchCompliance: 0.0,
    bendCompliance: 0.1,
    damping: 0.01
};

export const DEFAULT_VIEW_PARAMS: ViewParams = {
    showWireframe: true,
    showConstraints: false
};