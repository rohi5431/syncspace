import { createHash } from 'node:crypto'
import { Injectable } from '@nestjs/common'
import { and, asc, desc, eq, gte } from 'drizzle-orm'
import * as Y from 'yjs'
import { DatabaseService } from '../../database/database.service'
import {
  documentSnapshots,
  documentUpdates,
  documents,
  type DocumentJson,
} from '../../database/schema'
import { YjsService } from '../collaboration/yjs.service'

@Injectable()
export class DocumentPersistenceService {
  constructor(
    private readonly database: DatabaseService,
    private readonly yjs: YjsService,
  ) {}

  async load(input: {
    documentId: string
    legacyContent: DocumentJson
    createdById: string
  }): Promise<{ document: Y.Doc; updateCountSinceSnapshot: number }> {
    const [snapshot] = await this.database.db
      .select({ snapshotData: documentSnapshots.snapshotData, createdAt: documentSnapshots.createdAt })
      .from(documentSnapshots)
      .where(eq(documentSnapshots.documentId, input.documentId))
      .orderBy(desc(documentSnapshots.createdAt), desc(documentSnapshots.id))
      .limit(1)

    const document = snapshot ? new Y.Doc() : this.yjs.createDocument(input.legacyContent)
    if (snapshot) Y.applyUpdate(document, snapshot.snapshotData)

    const updates = await this.database.db
      .select({ updateData: documentUpdates.updateData })
      .from(documentUpdates)
      .where(snapshot
        ? and(eq(documentUpdates.documentId, input.documentId), gte(documentUpdates.createdAt, snapshot.createdAt))
        : eq(documentUpdates.documentId, input.documentId))
      .orderBy(asc(documentUpdates.createdAt), asc(documentUpdates.id))

    for (const update of updates) Y.applyUpdate(document, update.updateData)

    if (!snapshot) {
      await this.createSnapshot(input.documentId, input.createdById, document, 0)
      return { document, updateCountSinceSnapshot: 0 }
    }

    return { document, updateCountSinceSnapshot: updates.length }
  }

  async appendUpdate(documentId: string, actorId: string, update: Uint8Array): Promise<boolean> {
    const updateHash = createHash('sha256').update(update).digest('hex')
    const inserted = await this.database.db
      .insert(documentUpdates)
      .values({
        documentId,
        actorId,
        updateData: Buffer.from(update),
        updateHash,
      })
      .onConflictDoNothing({ target: [documentUpdates.documentId, documentUpdates.updateHash] })
      .returning({ id: documentUpdates.id })

    return inserted.length > 0
  }

  async createSnapshot(
    documentId: string,
    createdById: string,
    document: Y.Doc,
    updateCount: number,
  ): Promise<void> {
    await this.database.db.insert(documentSnapshots).values({
      documentId,
      createdById,
      snapshotData: Buffer.from(Y.encodeStateAsUpdate(document)),
      stateVector: Buffer.from(Y.encodeStateVector(document)),
      updateCount,
    })
  }

  async flushDocumentJson(documentId: string, document: Y.Doc): Promise<void> {
    const content = this.yjs.toDocumentJson(document)
    await this.database.db
      .update(documents)
      .set({ content, updatedAt: new Date() })
      .where(and(eq(documents.id, documentId), eq(documents.isDeleted, false)))
  }
}
