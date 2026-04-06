import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
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
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {AVAILABLE_LAYOUTS.map((layout) => {
        const PreviewComponent = layout.component;
        const isSelected = selectedLayout === layout.id;
        
        return (
          <button
            key={layout.id}
            type="button"
            onClick={() => onLayoutChange(layout.id)}
            className={`
              relative aspect-video rounded-lg border-2 transition-all duration-200
              hover:shadow-lg hover:scale-105
              ${
                isSelected
                  ? "border-blue-600 bg-blue-50 shadow-md"
                  : "border-gray-300 bg-white hover:border-blue-400"
              }
            `}
          >
            {/* Preview */}
            <div className="w-full h-full">
              <PreviewComponent />
            </div>
            
            {/* Label */}
            <div
              className={`
                absolute bottom-0 left-0 right-0 py-2 text-center text-sm font-semibold rounded-b-lg
                ${isSelected ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"}
              `}
            >
              {layout.name}
            </div>
            
            {/* Checkmark */}
            {isSelected && (
              <div className="absolute top-2 right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                <FontAwesomeIcon icon={faCheck} className="text-white text-xs" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
