export default function Layout4Preview() {
  return (
    <div className="w-full h-full flex flex-col gap-1 p-2">
      {/* Top section - 3 columns */}
      <div className="grid grid-cols-12 gap-1 flex-[2]">
        {/* Left - 3 small items */}
        <div className="col-span-3 flex flex-col gap-1">
          <div className="border-2 border-dashed border-gray-400 rounded flex-1" />
          <div className="border-2 border-dashed border-gray-400 rounded flex-1" />
          <div className="border-2 border-dashed border-gray-400 rounded flex-1" />
        </div>
        
        {/* Center - 1 large item */}
        <div className="col-span-6 border-2 border-dashed border-gray-400 rounded" />
        
        {/* Right - 3 small items */}
        <div className="col-span-3 flex flex-col gap-1">
          <div className="border-2 border-dashed border-gray-400 rounded flex-1" />
          <div className="border-2 border-dashed border-gray-400 rounded flex-1" />
          <div className="border-2 border-dashed border-gray-400 rounded flex-1" />
        </div>
      </div>
      
      {/* Bottom section - 4 items */}
      <div className="grid grid-cols-4 gap-1 flex-1">
        <div className="border-2 border-dashed border-gray-400 rounded" />
        <div className="border-2 border-dashed border-gray-400 rounded" />
        <div className="border-2 border-dashed border-gray-400 rounded" />
        <div className="border-2 border-dashed border-gray-400 rounded" />
      </div>
    </div>
  );
}
