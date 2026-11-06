import { BadRequestException, Injectable } from '@nestjs/common'
import { getSchema } from '@tiptap/core'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import { TableKit } from '@tiptap/extension-table'
import TaskItem from '@tiptap/extension-task-item'
import TaskList from '@tiptap/extension-task-list'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import StarterKit from '@tiptap/starter-kit'
import { prosemirrorToYDoc, yDocToProsemirrorJSON } from 'y-prosemirror'
import * as Y from 'yjs'
import type { DocumentJson } from '../../database/schema'

export const EDITOR_FIELD = 'default'

@Injectable()
export class YjsService {
  private readonly schema = getSchema([
    StarterKit.configure({ undoRedo: false, link: false, underline: false }),
    Underline,
    Link.configure({ openOnClick: false }),
    Image.configure({ inline: false, allowBase64: false }),
    TableKit.configure({ table: { resizable: false } }),
    TaskList,
    TaskItem.configure({ nested: true }),
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
  ])

  createDocument(content: DocumentJson): Y.Doc {
    const node = this.parseContent(content)
    return prosemirrorToYDoc(node, EDITOR_FIELD)
  }

  toDocumentJson(document: Y.Doc): DocumentJson {
    return yDocToProsemirrorJSON(document, EDITOR_FIELD) as DocumentJson
  }

  validateContent(content: unknown): DocumentJson {
    if (!content || typeof content !== 'object' || Array.isArray(content)) {
      throw new BadRequestException('Document content must be a TipTap document object.')
    }

    return this.parseContent(content as DocumentJson).toJSON() as DocumentJson
  }

  validateUpdate(update: Uint8Array): void {
    const probe = new Y.Doc()
    try {
      Y.applyUpdate(probe, update)
    } finally {
      probe.destroy()
    }
  }

  hasChanges(update: Uint8Array): boolean {
    const decoded = Y.decodeUpdate(update)
    return decoded.structs.length > 0 || decoded.ds.clients.size > 0
  }

  private parseContent(content: DocumentJson) {
    try {
      const node = this.schema.nodeFromJSON(content)
      node.check()
      return node
    } catch {
      throw new BadRequestException('The document content does not match the supported editor format.')
    }
  }
}
