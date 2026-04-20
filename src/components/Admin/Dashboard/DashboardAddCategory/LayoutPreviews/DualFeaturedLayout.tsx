export default function DualFeaturedLayout() {
  return (
   <div className="w-full flex flex-col gap-4 p-2 bg-white">
      {/* Top row - Two Featured Articles */}
      <div className="flex justify-center">
        <div className="grid grid-cols-2 gap-4 w-full max-w-5xl">
          {[1, 2].map((i) => (
            <div key={i} className="border-2 border-dashed border-gray-400 rounded p-4 flex flex-col gap-3 h-64">
              {/* Title & Summary Placeholders */}
              <div className="space-y-2">
                <div className="h-4 w-3/4 bg-gray-200 mx-auto rounded" />
                <div className="h-3 w-5/6 bg-gray-100 mx-auto rounded" />
              </div>
              {/* Image Placeholder */}
              <div className="mt-auto w-full aspect-[3/2] bg-gray-100 border border-gray-300 border-dashed rounded-sm flex items-center justify-center">
                <span className="text-[10px] text-gray-400 uppercase">Featured Image</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom row - Four smaller articles */}
      <div className="grid grid-cols-4 border-t-2 border-dashed border-gray-400 pt-4">
        {[1, 2, 3, 4].map((i) => (
          <div 
            key={i} 
            className={`p-3 h-24 flex flex-col gap-2 ${i < 4 ? 'border-r-2 border-dashed border-gray-400' : ''}`}
          >
            <div className="h-3 w-full bg-gray-200 rounded" />
            <div className="h-2 w-2/3 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
