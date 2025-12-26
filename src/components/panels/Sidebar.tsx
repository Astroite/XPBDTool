import React, { useState } from 'react';
import { Activity, Cpu, Box, Layers } from 'lucide-react';
import { SolverParams, MaterialParams, ViewParams } from '../../types';
import SectionHeader from '../ui/SectionHeader';
import NumberInput from '../ui/NumberInput';

interface SidebarProps {
    solverParams: SolverParams;
    setSolverParams: React.Dispatch<React.SetStateAction<SolverParams>>;
    matParams: MaterialParams;
    setMatParams: React.Dispatch<React.SetStateAction<MaterialParams>>;
    viewParams: ViewParams;
    setViewParams: React.Dispatch<React.SetStateAction<ViewParams>>;
}

const Sidebar: React.FC<SidebarProps> = ({ solverParams, setSolverParams, matParams, setMatParams, viewParams, setViewParams }) => {
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({ solver: true, material: true, rendering: true });

    const toggleSection = (section: string) => setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));

    return (
        <div className="w-80 flex-shrink-0 flex flex-col border-r border-gray-800 bg-gray-900 shadow-xl z-20">
            <div className="h-14 flex items-center px-4 border-b border-gray-800 bg-gray-950">
                <Activity className="text-blue-500 mr-2" size={20} />
                <h1 className="font-bold text-sm tracking-wide text-gray-100">XPBD Cloth Tool</h1>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">

                {/* Solver */}
                <SectionHeader title="Solver Settings" icon={Cpu} isOpen={openSections.solver} onClick={() => toggleSection('solver')} />
                {openSections.solver && (
                    <div className="p-4 bg-gray-900/30 space-y-3 border-b border-gray-800">
                        <NumberInput label="Substeps" value={solverParams.substeps} min={1} max={20} step={1} onChange={(v: number) => setSolverParams(p => ({...p, substeps: v}))} />
                        <NumberInput label="Iterations" value={solverParams.iterations} min={1} max={10} step={1} onChange={(v: number) => setSolverParams(p => ({...p, iterations: v}))} />
                        <NumberInput label="Delta Time" value={solverParams.dt} min={0.001} max={0.05} step={0.001} onChange={(v: number) => setSolverParams(p => ({...p, dt: v}))} />
                        <div className="pt-2 mt-2 border-t border-gray-800/50">
                            <label className="text-gray-400 text-xs font-medium mb-2 block">Gravity Y</label>
                            <input
                                type="number"
                                value={solverParams.gravity[1]}
                                className="w-full bg-gray-950 border border-gray-700 rounded py-1 px-2 text-xs text-right text-gray-300"
                                onChange={(e) => setSolverParams(p => ({...p, gravity: [0, parseFloat(e.target.value), 0]}))}
                            />
                        </div>
                    </div>
                )}

                {/* Material */}
                <SectionHeader title="Material" icon={Layers} isOpen={openSections.material} onClick={() => toggleSection('material')} />
                {openSections.material && (
                    <div className="p-4 bg-gray-900/30 space-y-3 border-b border-gray-800">
                        {/* Placeholder for material params if needed */}
                        <NumberInput label="Stretch" value={matParams.stretchCompliance} min={0} max={0.1} step={0.001} onChange={(v: number) => setMatParams(p => ({...p, stretchCompliance: v}))} />
                    </div>
                )}

                {/* Rendering */}
                <SectionHeader title="Rendering" icon={Box} isOpen={openSections.rendering} onClick={() => toggleSection('rendering')} />
                {openSections.rendering && (
                    <div className="p-4 bg-gray-900/30 space-y-3 border-b border-gray-800">
                        <div className="flex items-center justify-between cursor-pointer" onClick={() => setViewParams(p => ({...p, showWireframe: !p.showWireframe}))}>
                            <span className="text-xs text-gray-400">Show Wireframe</span>
                            <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${viewParams.showWireframe ? 'bg-blue-600' : 'bg-gray-700'}`}>
                                <div className={`w-3 h-3 bg-white rounded-full shadow-sm transform transition-transform ${viewParams.showWireframe ? 'translate-x-4' : 'translate-x-0'}`} />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Sidebar;