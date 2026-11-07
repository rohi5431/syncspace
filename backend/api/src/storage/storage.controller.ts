import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Res,
  UploadedFile,
  UseInterceptors,
  HttpException,
  HttpStatus,
  Logger,
  UseGuards,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { Response } from 'express'
import { StorageService } from './storage.service'
import { memoryStorage } from 'multer'
import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { WorkspaceMembershipGuard } from '../auth/workspace-membership.guard'

@UseGuards(JwtAuthGuard, WorkspaceMembershipGuard)
@Controller('api/documents/:documentId/files')
export class StorageController {
  private readonly logger = new Logger(StorageController.name)

  constructor(private readonly storageService: StorageService) {}

  /**
   * POST /api/documents/:documentId/files/upload
   * Upload a file attachment to a document (stored in MongoDB GridFS).
   */
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB limit
    }),
  )
  async upload(
    @Param('documentId') documentId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new HttpException('No file provided', HttpStatus.BAD_REQUEST)
    }

    if (!this.storageService.isAvailable()) {
      throw new HttpException(
        'File storage (MongoDB) is not available. Check MONGODB_URI in your .env',
        HttpStatus.SERVICE_UNAVAILABLE,
      )
    }

    try {
      const result = await this.storageService.uploadFile(
        documentId,
        file.originalname,
        file.mimetype,
        file.buffer,
      )
      this.logger.log(`Uploaded file "${file.originalname}" for document ${documentId}`)
      return {
        ...result,
        documentId,
        downloadUrl: `/api/documents/${documentId}/files/${result.fileId}`,
      }
    } catch (err: any) {
      throw new HttpException(`Upload failed: ${err.message}`, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }

  /**
   * GET /api/documents/:documentId/files
   * List all file attachments for a document.
   */
  @Get()
  async listFiles(@Param('documentId') documentId: string) {
    const files = await this.storageService.listFiles(documentId)
    return {
      documentId,
      count: files.length,
      files: files.map((f) => ({
        ...f,
        downloadUrl: `/api/documents/${documentId}/files/${f.fileId}`,
      })),
    }
  }

  /**
   * GET /api/documents/:documentId/files/:fileId
   * Stream/download a specific file attachment.
   */
  @Get(':fileId')
  async downloadFile(
    @Param('documentId') documentId: string,
    @Param('fileId') fileId: string,
    @Res() res: Response,
  ) {
    if (!this.storageService.isAvailable()) {
      throw new HttpException('File storage (MongoDB) is not available', HttpStatus.SERVICE_UNAVAILABLE)
    }

    try {
      // Look up file metadata to set correct Content-Type
      const files = await this.storageService.listFiles(documentId)
      const meta = files.find((f) => f.fileId === fileId)

      if (meta) {
        res.set({
          'Content-Type': meta.mimetype,
          'Content-Disposition': `inline; filename="${meta.filename}"`,
          'Content-Length': String(meta.size),
        })
      }

      const stream = this.storageService.getFileStream(fileId)
      stream.pipe(res)
    } catch (err: any) {
      throw new HttpException(`File not found: ${err.message}`, HttpStatus.NOT_FOUND)
    }
  }

  /**
   * DELETE /api/documents/:documentId/files/:fileId
   * Delete a file attachment from GridFS.
   */
  @Delete(':fileId')
  async deleteFile(
    @Param('documentId') documentId: string,
    @Param('fileId') fileId: string,
  ) {
    if (!this.storageService.isAvailable()) {
      throw new HttpException('File storage (MongoDB) is not available', HttpStatus.SERVICE_UNAVAILABLE)
    }

    try {
      await this.storageService.deleteFile(fileId)
      this.logger.log(`Deleted file ${fileId} from document ${documentId}`)
      return { success: true, fileId, documentId }
    } catch (err: any) {
      throw new HttpException(`Delete failed: ${err.message}`, HttpStatus.INTERNAL_SERVER_ERROR)
    }
  }
}
