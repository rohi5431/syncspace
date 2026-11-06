import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common'
import mongoose, { Connection } from 'mongoose'
import { Readable } from 'stream'

@Injectable()
export class StorageService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(StorageService.name)
  private connection: Connection | null = null
  private bucket: InstanceType<typeof mongoose.mongo.GridFSBucket> | null = null

  async onModuleInit() {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/syncspace'
    try {
      await mongoose.connect(uri)
      this.connection = mongoose.connection
      this.bucket = new mongoose.mongo.GridFSBucket(this.connection.db!, {
        bucketName: 'documents',
      })
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
