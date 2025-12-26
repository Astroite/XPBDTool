const SectionHeader = React.memo(({ title, icon: Icon, isOpen, onClick }: any) => (
    <button onClick={onClick} className={`w-full flex items-center justify-between p-3 border-b border-gray-800 transition-colors text-xs font-bold uppercase tracking-wider select-none ${isOpen ? 'bg-gray-800/80 text-gray-200' : 'bg-gray-900 hover:bg-gray-800 text-gray-400'}`}>
        <div className="flex items-center gap-2"><Icon size={14} className={isOpen ? "text-blue-400" : "text-gray-500"} />{title}</div>
        {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
    </button>
));