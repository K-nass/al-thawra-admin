export default function Layout1Preview() {
  return (
    <div className="w-full h-full grid grid-cols-12 gap-1 p-2">
      {/* Left Sidebar - 3 columns */}
      <div className="col-span-3 flex flex-col gap-1">
        <div className="border-2 border-dashed border-gray-400 rounded flex-1" />
        <div className="grid grid-cols-2 gap-1 flex-1">
          <div className="border-2 border-dashed border-gray-400 rounded" />
          <div className="border-2 border-dashed border-gray-400 rounded" />
          <div className="border-2 border-dashed border-gray-400 rounded" />
          <div className="border-2 border-dashed border-gray-400 rounded" />
        </div>
      </div>

      {/* Center - 6 columns */}
      <div className="col-span-6 border-2 border-dashed border-gray-400 rounded" />

      {/* Right Sidebar - 3 columns */}
      <div className="col-span-3 flex flex-col gap-1">
        <div className="border-2 border-dashed border-gray-400 rounded h-8" />
        <div className="border-2 border-dashed border-gray-400 rounded flex-1" />
      </div>
    </div>
  );
}