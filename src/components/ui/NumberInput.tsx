const NumberInput = React.memo(({ label, value, onChange, min, max, step = 0.1 }: any) => (
    <div className="flex items-center justify-between mb-2 select-none">
        <label className="text-gray-400 text-xs font-medium">{label}</label>
        <div className="flex items-center gap-2 w-36">
            <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(parseFloat(e.target.value))} className="flex-1 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500" />
            <input type="number" value={value} onChange={(e) => onChange(parseFloat(e.target.value))} className="w-14 bg-gray-950 border border-gray-700 rounded px-1 py-0.5 text-xs text-right text-gray-300 font-mono" />
        </div>
    </div>
));