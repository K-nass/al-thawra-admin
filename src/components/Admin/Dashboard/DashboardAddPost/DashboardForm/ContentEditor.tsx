import { Editor } from '@tinymce/tinymce-react';
import type { ArticleInitialStateInterface } from "./usePostReducer/postData";
import type { ChangeEvent } from "react";

interface ContentEditorProps {
  state: ArticleInitialStateInterface;
  handleChange: (e: any) => void;
  errors?: Record<string, string[]>;
}

export default function ContentEditor({ state, handleChange, errors = {} }: ContentEditorProps) {
  return (
    <div className="space-y-1.5" data-error-field={errors.content ? "content" : undefined}>
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
        Content <span className="text-rose-500 ml-1 font-bold">*</span>
      </label>
      <div className={`border rounded-2xl overflow-hidden transition-all ${
        errors.content ? 'border-rose-200 ring-4 ring-rose-500/5' : 'border-slate-200'
      }`}>
      <Editor
        apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
        value={state.content}
        onEditorChange={(content) => {
          handleChange({
            target: {
              name: 'content',
              value: content,
              type: 'textarea'
            }
          });
        }}
        init={{
          height: 500,
          menubar: true,
          plugins: [
            'anchor', 'autolink', 'charmap', 'codesample', 'emoticons', 'link', 'lists', 'media', 'searchreplace', 'table', 'visualblocks', 'wordcount'
          ],
          toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link media table | align lineheight | numlist bullist indent outdent | emoticons charmap | removeformat',
          uploadcare_public_key: import.meta.env.VITE_UPLOADCARE_PUBLIC_KEY,
        }}
      />
      </div>
      {errors.content && (
        <div className="mt-2 space-y-1 ml-1">
          {errors.content.map((error, idx) => (
            <p key={idx} className="text-rose-500 text-[10px] font-black uppercase tracking-tight">{error}</p>
          ))}
        </div>
      )}
    </div>
  );
}
