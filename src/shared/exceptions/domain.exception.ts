import { HttpException, HttpStatus } from '@nestjs/common'

/**
 * Domain-level exception for business rule violations
 */
export class DomainException extends HttpException {
  constructor(message: string, statusCode: HttpStatus = HttpStatus.BAD_REQUEST) {
    super(
      {
        statusCode,
        error: 'Domain Error',
        message,
      },
      statusCode,
    )
  }
}
