'use client'

import { useEffect, useState } from 'react'
import type { Editor } from '@tiptap/react'
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Braces,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  ListTodo,
  Minus,
  Redo2,
  Strikethrough,
  Table2,
  Underline,
  Undo2,
  Quote,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { cn } from '@/lib/utils'

type EditorToolbarProps = {
  editor: Editor
  disabled: boolean
}

export function EditorToolbar({ editor, disabled }: EditorToolbarProps) {
  const [linkOpen, setLinkOpen] = useState(false)
  const [imageOpen, setImageOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [imageAlt, setImageAlt] = useState('')
  const [formError, setFormError] = useState('')
  const [, setEditorRevision] = useState(0)

  useEffect(() => {
    const refreshToolbar = () => setEditorRevision((revision) => revision + 1)
    editor.on('transaction', refreshToolbar)
    editor.on('selectionUpdate', refreshToolbar)
    return () => {
      editor.off('transaction', refreshToolbar)
      editor.off('selectionUpdate', refreshToolbar)
    }
  }, [editor])

  function openLinkDialog() {
    setLinkUrl(editor.getAttributes('link').href ?? '')
    setFormError('')
    setLinkOpen(true)
  }

  function submitLink(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const href = normalizeLink(linkUrl)
    if (!href) {
      setFormError('Enter a valid https://, http://, or mailto: link.')
      return
    }
    editor.chain().focus().setLink({ href }).run()
    setLinkOpen(false)
  }

  function submitImage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const src = normalizeImageUrl(imageUrl)
    if (!src) {
      setFormError('Enter a valid http:// or https:// image URL.')
      return
    }
    editor.chain().focus().setImage({ src, alt: imageAlt.trim() }).run()
    setImageOpen(false)
    setImageUrl('')
    setImageAlt('')
  }

  function setBlock(value: string) {
    if (value === 'paragraph') editor.chain().focus().setParagraph().run()
    else editor.chain().focus().setHeading({ level: Number(value.slice(-1)) as 1 | 2 | 3 }).run()
  }

  const handleImeEnter = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && (event.nativeEvent.isComposing || event.keyCode === 229)) event.preventDefault()
  }
  const heading = editor.isActive('heading', { level: 1 })
    ? 'heading-1'
    : editor.isActive('heading', { level: 2 })
      ? 'heading-2'
      : editor.isActive('heading', { level: 3 })
        ? 'heading-3'
        : 'paragraph'

  return (
    <>
      <div role="toolbar" aria-label="Document formatting" aria-orientation="horizontal" className="flex flex-wrap items-center gap-1 border-b border-border bg-white px-2 py-2 sm:px-3">
        <label htmlFor="document-block-style" className="sr-only">Text style</label>
        <select
          id="document-block-style"
          aria-label="Text style"
          value={heading}
          disabled={disabled}
          onChange={(event) => setBlock(event.currentTarget.value)}
          className="h-8 w-[7.2rem] rounded-lg border border-transparent bg-transparent px-2 text-sm text-foreground outline-none transition hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/40 disabled:opacity-50"
        >
          <option value="paragraph">Paragraph</option>
          <option value="heading-1">Heading 1</option>
          <option value="heading-2">Heading 2</option>
          <option value="heading-3">Heading 3</option>
        </select>
        <ToolbarDivider />
        <ToolbarButton label="Bold" active={editor.isActive('bold')} disabled={disabled} onClick={() => editor.chain().focus().toggleBold().run()}><Bold /></ToolbarButton>
        <ToolbarButton label="Italic" active={editor.isActive('italic')} disabled={disabled} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic /></ToolbarButton>
        <ToolbarButton label="Underline" active={editor.isActive('underline')} disabled={disabled} onClick={() => editor.chain().focus().toggleUnderline().run()}><Underline /></ToolbarButton>
        <ToolbarButton label="Strikethrough" active={editor.isActive('strike')} disabled={disabled} onClick={() => editor.chain().focus().toggleStrike().run()}><Strikethrough /></ToolbarButton>
        <ToolbarButton label="Inline code" active={editor.isActive('code')} disabled={disabled} onClick={() => editor.chain().focus().toggleCode().run()}><Braces /></ToolbarButton>
        <ToolbarDivider />
        <ToolbarButton label="Bulleted list" active={editor.isActive('bulletList')} disabled={disabled} onClick={() => editor.chain().focus().toggleBulletList().run()}><List /></ToolbarButton>
        <ToolbarButton label="Numbered list" active={editor.isActive('orderedList')} disabled={disabled} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered /></ToolbarButton>
        <ToolbarButton label="Task list" active={editor.isActive('taskList')} disabled={disabled} onClick={() => editor.chain().focus().toggleTaskList().run()}><ListTodo /></ToolbarButton>
        <ToolbarButton label="Quote" active={editor.isActive('blockquote')} disabled={disabled} onClick={() => editor.chain().focus().toggleBlockquote().run()}><Quote /></ToolbarButton>
        <ToolbarButton label="Code block" active={editor.isActive('codeBlock')} disabled={disabled} onClick={() => editor.chain().focus().toggleCodeBlock().run()}><Braces /></ToolbarButton>
        <ToolbarDivider />
        <ToolbarButton label="Add link" active={editor.isActive('link')} disabled={disabled} onClick={openLinkDialog}><Link2 /></ToolbarButton>
        <ToolbarButton label="Add image" active={editor.isActive('image')} disabled={disabled} onClick={() => { setFormError(''); setImageOpen(true) }}><ImagePlus /></ToolbarButton>
        <ToolbarButton label="Insert 3 by 3 table" active={editor.isActive('table')} disabled={disabled} onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}><Table2 /></ToolbarButton>
        <ToolbarButton label="Insert divider" active={false} disabled={disabled} onClick={() => editor.chain().focus().setHorizontalRule().run()}><Minus /></ToolbarButton>
        <ToolbarDivider />
        <ToolbarButton label="Align left" active={editor.isActive({ textAlign: 'left' })} disabled={disabled} onClick={() => editor.chain().focus().setTextAlign('left').run()}><AlignLeft /></ToolbarButton>
        <ToolbarButton label="Align center" active={editor.isActive({ textAlign: 'center' })} disabled={disabled} onClick={() => editor.chain().focus().setTextAlign('center').run()}><AlignCenter /></ToolbarButton>
        <ToolbarButton label="Align right" active={editor.isActive({ textAlign: 'right' })} disabled={disabled} onClick={() => editor.chain().focus().setTextAlign('right').run()}><AlignRight /></ToolbarButton>
        <ToolbarButton label="Justify" active={editor.isActive({ textAlign: 'justify' })} disabled={disabled} onClick={() => editor.chain().focus().setTextAlign('justify').run()}><AlignJustify /></ToolbarButton>
        <ToolbarDivider />
        <ToolbarButton label="Undo" active={false} disabled={disabled || !editor.can().undo()} onClick={() => editor.chain().focus().undo().run()}><Undo2 /></ToolbarButton>
        <ToolbarButton label="Redo" active={false} disabled={disabled || !editor.can().redo()} onClick={() => editor.chain().focus().redo().run()}><Redo2 /></ToolbarButton>
      </div>

      <Modal
        open={linkOpen}
        onClose={() => setLinkOpen(false)}
        title="Add a link"
        description="Links are shared with everyone who can access this document."
      >
        <form onSubmit={submitLink} className="flex flex-col gap-5">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="document-link-url">Link address</FieldLabel>
              <Input
                id="document-link-url"
                type="text"
                value={linkUrl}
                onChange={(event) => setLinkUrl(event.currentTarget.value)}
                onKeyDown={handleImeEnter}
                placeholder="https://example.com"
                autoComplete="url"
                required
              />
              <FieldDescription>Use a secure web address or a mailto: link.</FieldDescription>
            </Field>
            {formError && <p role="alert" className="text-sm text-error">{formError}</p>}
          </FieldGroup>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setLinkOpen(false)}>Cancel</Button>
            {editor.isActive('link') && <Button type="button" variant="ghost" onClick={() => { editor.chain().focus().unsetLink().run(); setLinkOpen(false) }}>Remove link</Button>}
            <Button type="submit">Apply link</Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={imageOpen}
        onClose={() => setImageOpen(false)}
        title="Add an image"
        description="Images are inserted by URL. Add a description for screen readers, or leave it blank if the image is decorative."
        size="md"
      >
        <form onSubmit={submitImage} className="flex flex-col gap-5">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="document-image-url">Image address</FieldLabel>
              <Input
                id="document-image-url"
                type="url"
                value={imageUrl}
                onChange={(event) => setImageUrl(event.currentTarget.value)}
                onKeyDown={handleImeEnter}
                placeholder="https://images.example.com/photo.jpg"
                autoComplete="url"
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="document-image-alt">Image description</FieldLabel>
              <Input
                id="document-image-alt"
                value={imageAlt}
                onChange={(event) => setImageAlt(event.currentTarget.value)}
                onKeyDown={handleImeEnter}
                placeholder="A short description"
                maxLength={240}
              />
              <FieldDescription>Describe the image, or leave blank when it is purely decorative.</FieldDescription>
            </Field>
            {formError && <p role="alert" className="text-sm text-error">{formError}</p>}
          </FieldGroup>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setImageOpen(false)}>Cancel</Button>
            <Button type="submit"><ImagePlus aria-hidden="true" />Insert image</Button>
          </div>
        </form>
      </Modal>
    </>
  )
}

function ToolbarButton({
  label,
  active,
  disabled,
  onClick,
  children,
}: {
  label: string
  active: boolean
  disabled: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <Button
      type="button"
      variant={active ? 'secondary' : 'ghost'}
      size="icon-sm"
      aria-label={label}
      aria-pressed={active}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(active && 'bg-accent text-primary')}
    >
      {children}
    </Button>
  )
}

function ToolbarDivider() {
  return <span aria-hidden="true" className="mx-0.5 h-5 w-px bg-border" />
}

function normalizeLink(value: string): string | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  const candidate = /^(https?:|mailto:)/i.test(trimmed) ? trimmed : `https://${trimmed}`
  try {
    const url = new URL(candidate)
    return ['http:', 'https:', 'mailto:'].includes(url.protocol) ? url.href : null
  } catch {
    return null
  }
}

function normalizeImageUrl(value: string): string | null {
  try {
    const url = new URL(value.trim())
    return ['http:', 'https:'].includes(url.protocol) ? url.href : null
  } catch {
    return null
  }
}
