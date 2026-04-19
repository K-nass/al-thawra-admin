import type { ContentType } from "../DashboardAddPost";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FileText, Play, Video } from "lucide-react";

export default function ContentTypeSelector({ type }: { type: ContentType }) {
  const { t } = useTranslation();
  const description = t(type.descriptionKey);

  return (
    <Link
      to={`/admin/add-post?type=${type.name.toLowerCase().replace(/\s+/g, "-") }`}
      className="bg-white p-8 rounded-[2rem] border border-slate-200 flex flex-col items-center text-center hover:shadow-xl hover:border-primary transition-all duration-300 cursor-pointer group"
    >
      <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
        {type.name === "Article" && <FileText className="w-10 h-10 text-primary" strokeWidth={1.5} />}
        {type.name === "Audio" && <Play className="w-10 h-10 text-primary" strokeWidth={1.5} />}
        {type.name === "Reel" && <Video className="w-10 h-10 text-primary" strokeWidth={1.5} />}
      </div>
      <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2">{type.name}</h3>
      <p className="text-sm text-slate-500 font-medium">{description}</p>
    </Link>
  );
}