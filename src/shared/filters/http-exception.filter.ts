import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common'
import { Request, Response } from 'express'
import { CORRELATION_ID_HEADER } from '../interceptors/correlation-id.interceptor'

/**
 * Global HTTP exception filter
 * Provides standardized error responses
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name)

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    const correlationId = response.getHeader(CORRELATION_ID_HEADER) || 'unknown'

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR
    let message = 'Internal server error'
    let error = 'Internal Server Error'

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus()
      const exceptionResponse = exception.getResponse()

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse
      } else if (typeof exceptionResponse === 'object') {
        const resp = exceptionResponse as any
        message = resp.message || message
        error = resp.error || error
      }

      error = exception.constructor.name.replace('Exception', '')
    }

    this.logger.error(
      `[${correlationId}] ${request.method} ${request.url} ${statusCode}: ${message}`,
    )

    response.status(statusCode).json({
      statusCode,
      error,
      message,
      correlationId,
      timestamp: new Date().toISOString(),
      path: request.url,
    })
  }
}
