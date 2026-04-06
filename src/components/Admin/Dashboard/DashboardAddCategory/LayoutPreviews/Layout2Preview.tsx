export default function Layout2Preview() {
  return (
    <div className="w-full h-full flex flex-col gap-1 p-2">
      {/* Top row - 4 items */}
      <div className="grid grid-cols-4 gap-1 flex-1">
        <div className="border-2 border-dashed border-gray-400 rounded" />
        <div className="border-2 border-dashed border-gray-400 rounded" />
        <div className="border-2 border-dashed border-gray-400 rounded" />
        <div className="border-2 border-dashed border-gray-400 rounded" />
      </div>
      
      {/* Bottom row - 3 items + sidebar */}
      <div className="grid grid-cols-4 gap-1 flex-1">
        <div className="border-2 border-dashed border-gray-400 rounded" />
        <div className="border-2 border-dashed border-gray-400 rounded" />
        <div className="border-2 border-dashed border-gray-400 rounded" />
        <div className="border-2 border-dashed border-gray-400 rounded bg-blue-100" />
      </div>
    </div>
  );
}
