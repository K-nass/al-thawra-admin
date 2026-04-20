export default function TripleColumnLayout() {
  return (
    <div className="w-full flex flex-col gap-6 p-2 bg-white">
      {/* Top Row - 3 Columns with Square Images at bottom */}
      <div className="grid grid-cols-3 border-b-0">
        {[1, 2, 3].map((i) => (
          <div 
            key={i} 
            className={`flex flex-col h-72 ${i < 3 ? 'border-r-2 border-dashed border-gray-400' : ''}`}
          >
            {/* Text Content */}
            <div className="p-4 flex-1 space-y-2">
              <div className="h-4 w-full bg-gray-300 rounded" />
              <div className="h-3 w-5/6 bg-gray-100 rounded" />
              <div className="h-3 w-4/6 bg-gray-100 rounded" />
            </div>

            {/* Square Image at bottom */}
            <div className="w-full aspect-square bg-gray-200 border-t-2 border-dashed border-gray-400 flex items-center justify-center">
              <span className="text-[10px] text-gray-400 uppercase">Square Image</span>
            </div>
          </div>
        ))}
      </div>

      {/* Advertisement Banner */}
      <div className="w-full mt-2 border-2 border-dashed border-gray-400 rounded overflow-hidden">
        <div className="w-full bg-[#d0e8f2]/50 py-10 flex flex-col items-center justify-center gap-2">
          <span className="text-gray-400 text-xs font-bold tracking-widest uppercase">Advertisement</span>
          <div className="h-1 w-24 bg-blue-200 rounded-full" />
        </div>
      </div>
    </div>
  );
}
