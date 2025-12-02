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
            // Core editing features
            'anchor', 'autolink', 'charmap', 'codesample', 'emoticons', 'link', 'lists', 'media', 'searchreplace', 'table', 'visualblocks', 'wordcount',
            // Your account includes a free trial of TinyMCE premium features
            // Try the most popular premium features until Dec 6, 2025:
            'checklist', 'mediaembed', 'casechange', 'formatpainter', 'pageembed', 'a11ychecker', 'tinymcespellchecker', 'permanentpen', 'powerpaste', 'advtable', 'advcode', 'advtemplate', 'ai', 'uploadcare', 'mentions', 'tinycomments', 'tableofcontents', 'footnotes', 'mergetags', 'autocorrect', 'typography', 'inlinecss', 'markdown', 'importword', 'exportword', 'exportpdf'
          ],
          toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link media table mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography uploadcare | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat',
          tinycomments_mode: 'embedded',
          tinycomments_author: 'Author name',
          mergetags_list: [
            { value: 'First.Name', title: 'First Name' },
            { value: 'Email', title: 'Email' },
          ],
          ai_request: (request: any, respondWith: any) => respondWith.string(() => Promise.reject('See docs to implement AI Assistant')),
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
