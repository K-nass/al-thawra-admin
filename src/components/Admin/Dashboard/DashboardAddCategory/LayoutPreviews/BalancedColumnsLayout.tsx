export default function BalancedColumnsLayout() {
  return (
    <div className="w-full flex flex-col gap-2 p-2 bg-white">
      {/* Top section: 12-column grid */}
      <div className="grid grid-cols-12 gap-2 h-64">
        {/* Left column - 3 smaller articles */}
        <div className="col-span-3 flex flex-col gap-1">
          <div className="border-2 border-dashed border-gray-400 rounded flex-1" />
          <div className="border-2 border-dashed border-gray-400 rounded flex-1" />
          <div className="border-2 border-dashed border-gray-400 rounded flex-1" />
        </div>

        {/* Center - Featured article (6 columns) */}
        <div className="col-span-6 border-2 border-dashed border-gray-400 rounded flex flex-col p-2 gap-2">
           <div className="h-4 w-1/2 mx-auto bg-gray-200 rounded" />
           <div className="flex-1 bg-gray-100 rounded-sm border border-gray-300 border-dashed" />
        </div>

        {/* Right column - 3 smaller articles */}
        <div className="col-span-3 flex flex-col gap-1">
          <div className="border-2 border-dashed border-gray-400 rounded flex-1" />
          <div className="border-2 border-dashed border-gray-400 rounded flex-1" />
          <div className="border-2 border-dashed border-gray-400 rounded flex-1" />
        </div>
      </div>

      {/* Bottom section: 4 articles in a row */}
      <div className="grid grid-cols-4 gap-1 h-24">
        <div className="border-2 border-dashed border-gray-400 rounded" />
        <div className="border-2 border-dashed border-gray-400 rounded" />
        <div className="border-2 border-dashed border-gray-400 rounded" />
        <div className="border-2 border-dashed border-gray-400 rounded" />
      </div>
    </div>
  );
}