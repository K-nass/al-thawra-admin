import { User, PenLine } from 'lucide-react';
import type { CSSProperties } from 'react';

interface ArticleImageFallbackProps {
  className?: string;
  style?: CSSProperties;
  writerImageUrl?: string | null;
  writerName?: string;
}

export default function ArticleImageFallback({
  className = "",
  style,
  writerImageUrl,
  writerName,
}: ArticleImageFallbackProps) {
  const hasWriter = writerImageUrl !== undefined;

  return (
    <div
      className={`relative overflow-hidden flex flex-col ${className}`}
      style={{
        background: 'linear-gradient(135deg, #1a2a3a 0%, #0f3460 40%, #16213e 100%)',
        ...style,
      }}
    >
      {/* ── Decorative noise / grain overlay ─────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: '128px',
        }}
      />

      {/* ── Accent glow circle — top right ───────────────────────────── */}
      <div
        className="absolute -top-12 -end-12 w-40 h-40 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(99,179,237,0.18) 0%, transparent 70%)' }}
      />
      {/* ── Accent glow circle — bottom left ─────────────────────────── */}
      <div
        className="absolute -bottom-10 -start-10 w-36 h-36 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(129,140,248,0.14) 0%, transparent 70%)' }}
      />

      {/* ── Header: logo + badge ──────────────────────────────────────── */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-4 pb-2">
        <img
          src="/icon.jpg"
          alt=""
          className="h-15 w-auto object-contain rounded-lg"
        />
        <span
          className="flex items-center gap-1 text-[15px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border"
          style={{
            color: 'rgba(147,210,255,0.9)',
            borderColor: 'rgba(147,210,255,0.2)',
            background: 'rgba(147,210,255,0.07)',
            letterSpacing: '0.15em',
          }}
        >
          <PenLine size={9} />
          كتابة
        </span>
      </div>

      {/* ── Divider ───────────────────────────────────────────────────── */}
      <div
        className="relative z-10 mx-5 mb-1"
        style={{ height: 1, background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.12), transparent)' }}
      />

      {/* ── Default mode: article SVG ─────────────────────────────────── */}
      {!hasWriter && (
        <div className="relative z-10 flex-1 flex items-center justify-center px-6 pb-5">
          <img
            src="/article.svg"
            alt=""
            className="h-full w-auto max-w-[50%] object-contain opacity-30"
          />
        </div>
      )}

      {/* ── Writer mode ───────────────────────────────────────────────── */}
      {hasWriter && (
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center gap-4 px-6 pb-6">

          {/* Photo with ring + glow */}
          <div className="relative">
            {/* Outer glow ring */}
            <div
              className="absolute inset-0 rounded-xl -m-1.5"
              style={{ background: 'linear-gradient(135deg, rgba(99,179,237,0.4), rgba(129,140,248,0.3))', filter: 'blur(8px)' }}
            />
            {/* Photo frame */}
            <div
              className="relative w-24 h-24 rounded-xl overflow-hidden border"
              style={{ borderColor: 'rgba(255,255,255,0.25)', boxShadow: '0 8px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.15)' }}
            >
              {writerImageUrl ? (
                <img
                  src={writerImageUrl}
                  alt={writerName || ''}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const el = e.currentTarget as HTMLImageElement;
                    el.style.display = 'none';
                    const parent = el.parentElement!;
                    parent.classList.add('flex', 'items-center', 'justify-center');
                  }}
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.08)' }}
                >
                  <User size={36} style={{ color: 'rgba(255,255,255,0.4)' }} />
                </div>
              )}
            </div>
          </div>

          {/* Name + label */}
          {writerName ? (
            <div className="text-center space-y-1">
              <p
                className="text-white font-bold text-base leading-tight tracking-tight line-clamp-2"
                dir="auto"
                style={{ textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}
              >
                {writerName}
              </p>
              <p
                className="text-xs font-semibold uppercase tracking-[0.18em]"
                style={{ color: 'rgba(147,210,255,0.7)' }}
              >
                كاتب المقال
              </p>
            </div>
          ) : (
            <div className="text-center space-y-1">
              <div
                className="w-28 h-3 rounded-full mx-auto"
                style={{ background: 'rgba(255,255,255,0.1)' }}
              />
              <div
                className="w-16 h-2.5 rounded-full mx-auto"
                style={{ background: 'rgba(255,255,255,0.07)' }}
              />
            </div>
          )}
        </div>
      )}

      {/* ── Bottom shimmer line ───────────────────────────────────────── */}
      <div
        className="absolute bottom-0 inset-x-0 h-px pointer-events-none"
        style={{ background: 'linear-gradient(to right, transparent, rgba(99,179,237,0.4), transparent)' }}
      />
    </div>
  );
}