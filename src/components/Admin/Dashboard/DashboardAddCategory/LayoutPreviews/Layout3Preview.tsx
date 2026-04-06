export default function Layout3Preview() {
  return (
    <div className="w-full h-full p-2">
      {/* Single large box with 2 columns inside */}
      <div className="w-full h-full border-2 border-dashed border-gray-400 rounded bg-blue-50 p-2">
        <div className="grid grid-cols-2 gap-2 h-full">
          <div className="border-2 border-dashed border-gray-400 rounded bg-white" />
          <div className="border-2 border-dashed border-gray-400 rounded bg-white" />
        </div>
      </div>
    </div>
  );
}
