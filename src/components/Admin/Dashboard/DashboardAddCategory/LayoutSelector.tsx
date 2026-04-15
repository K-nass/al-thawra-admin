import { Check } from "lucide-react";
import Layout1Preview from "./LayoutPreviews/Layout1Preview";
import Layout2Preview from "./LayoutPreviews/Layout2Preview";
import Layout3Preview from "./LayoutPreviews/Layout3Preview";
import Layout4Preview from "./LayoutPreviews/Layout4Preview";
import Layout6Preview from "./LayoutPreviews/Layout6Preview";
import Layout7Preview from "./LayoutPreviews/Layout7Preview";
import Layout8Preview from "./LayoutPreviews/Layout8Preview";
import Layout11Preview from "./LayoutPreviews/Layout11Preview";

interface LayoutOption {
  id: string;
  name: string;
  component: React.ComponentType;
}

const AVAILABLE_LAYOUTS: LayoutOption[] = [
  { id: "Layout1", name: "Layout 1", component: Layout1Preview },
  { id: "Layout2", name: "Layout 2", component: Layout2Preview },
  { id: "Layout3", name: "Layout 3", component: Layout3Preview },
  { id: "Layout4", name: "Layout 4", component: Layout4Preview },
  { id: "Layout6", name: "Layout 6", component: Layout6Preview },
  { id: "Layout7", name: "Layout 7", component: Layout7Preview },
  { id: "Layout8", name: "Layout 8", component: Layout8Preview },
  { id: "Layout11", name: "Layout 11", component: Layout11Preview },
];

interface LayoutSelectorProps {
  selectedLayout: string;
  onLayoutChange: (layout: string) => void;
}

export default function LayoutSelector({ selectedLayout, onLayoutChange }: LayoutSelectorProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {AVAILABLE_LAYOUTS.map((layout) => {
        const PreviewComponent = layout.component;
        const isSelected = selectedLayout === layout.id;
        
        return (
          <button
            key={layout.id}
            type="button"
            onClick={() => onLayoutChange(layout.id)}
            className={`
              relative aspect-video rounded-2xl border-2 transition-all duration-300 overflow-hidden
              hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]
              ${
                isSelected
                  ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }
            `}
          >
            {/* Preview */}
            <div className="w-full h-full opacity-80 group-hover:opacity-100 transition-opacity">
              <PreviewComponent />
            </div>
            
            {/* Label */}
            <div
              className={`
                absolute bottom-0 left-0 right-0 py-2 text-center text-[10px] font-black uppercase tracking-widest
                ${isSelected ? "bg-primary text-white" : "bg-slate-50 text-slate-500"}
              `}
            >
              {layout.name}
            </div>
            
            {/* Checkmark */}
            {isSelected && (
              <div className="absolute top-2 right-2 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white animate-in zoom-in-50 duration-300">
                <Check size={12} strokeWidth={3} />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
