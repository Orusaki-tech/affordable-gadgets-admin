import React, { useEffect, useRef } from 'react';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { OpenAPI } from '../api/core/OpenAPI';
import { request as __request } from '../api/core/request';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

function Toolbar({ editor }: { editor: Editor | null }) {
  if (!editor || editor.isDestroyed) return null;

  return (
    <div className="rich-editor-toolbar">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive('bold') ? 'is-active' : ''}
        title="Bold"
      >
        <strong>B</strong>
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive('italic') ? 'is-active' : ''}
        title="Italic"
      >
        <em>I</em>
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={editor.isActive('strike') ? 'is-active' : ''}
        title="Strikethrough"
      >
        <s>S</s>
      </button>
      <span className="toolbar-separator" />
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}
        title="Heading 1"
      >
        H1
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
        title="Heading 2"
      >
        H2
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}
        title="Heading 3"
      >
        H3
      </button>
      <span className="toolbar-separator" />
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive('bulletList') ? 'is-active' : ''}
        title="Bullet list"
      >
        • List
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={editor.isActive('orderedList') ? 'is-active' : ''}
        title="Ordered list"
      >
        1. List
      </button>
      <span className="toolbar-separator" />
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={editor.isActive('blockquote') ? 'is-active' : ''}
        title="Blockquote"
      >
        "
      </button>
      <button
        type="button"
        onClick={() => {
          const url = window.prompt('Link URL:');
          if (url) {
            editor.chain().focus().setLink({ href: url }).run();
          }
        }}
        className={editor.isActive('link') ? 'is-active' : ''}
        title="Link"
      >
        🔗
      </button>
      <span className="toolbar-separator" />
      <label className="toolbar-image-btn" title="Insert image">
        🖼
        <input
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            try {
              const formData = new FormData();
              formData.append('image', file);
              const res = await __request(OpenAPI, {
                method: 'POST',
                url: '/article-images/upload/',
                formData,
                mediaType: 'multipart/form-data',
              });
              const data = res as { image_url?: string };
              if (data.image_url && !editor.isDestroyed) {
                editor.chain().focus().setImage({ src: data.image_url }).run();
              }
            } catch (err) {
              alert(`Failed to upload image: ${(err as Error).message}`);
            }
            e.target.value = '';
          }}
        />
      </label>
    </div>
  );
}

export function RichTextEditor({ value, onChange, placeholder, disabled }: RichTextEditorProps) {
  // Track HTML we last pushed to/from the editor so external value updates
  // don't call setContent after TipTap has already destroyed its schema.
  const lastEmittedHtml = useRef(value || '');

  const editor = useEditor({
    // Avoid creating the editor during the first render pass (React 19 / Strict Mode).
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Image,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: placeholder || 'Start writing…' }),
    ],
    content: value || '',
    onUpdate: ({ editor: ed }) => {
      const html = ed.getHTML();
      lastEmittedHtml.current = html;
      onChange(html);
    },
    editable: !disabled,
  });

  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    if ((value || '') === lastEmittedHtml.current) return;
    lastEmittedHtml.current = value || '';
    try {
      editor.commands.setContent(value || '', { emitUpdate: false });
    } catch (err) {
      // TipTap can throw if the view/schema was torn down mid-update (modal close / remount).
      console.warn('RichTextEditor setContent skipped:', err);
    }
  }, [value, editor]);

  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    editor.setEditable(!disabled);
  }, [disabled, editor]);

  if (!editor) {
    return (
      <div className={`rich-editor-wrapper ${disabled ? 'is-disabled' : ''}`}>
        <div className="rich-editor-toolbar" aria-hidden />
        <div className="ProseMirror" style={{ minHeight: '8rem', opacity: 0.5 }}>
          Loading editor…
        </div>
      </div>
    );
  }

  return (
    <div className={`rich-editor-wrapper ${disabled ? 'is-disabled' : ''}`}>
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}

export default RichTextEditor;
