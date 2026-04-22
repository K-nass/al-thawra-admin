import { ArrowLeft, Home, SearchX } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router-dom";

interface NotFoundPageProps {
  embedded?: boolean;
}

export default function NotFoundPage({ embedded = false }: NotFoundPageProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const homeTarget = location.pathname.startsWith("/admin") ? "/admin" : "/home";

  return (
    <div
      className={`${embedded ? "h-full min-h-screen" : "min-h-screen"} w-full bg-gradient-to-b from-slate-50 to-white flex items-center justify-center px-6 py-10`}
    >
      <div className="w-full max-w-2xl rounded-[2rem] border border-slate-200 bg-white shadow-sm p-8 sm:p-12 text-center relative overflow-hidden">
        <div className="absolute -top-14 -right-14 w-40 h-40 rounded-full bg-primary/10 pointer-events-none" />

        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
          <SearchX size={28} />
        </div>

        <p className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-400 mb-3">404</p>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-4">
          {t("common.notFound")}
        </h1>
        <p className="text-sm sm:text-base font-medium text-slate-500 max-w-xl mx-auto mb-3">
          {t("common.notFoundMessage")}
        </p>
        <p className="text-xs font-bold text-slate-400 break-all">{location.pathname}</p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to={homeTarget}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest hover:bg-primary transition-colors"
          >
            <Home size={14} />
            {t("common.goHome")}
          </Link>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white border border-slate-200 text-slate-700 text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft size={14} />
            {t("common.goBack")}
          </button>
        </div>
      </div>
    </div>
  );
}
