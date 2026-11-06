import { jest } from '@jest/globals'
import { BadRequestException } from '@nestjs/common'
import * as Y from 'yjs'
import { YjsService } from './yjs.service'

const validContent = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [{ type: 'text', text: 'A shared document' }],
    },
  ],
}

describe('YjsService', () => {
  let service: YjsService

  beforeEach(() => {
    jest.clearAllMocks()
    service = new YjsService()
  })

  it('converts supported editor JSON into a recoverable Yjs document', () => {
    const document = service.createDocument(validContent)
    const recovered = service.toDocumentJson(document)

    expect(JSON.stringify(recovered)).toContain('A shared document')
    document.destroy()
  })

  it('rejects editor content that does not match the supported schema', () => {
    expect(() => service.validateContent({ type: 'doc', content: [{ type: 'unknown-node' }] }))
      .toThrow(BadRequestException)
  })

  it('validates binary updates and ignores empty CRDT updates', () => {
    const source = new Y.Doc()
    source.getText('content').insert(0, 'durable update')
    const update = Y.encodeStateAsUpdate(source)

    expect(() => service.validateUpdate(update)).not.toThrow()
    expect(service.hasChanges(update)).toBe(true)

    const empty = Y.encodeStateAsUpdate(new Y.Doc())
    expect(service.hasChanges(empty)).toBe(false)
    source.destroy()
  })

  it('merges concurrent edits from independent clients without dropping either change', () => {
    const base = new Y.Doc()
    base.getText('content').insert(0, 'Plan')
    const baseUpdate = Y.encodeStateAsUpdate(base)
    const firstClient = new Y.Doc()
    const secondClient = new Y.Doc()
    Y.applyUpdate(firstClient, baseUpdate)
    Y.applyUpdate(secondClient, baseUpdate)

    firstClient.getText('content').insert(4, ' one')
    secondClient.getText('content').insert(4, ' two')
    const firstUpdate = Y.encodeStateAsUpdate(firstClient, Y.encodeStateVector(base))
    const secondUpdate = Y.encodeStateAsUpdate(secondClient, Y.encodeStateVector(base))
    Y.applyUpdate(firstClient, secondUpdate)
    Y.applyUpdate(secondClient, firstUpdate)

    expect(firstClient.getText('content').toString()).toBe(secondClient.getText('content').toString())
    expect(firstClient.getText('content').toString()).toContain('one')
    expect(firstClient.getText('content').toString()).toContain('two')

    base.destroy()
    firstClient.destroy()
    secondClient.destroy()
  })
})
