export default function HeroSliderLayout() {
  return (
  <div className="w-full grid grid-cols-12 gap-4 p-2 bg-white min-h-[500px]">
      
      {/* Left Sidebar - Featured Content (3 columns) */}
      <aside className="col-span-3 flex flex-col gap-4">
        {/* Main Featured Article block */}
        <div className="border-2 border-dashed border-gray-400 rounded p-2 space-y-2">
          <div className="flex justify-between items-center">
            <div className="h-3 w-16 bg-gray-200 rounded" />
            <div className="flex gap-1">
              <div className="w-4 h-4 rounded-full border border-gray-400" />
              <div className="w-4 h-4 rounded-full border border-gray-400" />
            </div>
          </div>
          <div className="h-4 w-full bg-gray-300 rounded" />
          <div className="h-3 w-5/6 bg-gray-100 rounded" />
          <div className="aspect-[4/3] bg-gray-200 rounded" />
        </div>

        {/* Author Cards - Two Columns */}
        <div className="grid grid-cols-2 gap-2 mt-auto">
          <div className="bg-blue-100/50 p-2 h-24 flex flex-col justify-between">
            <div className="h-3 w-full bg-blue-200 rounded" />
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gray-400" />
              <div className="h-2 w-8 bg-gray-300 rounded" />
            </div>
          </div>
          <div className="bg-blue-100/50 p-2 h-24 flex flex-col justify-between">
            <div className="h-3 w-full bg-blue-200 rounded" />
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gray-400" />
              <div className="h-2 w-8 bg-gray-300 rounded" />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area - Swiper (6 columns) */}
      <main className="col-span-6 border-x-2 border-dashed border-gray-400 px-4 flex flex-col">
        <div className="text-center py-4 space-y-3">
          <div className="h-4 w-24 bg-gray-200 mx-auto rounded" />
          <div className="h-6 w-3/4 bg-gray-300 mx-auto rounded" />
          <div className="h-3 w-full bg-gray-100 mx-auto rounded" />
        </div>
        
        <div className="flex-1 bg-gray-50 border-2 border-dashed border-gray-300 rounded flex items-center justify-center m-4">
           <span className="text-xs text-gray-400 font-bold">HERO SLIDER AREA</span>
        </div>

        {/* Swiper Controls */}
        <div className="flex justify-between items-center py-4">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-gray-300" />
            ))}
          </div>
          <div className="flex gap-2">
            <div className="w-8 h-8 rounded-full border-2 border-gray-400" />
            <div className="w-8 h-8 rounded-full border-2 border-gray-400" />
          </div>
        </div>
      </main>

      {/* Right Sidebar - "At a Glance" (3 columns) */}
      <aside className="col-span-3 flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-2">
            <div className="h-4 w-full bg-gray-300 rounded" />
            <div className="h-2 w-16 bg-red-200 rounded" />
          </div>
          <div className="h-16 bg-gray-100 rounded border border-dashed border-gray-300 flex items-center justify-center">
             <span className="text-[10px] text-gray-400">MAP</span>
          </div>
        </div>

        <div className="divide-y divide-dashed divide-gray-300">
          {/* Items with Image */}
          {[1, 2].map((i) => (
            <div key={i} className="py-3 flex gap-2">
              <div className="w-20 h-14 bg-gray-200 rounded flex-shrink-0" />
              <div className="space-y-1 flex-1">
                <div className="h-2 w-10 bg-gray-200 rounded" />
                <div className="h-3 w-full bg-gray-100 rounded" />
              </div>
            </div>
          ))}
          {/* Items without Image */}
          {[1, 2, 3].map((i) => (
            <div key={i} className="py-3">
              <div className="h-3 w-full bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      </aside>

    </div>
  );
}
