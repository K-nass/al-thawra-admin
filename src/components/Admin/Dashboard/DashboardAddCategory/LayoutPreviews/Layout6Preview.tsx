export default function Layout6Preview() {
  return (
    <div className="w-full h-full flex flex-col gap-1 p-2">
      {/* Top row - 2 large items */}
      <div className="grid grid-cols-2 gap-1 flex-[2]">
        <div className="border-2 border-dashed border-gray-400 rounded" />
        <div className="border-2 border-dashed border-gray-400 rounded" />
      </div>
      
      {/* Bottom row - 4 small items */}
      <div className="grid grid-cols-4 gap-1 flex-1">
        <div className="border-2 border-dashed border-gray-400 rounded" />
        <div className="border-2 border-dashed border-gray-400 rounded" />
        <div className="border-2 border-dashed border-gray-400 rounded" />
        <div className="border-2 border-dashed border-gray-400 rounded" />
      </div>
    </div>
  );
}
