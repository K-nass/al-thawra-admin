export default function InvertedSplitLayout() {
  return (
    <div className="w-full flex flex-col gap-6 p-2 bg-white">
      {/* Top row - Image Left, Text Right */}
      <div className="flex justify-center">
        <div className="grid grid-cols-2 gap-6 w-full max-w-5xl">
          
          {/* Left Side: Image Only */}
          <div className="border-2 border-dashed border-gray-400 rounded p-4 flex items-center justify-center h-64 bg-gray-50">
            <div className="w-full aspect-[3/2] bg-gray-200 border border-dashed border-gray-300 rounded flex items-center justify-center">
              <span className="text-[10px] text-gray-400 font-bold uppercase">Image Only Column</span>
            </div>
          </div>

          {/* Right Side: Text Only with Hover Hint */}
          <div className="border-2 border-dashed border-gray-400 rounded h-64 flex items-center justify-center bg-blue-50/30">
            <div className="text-center p-6 space-y-3 w-full">
              <div className="h-5 w-3/4 bg-gray-300 mx-auto rounded" />
              <div className="h-5 w-1/2 bg-gray-300 mx-auto rounded" />
              <div className="h-3 w-full bg-gray-200 mx-auto rounded" />
              <div className="h-3 w-2/3 bg-gray-200 mx-auto rounded" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom row - Four smaller articles */}
      <div className="grid grid-cols-4 border-t-2 border-dashed border-gray-400 pt-6">
        {[1, 2, 3, 4].map((i) => (
          <div 
            key={i} 
            className={`p-4 h-24 flex flex-col gap-2 ${i < 4 ? 'border-r-2 border-dashed border-gray-400' : ''}`}
          >
            <div className="h-3 w-full bg-gray-200 rounded" />
            <div className="h-2 w-2/3 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
