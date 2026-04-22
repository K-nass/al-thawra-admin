import { AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react";
import { isRouteErrorResponse, useNavigate, useRouteError } from "react-router-dom";
import NotFoundPage from "./NotFoundPage";

export default function RouteErrorPage() {
  const error = useRouteError();
  const navigate = useNavigate();

  let status = 500;
  let title = "Something went wrong";
  let description = "An unexpected error occurred while loading this page.";

  if (isRouteErrorResponse(error)) {
    status = error.status;
    title = error.statusText || title;

    if (typeof error.data === "string") {
      description = error.data;
    } else if (error.data && typeof error.data === "object" && "message" in error.data) {
      description = String((error.data as { message?: unknown }).message || description);
    }
  } else if (error instanceof Error && error.message) {
    description = error.message;
  }

  if (status === 404) {
    return <NotFoundPage />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-2xl rounded-[2rem] border border-slate-200 bg-white shadow-sm p-8 sm:p-12 text-center relative overflow-hidden">
        <div className="absolute -top-14 -right-14 w-40 h-40 rounded-full bg-rose-100 pointer-events-none" />

        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200">
          <AlertTriangle size={28} />
        </div>

        <p className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-400 mb-3">Error {status}</p>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-4">{title}</h1>
        <p className="text-sm sm:text-base font-medium text-slate-500 max-w-xl mx-auto">{description}</p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest hover:bg-primary transition-colors"
          >
            <RefreshCw size={14} />
            Reload
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white border border-slate-200 text-slate-700 text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft size={14} />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
