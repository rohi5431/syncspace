import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common'
import type { Request, Response } from 'express'

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp()
    const request = context.getRequest<Request>()
    const response = context.getResponse<Response>()
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR
    const exceptionResponse = exception instanceof HttpException ? exception.getResponse() : null
    const responseObject = typeof exceptionResponse === 'object' && exceptionResponse !== null
      ? exceptionResponse as { message?: string | string[]; error?: string }
      : null
    const message = status >= 500
      ? 'An unexpected error occurred.'
      : responseObject?.message ?? (typeof exceptionResponse === 'string' ? exceptionResponse : 'Request failed.')

    response.status(status).json({
      statusCode: status,
      message,
      error: status >= 500 ? 'Internal Server Error' : responseObject?.error ?? 'Request failed',
      timestamp: new Date().toISOString(),
      path: request.originalUrl,
    })
  }
}
