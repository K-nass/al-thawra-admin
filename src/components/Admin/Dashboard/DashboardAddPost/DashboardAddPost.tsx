import { Link } from "react-router-dom";
import { FileText, Play, Video as VideoIcon, type LucideIcon } from "lucide-react";
import ContentTypeSelector from "./ContentTypeSelector/ContentTypeSelector";
import { useTranslation } from "react-i18next";

type NameType =
  | "Article"
  | "Audio"
  | "Reel"
const getContentTypes = (): ContentType[] => [
  {
    id: 1,
    name: "Article",
    icon: FileText,
    descriptionKey: "contentTypes.articleDesc",
  },
  {
    id: 6,
    name: "Audio",
    icon: Play,
    descriptionKey: "contentTypes.audioDesc",
  },
  {
    id: 7,
    name: "Reel",
    icon: VideoIcon,
    descriptionKey: "contentTypes.reelDesc",
  },
];

export interface ContentType {
  id: number;
  name: NameType;
  icon: LucideIcon;
  descriptionKey: string;
}

export default function DashboardAddPost() {
  const { t } = useTranslation();
  const contentTypes = getContentTypes();

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50/50">
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">{t('formLabels.choosePostFormat')}</h1>
            <p className="text-sm text-slate-500 mt-2 font-medium max-w-xl">{t('formLabels.choosePostFormatDesc')}</p>
          </div>
          <Link
            to="/admin/posts/all"
            className="inline-flex items-center justify-center px-6 py-3.5 bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-sm hover:bg-primary transition-colors duration-200 gap-3"
          >
            {t('formLabels.posts')}
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contentTypes.map((type) => (
            <ContentTypeSelector key={type.id} type={type} />
          ))}
        </div>
      </div>
    </div>
  );
}
