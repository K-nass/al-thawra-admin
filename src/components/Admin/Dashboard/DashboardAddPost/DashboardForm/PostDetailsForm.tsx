import type { HandleChangeType } from "./types";
import type { ArticleInitialStateInterface } from "./usePostReducer/postData";
import { useTranslation } from "react-i18next";
import { 
  FileText, 
  Globe2, 
  Settings, 
  Layout, 
  Star, 
  Zap, 
  Heart, 
  ShieldCheck,
  Info,
  Check
} from "lucide-react";

export interface TagInterface {
  id: string; 
  language: string;
  name: string;
  postsCount: number;
}

interface PostDetailsForm {
  state: ArticleInitialStateInterface;
  handleChange: HandleChangeType;
  fieldErrors?: Record<string, string[]>;
  type: string | null;
}

export default function PostDetailsForm({ 
  state, 
  handleChange, 
  fieldErrors = {},
  type
}: PostDetailsForm) {
  const { t } = useTranslation();

  // Custom handleChange to handle mutual exclusion logic
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    
    // Handle the original change
    handleChange(e);
    
    // Apply mutual exclusion logic immediately after
    if (name === 'addToSlider' && checked) {
      // If Slider is being checked and both Featured and Recommended are already checked, uncheck Recommended
      if (state.addToFeatured && state.addToRecommended) {
        // Use setTimeout to ensure this runs after the current state update
        setTimeout(() => {
          handleChange({
            target: { name: 'addToRecommended', value: false, type: 'checkbox' }
          } as any);
        }, 10);
      }
    }
    
    if (name === 'addToFeatured' && checked) {
      // If Featured is being checked and Slider is active, uncheck Recommended
      if (state.addToSlider && state.addToRecommended) {
        setTimeout(() => {
          handleChange({
            target: { name: 'addToRecommended', value: false, type: 'checkbox' }
          } as any);
        }, 10);
      }
    }
    
    if (name === 'addToRecommended' && checked) {
      // If Recommended is being checked and Slider is active, uncheck Featured
      if (state.addToSlider && state.addToFeatured) {
        setTimeout(() => {
          handleChange({
            target: { name: 'addToFeatured', value: false, type: 'checkbox' }
          } as any);
        }, 10);
      }
    }
    
    // Breaking ↔ Featured toggle logic (mutual exclusion)
    if (name === 'addToBreaking' && checked) {
      // If Breaking is being checked, uncheck Featured
      if (state.addToFeatured) {
        setTimeout(() => {
          handleChange({
            target: { name: 'addToFeatured', value: false, type: 'checkbox' }
          } as any);
        }, 10);
      }
    }
    
    if (name === 'addToFeatured' && checked) {
      // If Featured is being checked, uncheck Breaking
      if (state.addToBreaking) {
        setTimeout(() => {
          handleChange({
            target: { name: 'addToBreaking', value: false, type: 'checkbox' }
          } as any);
        }, 10);
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-1 h-full bg-primary/20" />
      
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shadow-sm border border-primary/20">
          <FileText size={20} />
        </div>
        <div>
          <h3 className="text-lg font-black text-slate-900 tracking-tight">
            {t('post.postDetails')}
          </h3>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{t("post.metadataCoreSettings")}</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* title */}
          <div className="space-y-1.5" data-error-field={fieldErrors.title ? true : undefined}>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5" htmlFor="title">
              <FileText size={10} /> {t('post.title')} <span className="text-rose-500 ml-1 font-bold">*</span>
            </label>
            <input
              className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm font-medium focus:outline-none focus:ring-4 transition-all ${
                fieldErrors.title 
                  ? 'border-rose-200 focus:ring-rose-500/10 text-rose-600' 
                  : 'border-slate-200 focus:ring-primary/10 text-slate-700'
              }`}
              type="text"
              id="title"
              name="title"
              placeholder={t('post.title')}
              value={state.title}
              onChange={handleChange}
            />
            {fieldErrors.title && (
              <p className="text-rose-500 text-[10px] font-black uppercase tracking-tight mt-1 ml-1">{fieldErrors.title}</p>
            )}
          </div>

          {/* Language */}
          {'language' in state && (
            <div className="space-y-1.5" data-error-field={fieldErrors.language ? true : undefined}>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5" htmlFor="language">
                <Globe2 size={10} /> {t('formLabels.language')} <span className="text-rose-500 ml-1 font-bold">*</span>
              </label>
              <div className="relative">
                <select
                  className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm font-medium focus:outline-none focus:ring-4 transition-all appearance-none ${
                    fieldErrors.language 
                      ? 'border-rose-200 focus:ring-rose-500/10 text-rose-600' 
                      : 'border-slate-200 focus:ring-primary/10 text-slate-700'
                  }`}
                  id="language"
                  name="language"
                  value={(state as ArticleInitialStateInterface).language || ''}
                  onChange={handleChange}
                >
                  <option value="">{t('formLabels.selectLanguage')}</option>
                  <option value="English">{t('formLabels.english')}</option>
                  <option value="Arabic">{t('formLabels.arabic')}</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                   <Globe2 size={14} />
                </div>
              </div>
              {fieldErrors.language && (
                <p className="text-rose-500 text-[10px] font-black uppercase tracking-tight mt-1 ml-1">{fieldErrors.language}</p>
              )}
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Add to Slider */}
          {'addToSlider' in state && (
            <FlagCheckbox
              name="addToSlider"
              label={t('formLabels.addToSlider')}
              icon={<Layout size={14} />}
              checked={(state as ArticleInitialStateInterface).addToSlider === true}
              onChange={handleCheckboxChange}
              color="blue"
            />
          )}
          {/* Add to Featured */}
          {'addToFeatured' in state && (
            <FlagCheckbox
              name="addToFeatured"
              label={t('formLabels.addToFeatured')}
              icon={<Star size={14} />}
              checked={(state as ArticleInitialStateInterface).addToFeatured === true}
              onChange={handleCheckboxChange}
              color="amber"
            />
          )}
          {/* Add to Breaking */}
          {'addToBreaking' in state && (
            <FlagCheckbox
              name="addToBreaking"
              label={t('formLabels.addToBreaking')}
              icon={<Zap size={14} />}
              checked={(state as ArticleInitialStateInterface).addToBreaking === true}
              onChange={handleCheckboxChange}
              color="rose"
            />
          )}
          {/* Add to Recommended */}
          <FlagCheckbox
            name="addToRecommended"
            label={t('formLabels.addToRecommended')}
            icon={<Heart size={14} />}
            checked={state.addToRecommended === true}
            onChange={handleCheckboxChange}
            color="emerald"
          />
          {/* Show Only to Registered Users */}
          <FlagCheckbox
            name="showOnlyToRegisteredUsers"
            label={t('formLabels.showOnlyToRegisteredUsers')}
            icon={<ShieldCheck size={14} />}
            checked={state.showOnlyToRegisteredUsers === true}
            onChange={handleChange}
            color="indigo"
          />
        </div>

        {/* Explanatory note for mutual exclusion */}
        {state.addToSlider && (
          <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
              <Info size={16} />
            </div>
            <p className="text-xs text-blue-800 font-medium leading-relaxed pt-1">
              {t('post.sliderMutualExclusionNote')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Sub-component for flagged checkboxes
function FlagCheckbox({ 
  name, 
  label, 
  icon, 
  checked, 
  onChange,
  color = "primary"
}: { 
  name: string; 
  label: string; 
  icon: React.ReactNode; 
  checked: boolean; 
  onChange: any;
  color?: "blue" | "amber" | "rose" | "emerald" | "indigo" | "primary"
}) {
  const colorMap = {
    blue: "text-blue-600 bg-blue-50 border-blue-200",
    amber: "text-amber-600 bg-amber-50 border-amber-200",
    rose: "text-rose-600 bg-rose-50 border-rose-200",
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-200",
    indigo: "text-indigo-600 bg-indigo-50 border-indigo-200",
    primary: "text-primary bg-primary/5 border-primary/20",
  };

  const activeColorMap = {
    blue: "bg-blue-600 text-white border-blue-700 shadow-blue-200",
    amber: "bg-amber-600 text-white border-amber-700 shadow-amber-200",
    rose: "bg-rose-600 text-white border-rose-700 shadow-rose-200",
    emerald: "bg-emerald-600 text-white border-emerald-700 shadow-emerald-200",
    indigo: "bg-indigo-600 text-white border-indigo-700 shadow-indigo-200",
    primary: "bg-primary text-white border-primary shadow-primary/20",
  };

  return (
    <label className={`
      relative flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all duration-300
      ${checked ? activeColorMap[color] + " shadow-sm" : "bg-white border-slate-200 hover:bg-slate-50"}
    `}>
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${checked ? 'bg-white/20' : 'bg-slate-100 text-slate-400'}`}>
        {icon}
      </div>
      <div className="flex-1">
        <span className={`text-xs font-black uppercase tracking-tight ${checked ? 'text-white' : 'text-slate-600'}`}>
          {label}
        </span>
      </div>
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
        checked ? 'bg-white border-white scale-110' : 'bg-transparent border-slate-200'
      }`}>
        {checked && <Check size={12} className={color === 'primary' ? 'text-primary' : `text-${color}-600`} />}
      </div>
    </label>
  );
}
