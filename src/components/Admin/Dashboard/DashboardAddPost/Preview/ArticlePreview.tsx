import { useDeferredValue, useMemo } from "react";
import DOMPurify from "dompurify";
import { Film, Podcast, User, Newspaper, Archive, Tv, Link, Send, Facebook, Twitter } from "lucide-react";

export interface ArticlePreviewModel {
  dir: "rtl" | "ltr";
  title: string;
  categoryName: string;
  authorName?: string;
  authorImageUrl?: string | null;
  publishedAtLabel: string;
  imageUrl?: string;
  imageAlt?: string;
  contentHtml: string;
}

function PreviewHeader({ dir }: { dir: "rtl" | "ltr" }) {
  return (
    <header className="w-full pb-4" dir={dir} lang={dir === "rtl" ? "ar" : "en"}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top bar (groups and logo) */}
        <div className="hidden md:grid md:grid-cols-3 md:items-center py-2 w-full text-xs font-semibold uppercase tracking-wider text-gray-700">
          {/* Left group */}
          <div className="flex items-center gap-4 justify-between">
            <span className="flex items-center gap-1.5 cursor-default hover:text-blue-600 transition-colors">
              <Film className="w-4 h-4" />
              <span>ريلز</span>
            </span>
            <span className="flex items-center gap-1.5 cursor-default hover:text-blue-600 transition-colors">
              <Podcast className="w-4 h-4" />
              <span>بودكاست</span>
            </span>
            <span className="flex items-center gap-1.5 cursor-default hover:text-blue-600 transition-colors">
              <User className="w-4 h-4" />
              <span>صفحتي</span>
            </span>
          </div>

          {/* Logo */}
          <div className="flex justify-center items-center">
            <img src="/formLogo.png" alt="الثورة لوجو" className="h-12 md:h-14 lg:h-16 object-contain" />
          </div>

          {/* Right group */}
          <div className="flex items-center gap-4 justify-between">
            <span className="flex items-center gap-1.5 cursor-default hover:text-blue-600 transition-colors">
              <Newspaper className="w-4 h-4" />
              <span>الصحيفة</span>
            </span>
            <span className="flex items-center gap-1.5 cursor-default hover:text-blue-600 transition-colors">
              <Archive className="w-4 h-4" />
              <span>أرشيف الثورة</span>
            </span>
            <span className="flex items-center gap-1.5 cursor-default hover:text-blue-600 transition-colors">
              <Tv className="w-4 h-4" />
              <span>التلفزيون</span>
            </span>
          </div>
        </div>
        <div className="md:hidden py-2 flex justify-center">
          <img src="/formLogo.png" alt="الثورة لوجو" className="h-12 object-contain" />
        </div>
        <nav className="hidden md:block border-t border-b border-dashed border-black/10 py-2 overflow-x-auto">
          <ul className="flex justify-center min-w-max md:min-w-0 space-x-reverse space-x-6 lg:space-x-10 text-sm font-sans text-gray-800">
            <li className="hover:text-blue-600 hover:underline decoration-2 underline-offset-4 font-medium cursor-default">الرئيسية</li>
            <li className="hover:text-blue-600 hover:underline decoration-2 underline-offset-4 cursor-default">اقتصاد</li>
            <li className="hover:text-blue-600 hover:underline decoration-2 underline-offset-4 cursor-default">الاخبار</li>
            <li className="hover:text-blue-600 hover:underline decoration-2 underline-offset-4 cursor-default">الدين والحياة</li>
            <li className="hover:text-blue-600 hover:underline decoration-2 underline-offset-4 cursor-default">الرياضة</li>
            <li className="hover:text-blue-600 hover:underline decoration-2 underline-offset-4 cursor-default">حقوق ومنظمات</li>
            <li className="hover:text-blue-600 hover:underline decoration-2 underline-offset-4 cursor-default">الفنون</li>
            <li className="hover:text-blue-600 hover:underline decoration-2 underline-offset-4 cursor-default">المحليات</li>
            <li className="hover:text-blue-600 hover:underline decoration-2 underline-offset-4 cursor-default">الكتابات</li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

function PreviewMostReadSidebar() {
  return (
    <div className="border border-dashed border-black/10 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900">الأكثر قراءة</h3>
        <div className="flex border border-black/20 overflow-hidden text-sm">
          <button type="button" className="px-3 py-1 bg-gray-900 text-white">
            اليوم
          </button>
          <button type="button" className="px-3 py-1 bg-white text-gray-600">
            الأسبوع
          </button>
        </div>
      </div>
      <ol className="space-y-0">
        {Array.from({ length: 5 }).map((_, idx) => (
          <li key={idx} className="flex items-start gap-3 py-3 border-b border-dashed border-black/10 last:border-b-0">
            <span className="text-2xl font-bold text-gray-900 leading-none mt-0.5 min-w-6 text-center">{idx + 1}</span>
            <div className="flex-1">
              <div className="h-3 bg-black/10 rounded w-[85%]" />
              <div className="h-3 bg-black/10 rounded w-[65%] mt-2" />
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function ArticlePreview({ model }: { model: ArticlePreviewModel }) {
  const deferredHtml = useDeferredValue(model.contentHtml);

  const sanitized = useMemo(() => {
    return DOMPurify.sanitize(deferredHtml, {
      USE_PROFILES: { html: true },
    });
  }, [deferredHtml]);

  const showImage =
    !!model.imageUrl && model.imageUrl !== "null" && model.imageUrl !== "undefined" && model.imageUrl.trim() !== "";

  return (
    <div dir={model.dir} className="bg-[#d0e8f2] min-h-full">
      <PreviewHeader dir={model.dir} />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-8 lg:items-start">
          {/* Main article column */}
          <div className="flex-1 min-w-0 pb-6 lg:pb-0">
            <section className="border-b border-dashed border-black/10 pb-6 lg:pb-8">
              <article className="max-w-3xl mx-auto">
                <div className="pt-2">
                  {/* Category */}
                  <div className="text-xs font-semibold uppercase tracking-wider text-gray-700">
                    {model.categoryName}
                  </div>

                  {/* Title */}
                  <h1 className="mt-3 text-3xl sm:text-4xl font-black text-gray-900 leading-tight">
                    {model.title}
                  </h1>

                  {/* Author block (client-like) */}
                  {model.authorName ? (
                    <div className="mt-4 flex items-center gap-2">
                      <div className="w-10 h-10 rounded bg-white/80 border border-dashed border-black/10 overflow-hidden shrink-0">
                        {model.authorImageUrl ? (
                          <img src={model.authorImageUrl} alt={model.authorName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-black/5" />
                        )}
                      </div>
                      <div className="text-2xl font-bold text-gray-900">{model.authorName}</div>
                    </div>
                  ) : null}



                  {/* Meta */}
                  <div className="mt-4 pt-4 border-t border-dashed border-black/10 flex flex-wrap items-center justify-between gap-y-2 text-sm text-gray-700">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                      <span className="text-gray-500">0 تعليقات</span>
                      <span className="font-semibold">{model.publishedAtLabel}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-700">
                      <span className="flex items-center gap-1.5 cursor-default hover:text-blue-700">
                        <span>Facebook</span>
                        <Facebook className="w-3.5 h-3.5" />
                      </span>
                      <span className="flex items-center gap-1.5 cursor-default hover:text-blue-700">
                        <span>Post</span>
                        <Twitter className="w-3.5 h-3.5" />
                      </span>
                      <span className="flex items-center gap-1.5 cursor-default hover:text-blue-700">
                        <span>Whatsapp</span>
                        <Send className="w-3.5 h-3.5" />
                      </span>
                      <span className="flex items-center gap-1.5 cursor-default hover:text-blue-700">
                        <span>Copy link</span>
                        <Link className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>

                  {/* Image */}
                  {showImage ? (
                    <div className="mt-6">
                      <img
                        src={model.imageUrl}
                        alt={model.imageAlt || model.title}
                        className="w-full aspect-video object-cover border border-dashed border-black/10"
                        loading="lazy"
                      />
                    </div>
                  ) : null}

                  {/* Content */}
                  <div className="mt-6 p-5 sm:p-6">
                    <div
                      className="prose prose-lg max-w-none text-black prose-headings:text-black prose-p:text-black prose-strong:text-black prose-li:text-black prose-headings:font-black prose-a:text-blue-700"
                      dangerouslySetInnerHTML={{ __html: sanitized }}
                    />
                  </div>
                </div>
              </article>
            </section>
          </div>

          {/* Sticky sidebar */}
          <aside className="w-full lg:w-80 shrink-0 lg:sticky lg:top-4 h-fit">
            <PreviewMostReadSidebar />
          </aside>
        </div>
      </div>
    </div>
  );
}

