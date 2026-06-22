import React from 'react'
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { Sparkles, Edit2, WrapText, AlignLeft } from 'lucide-react'

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
}

export function RichTextEditor({ content, onChange, placeholder = 'Start typing...' }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none min-h-[300px] text-foreground',
      },
    },
  })

  if (!editor) {
    return null
  }

  return (
    <div className="relative w-full h-full">
      {editor && (
        <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }} className="flex bg-background border rounded-lg shadow-lg overflow-hidden">
          <button className="px-3 py-1.5 text-sm font-medium hover:bg-muted text-foreground flex items-center gap-1.5 transition-colors border-r">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            AI Rewrite
          </button>
          <button className="px-3 py-1.5 text-sm font-medium hover:bg-muted text-foreground flex items-center gap-1.5 transition-colors border-r">
            <WrapText className="w-3.5 h-3.5" />
            Expand
          </button>
          <button className="px-3 py-1.5 text-sm font-medium hover:bg-muted text-foreground flex items-center gap-1.5 transition-colors">
            <AlignLeft className="w-3.5 h-3.5" />
            Summarize
          </button>
        </BubbleMenu>
      )}
      
      <div className="p-4 sm:p-8 bg-card rounded-xl border min-h-[500px]">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
