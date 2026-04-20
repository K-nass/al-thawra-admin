export default function DualSwiperLayout() {
  return (
    <div className="w-full flex flex-col gap-6 p-2 bg-white overflow-hidden">
      {/* Label for Admin Context */}
      <div className="flex justify-between items-center px-1">
        <span className="text-[10px] font-mono text-gray-400 uppercase tracking-tighter">
          Dual Swiper Rows
        </span>
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-gray-300" />
          <div className="w-2 h-2 rounded-full bg-gray-200" />
        </div>
      </div>

      {/* First Row Swiper - 4 visible cards */}
      <div className="grid grid-cols-4 gap-4 w-[120%] lg:w-full opacity-90">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="border-2 border-dashed border-gray-400 rounded flex flex-col h-72"
          >
            <div className="p-3 flex flex-col gap-2">
              <div className="h-4 w-full bg-gray-200 rounded" />
              <div className="h-3 w-3/4 bg-gray-100 rounded" />
              <div className="h-3 w-1/2 bg-gray-100 rounded" />
            </div>
            {/* Image at bottom */}
            <div className="mt-auto h-32 w-full bg-gray-100 border-t border-dashed border-gray-300 flex items-center justify-center">
              <span className="text-[10px] text-gray-400 uppercase">
                Slide {i}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Second Row Swiper - 4 visible cards */}
      <div className="grid grid-cols-4 gap-4 w-[120%] lg:w-full opacity-90">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="border-2 border-dashed border-gray-400 rounded flex flex-col h-72"
          >
            <div className="p-3 flex flex-col gap-2">
              <div className="h-4 w-full bg-gray-200 rounded" />
              <div className="h-3 w-3/4 bg-gray-100 rounded" />
              <div className="h-3 w-1/2 bg-gray-100 rounded" />
            </div>
            {/* Image at bottom */}
            <div className="mt-auto h-32 w-full bg-gray-100 border-t border-dashed border-gray-300 flex items-center justify-center">
              <span className="text-[10px] text-gray-400 uppercase">
                Slide {i}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
