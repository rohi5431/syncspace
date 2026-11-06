import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCaret from '@tiptap/extension-collaboration-caret'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { TableKit } from '@tiptap/extension-table'
import TaskItem from '@tiptap/extension-task-item'
import TaskList from '@tiptap/extension-task-list'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import StarterKit from '@tiptap/starter-kit'
import type { YjsWebSocketProvider } from './yjs-websocket-provider'

function createBaseExtensions() {
  return [
    StarterKit.configure({ undoRedo: false, link: false, underline: false }),
    Underline,
    Link.configure({ openOnClick: false, autolink: true }),
    Image.configure({ inline: false, allowBase64: false }),
    TableKit.configure({ table: { resizable: false } }),
    TaskList,
    TaskItem.configure({ nested: true }),
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    Placeholder.configure({
      placeholder: 'Start writing your document…',
      includeChildren: true,
    }),
  ]
}

export function createDocumentExtensions(provider?: YjsWebSocketProvider) {
  const baseExtensions = createBaseExtensions()
  if (!provider) return baseExtensions

  return [
    ...baseExtensions,
    Collaboration.configure({ document: provider.document, field: 'default', provider }),
    CollaborationCaret.configure({ provider, user: provider.currentUser }),
  ]
}
