import { SolverParams } from '../types';

const ControlBar = ({ simState, onTogglePlay, onReset, onStep }: any) => (
    <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-10 flex items-center gap-1 p-1 bg-gray-900/80 backdrop-blur-md border border-gray-700/50 rounded-full shadow-2xl">
        <button onClick={onReset} className="w-10 h-10 flex items-center justify-center rounded-full text-gray-400 hover:text-white hover:bg-gray-700/50 transition-colors"><RotateCcw size={18} /></button>
        <div className="h-6 w-px bg-gray-700/50 mx-1"></div>
        <button onClick={onTogglePlay} className={`h-10 px-6 rounded-full flex items-center gap-2 font-semibold text-sm transition-all ${simState === 'playing' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-blue-600 text-white'}`}>{simState === 'playing' ? <><Pause size={18}/> Pause</> : <><Play size={18}/> Simulate</>}</button>
        {simState !== 'playing' && <button onClick={onStep} className="w-10 h-10 flex items-center justify-center rounded-full text-gray-400 hover:text-white hover:bg-gray-700/50"><ChevronRight size={20} /></button>}
    </div>
);