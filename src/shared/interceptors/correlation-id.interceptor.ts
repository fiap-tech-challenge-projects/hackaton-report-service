import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'
import { v4 as uuidv4 } from 'uuid'

export const CORRELATION_ID_HEADER = 'X-Correlation-ID'

/**
 * Interceptor that ensures every request has a correlation ID
 * Generates one if not present, passes it through in the response header
 */
@Injectable()
export class CorrelationIdInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest()
    const response = context.switchToHttp().getResponse()

    const correlationId = request.headers[CORRELATION_ID_HEADER.toLowerCase()] || uuidv4()

    request.correlationId = correlationId
    response.setHeader(CORRELATION_ID_HEADER, correlationId)

    return next.handle().pipe(
      tap(() => {
        // correlation id already set in header above
      }),
    )
  }
}
