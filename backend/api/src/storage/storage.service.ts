import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common'
import mongoose, { Connection } from 'mongoose'
import { Readable } from 'stream'

@Injectable()
export class StorageService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(StorageService.name)
  private connection: Connection | null = null
  private bucket: InstanceType<typeof mongoose.mongo.GridFSBucket> | null = null
  private lastSuccessfulHealthCheck: Date | null = null

  async onModuleInit() {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/syncspace'
    try {
      await mongoose.connect(uri)
      this.connection = mongoose.connection
      this.bucket = new mongoose.mongo.GridFSBucket(this.connection.db!, {
        bucketName: 'documents',
      })
      this.lastSuccessfulHealthCheck = new Date()
      this.logger.log('MongoDB GridFS connected for document storage')
    } catch (err: any) {
      this.logger.warn(`MongoDB GridFS unavailable: ${err.message}`)
    }
  }

  async onModuleDestroy() {
    if (this.connection) {
      await mongoose.disconnect()
    }
  }

  isAvailable(): boolean {
    return this.bucket !== null
  }

  async getAdminStorageSnapshot() {
    if (!this.connection?.db || !this.bucket) {
      return {
        status: process.env.MONGODB_URI ? 'unavailable' as const : 'unknown' as const,
        totalBytes: null,
        fileCount: null,
        lastSuccessfulHealthCheck: this.lastSuccessfulHealthCheck?.toISOString() ?? null,
      }
    }
    try {
      const result = await this.connection.db.collection('documents.files').aggregate<{
        totalBytes: number
        fileCount: number
      }>([
        { $group: { _id: null, totalBytes: { $sum: '$length' }, fileCount: { $sum: 1 } } },
      ]).toArray()
      this.lastSuccessfulHealthCheck = new Date()
      return {
        status: 'healthy' as const,
        totalBytes: result[0]?.totalBytes ?? 0,
        fileCount: result[0]?.fileCount ?? 0,
        lastSuccessfulHealthCheck: this.lastSuccessfulHealthCheck.toISOString(),
      }
    } catch (error) {
      this.logger.warn(`Could not read GridFS storage statistics: ${error instanceof Error ? error.message : String(error)}`)
      return {
        status: 'degraded' as const,
        totalBytes: null,
        fileCount: null,
        lastSuccessfulHealthCheck: this.lastSuccessfulHealthCheck?.toISOString() ?? null,
      }
    }
  }

  async getWorkspaceStorageSnapshot(documentIds: string[]) {
    if (!this.bucket) {
      return {
        status: process.env.MONGODB_URI ? 'unavailable' as const : 'unknown' as const,
        totalBytes: null,
        fileCount: null,
      }
    }
    if (documentIds.length === 0) return { status: 'healthy' as const, totalBytes: 0, fileCount: 0 }
    try {
      const files = await this.bucket.find({ 'metadata.documentId': { $in: documentIds } }).toArray()
      return {
        status: 'healthy' as const,
        totalBytes: files.reduce((total, file) => total + file.length, 0),
        fileCount: files.length,
      }
    } catch (error) {
      this.logger.warn(`Could not read workspace GridFS usage: ${error instanceof Error ? error.message : String(error)}`)
      return { status: 'degraded' as const, totalBytes: null, fileCount: null }
    }
  }

  /**
   * Upload a file buffer into GridFS under a given document ID.
   * Returns the GridFS file ID as a string.
   */
  async uploadFile(
    documentId: string,
    originalname: string,
    mimetype: string,
    buffer: Buffer,
  ): Promise<{ fileId: string; filename: string; size: number; mimetype: string }> {
    if (!this.bucket) {
      throw new Error('MongoDB GridFS is not available')
    }

    const filename = `${documentId}__${Date.now()}__${originalname}`

    return new Promise((resolve, reject) => {
      const uploadStream = this.bucket!.openUploadStream(filename, {
        metadata: { documentId, originalname, mimetype },
      })

      const readable = Readable.from(buffer)
      readable.pipe(uploadStream)

      uploadStream.on('finish', () => {
        resolve({
          fileId: uploadStream.id.toString(),
          filename: originalname,
          size: buffer.length,
          mimetype,
        })
      })

      uploadStream.on('error', reject)
    })
  }

  /**
   * Stream a file from GridFS by its file ID.
   */
  getFileStream(fileId: string): NodeJS.ReadableStream {
    if (!this.bucket) {
      throw new Error('MongoDB GridFS is not available')
    }
    const objectId = new mongoose.Types.ObjectId(fileId)
    return this.bucket.openDownloadStream(objectId)
  }

  /**
   * List all files attached to a given document ID.
   */
  async listFiles(documentId: string): Promise<
    Array<{ fileId: string; filename: string; size: number; mimetype: string; uploadedAt: Date }>
  > {
    if (!this.bucket) return []
    const cursor = this.bucket.find({ 'metadata.documentId': documentId })
    const files = await cursor.toArray()
    return files.map((f) => ({
      fileId: f._id.toString(),
      filename: f.metadata?.originalname || f.filename,
      size: f.length,
      mimetype: f.metadata?.mimetype || 'application/octet-stream',
      uploadedAt: f.uploadDate,
    }))
  }

  /**
   * Delete a file from GridFS by its file ID.
   */
  async deleteFile(fileId: string): Promise<void> {
    if (!this.bucket) {
      throw new Error('MongoDB GridFS is not available')
    }
    const objectId = new mongoose.Types.ObjectId(fileId)
    await this.bucket.delete(objectId)
  }
}
