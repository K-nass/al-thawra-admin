export default function DataTableHeader({
  label,
  description,
}: {
  label: string;
  description: string;
}) {
  return (
    <div className="p-4 border-b border-slate-200  flex justify-between items-center">
      <div>
        <h3 className="text-lg font-semibold text-[#717478]">{label}</h3>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
    </div>
  );
}
