import { Check } from "lucide-react";
import BalancedColumnsLayout from "./LayoutPreviews/BalancedColumnsLayout";
import DualFeaturedLayout from "./LayoutPreviews/DualFeaturedLayout";
import DualSwiperLayout from "./LayoutPreviews/DualSwiperLayout";
import FeaturedWithRowLayout from "./LayoutPreviews/FeaturedWithRowLayout";
import HeroSliderLayout from "./LayoutPreviews/HeroSliderLayout";
import InvertedSplitLayout from "./LayoutPreviews/InvertedSplitLayout";
import SplitHeroLayout from "./LayoutPreviews/SplitHeroLayout";
import TripleColumnLayout from "./LayoutPreviews/TripleColumnLayout";

interface LayoutOption {
  id: string;
  name: string;
  component: React.ComponentType;
}

const AVAILABLE_LAYOUTS: LayoutOption[] = [
  { id: "BalancedColumns", name: "Balanced Columns", component: BalancedColumnsLayout },
  { id: "DualFeatured", name: "Dual Featured", component: DualFeaturedLayout },
  { id: "DualSwiper", name: "Dual Swiper", component: DualSwiperLayout },
  { id: "FeaturedWithRow", name: "Featured With Row", component: FeaturedWithRowLayout },
  { id: "HeroSlider", name: "Hero Slider", component: HeroSliderLayout },
  { id: "InvertedSplit", name: "Inverted Split", component: InvertedSplitLayout },
  { id: "SplitHero", name: "Split Hero", component: SplitHeroLayout },
  { id: "TripleColumn", name: "Triple Column", component: TripleColumnLayout },
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
