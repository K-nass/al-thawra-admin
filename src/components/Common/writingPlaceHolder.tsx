import React from "react";

interface Props {
  text: string;
}

export default function WritingPlaceHolder({ text }: Props) {
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg" className="rounded-2xl shadow-sm">
      <rect width="100%" height="100%" fill="#f8fafc" rx="12" />

      <text
        x="50%"
        y="50%"
        dominant-baseline="middle"
        text-anchor="middle"
        font-size="14"
        font-family="Tahoma, Arial, sans-serif"
        font-weight="600"
        fill="#64748b"
        direction="rtl"
        unicode-bidi="bidi-override"
      >
        {text}
      </text>
    </svg>
  );
}
