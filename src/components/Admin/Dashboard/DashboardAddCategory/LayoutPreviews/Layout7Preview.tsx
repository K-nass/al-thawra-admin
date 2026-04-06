export default function Layout7Preview() {
  return (
    <div className="w-full h-full flex flex-col gap-1 p-2">
      {/* Top row - 3 items */}
      <div className="grid grid-cols-3 gap-1 flex-1">
        <div className="border-2 border-dashed border-gray-400 rounded" />
        <div className="border-2 border-dashed border-gray-400 rounded" />
        <div className="border-2 border-dashed border-gray-400 rounded" />
      </div>
      
      {/* Bottom - Advertisement banner */}
      <div className="border-2 border-dashed border-gray-400 rounded h-8 bg-blue-50 flex items-center justify-center">
        <span className="text-xs text-gray-500">AD</span>
      </div>
    </div>
  );
}
