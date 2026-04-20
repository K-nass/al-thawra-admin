export default function FeaturedWithRowLayout() {
  return (
    <div className="w-full flex flex-col gap-6 p-2 bg-white">
      {/* Top - Single Featured Article (2-column grid inside) */}
      <div className="flex justify-center">
        <div className="max-w-5xl w-full border-2 border-dashed border-gray-400 rounded overflow-hidden">
          <div className="grid grid-cols-2 h-64">
            {/* Image Side */}
            <div className="p-6 flex items-center justify-center bg-gray-50 border-r-2 border-dashed border-gray-400">
              <div className="w-full aspect-[3/2] bg-gray-200 border border-dashed border-gray-300 rounded flex items-center justify-center">
                <span className="text-[10px] text-gray-400 uppercase font-bold">Featured Image</span>
              </div>
            </div>
            
            {/* Text Side */}
            <div className="p-6 flex items-center justify-center bg-blue-50/30">
              <div className="text-center w-full space-y-3">
                <div className="h-5 w-3/4 bg-gray-300 mx-auto rounded" />
                <div className="h-5 w-1/2 bg-gray-300 mx-auto rounded" />
                <div className="h-3 w-full bg-gray-200 mx-auto rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom - 4 articles in a row */}
      <div className="grid grid-cols-4 border-t-2 border-dashed border-gray-400">
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
