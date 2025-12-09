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
    <div className="border border-gray-200 rounded-md overflow-hidden" data-error-field={errors.content ? true : undefined}>
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
      {errors.content && (
        <ul className="mt-1 px-4 pb-2 space-y-1 bg-red-50">
          {errors.content.map((error, idx) => (
            <li key={idx} className="text-red-600 text-xs">• {error}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
