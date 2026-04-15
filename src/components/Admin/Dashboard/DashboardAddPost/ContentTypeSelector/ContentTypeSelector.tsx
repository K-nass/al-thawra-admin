
import type { ContentType } from "../DashboardAddPost";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function ContentTypeSelector({ type }: { type: ContentType }) {
  const { t } = useTranslation();
  const description = t(type.descriptionKey);

  return (
    <Link
      to={`/admin/add-post?type=${type.name.toLowerCase().replace(/\s+/g, "-") }`}
      className="bg-white  p-6 rounded-lg border border-slate-200  flex flex-col items-center text-center hover:shadow-lg hover:border-primary transition-all duration-300 cursor-pointer"
    >
      <div className="text-primary mb-4 flex justify-center">
        <div className="flex items-center justify-center p-3">
          {(() => {
            const Icon = type.icon;
            return <Icon className="w-12 h-12 text-[#1ABC9C]" strokeWidth={1.5} />;
          })()}
        </div>
      </div>
      <h3 className="font-semibold text-slate-800  mb-1">{type.name}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {description}
      </p>
    </Link>
  );
}
