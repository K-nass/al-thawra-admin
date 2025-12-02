import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
      <div className="text-primary text-5xl mb-4">
        <span className="material-icons-outlined text-5xl">
          <FontAwesomeIcon icon={type.icon} className="text-[#1ABC9C]" />
        </span>
      </div>
      <h3 className="font-semibold text-slate-800  mb-1">{type.name}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {description}
      </p>
    </Link>
  );
}
