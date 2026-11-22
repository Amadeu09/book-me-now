import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { ocultarTokens } from '../utils/log.utils';

/**
 * Global exception filter
 * Catches all exceptions and formats them consistently
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'InternalServerError';
    let details: any = undefined;

    // HTTP Exceptions (NestJS)
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || message;
        error = (exceptionResponse as any).error || error;
        details = (exceptionResponse as any).details;
      }
    }
    // Prisma Errors
    else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      ({ status, message, error } = this.handlePrismaError(exception));
    }
    // Validation Errors
    else if (exception instanceof Prisma.PrismaClientValidationError) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Validation error in database operation';
      error = 'ValidationError';
      this.logger.error('PrismaClientValidationError details:', exception.message);
    }
    // Generic Errors: en producció no s'exposa el missatge intern al client
    else if (exception instanceof Error) {
      if (process.env.NODE_ENV !== 'production') {
        message = exception.message;
        error = exception.name;
      }
    }

    // 5xx: error amb stack trace. 4xx: només una línia d'avís (un 404 o un 401 no
    // necessita la traça, i omplia els logs).
    const rutaLog = ocultarTokens(request.url);
    if (status >= 500) {
      this.logger.error(
        `${request.method} ${rutaLog} - Status: ${status} - ${error}: ${message}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    } else {
      this.logger.warn(`${request.method} ${rutaLog} - Status: ${status} - ${error}: ${message}`);
    }

    // Send formatted response
    response.status(status).json({
      statusCode: status,
      error,
      message,
      details,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
    });
  }

  /**
   * Handle Prisma-specific errors and map to HTTP status codes
   */
  private handlePrismaError(error: Prisma.PrismaClientKnownRequestError): {
    status: number;
    message: string;
    error: string;
  } {
    switch (error.code) {
      case 'P2002':
        // Unique constraint violation
        const field = (error.meta?.target as string[]) || ['field'];
        return {
          status: HttpStatus.CONFLICT,
          message: `A record with this ${field[0]} already exists`,
          error: 'ConflictError',
        };

      case 'P2025':
        // Record not found
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'Record not found',
          error: 'NotFoundError',
        };

      case 'P2003':
        // Foreign key constraint failed
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Related record does not exist',
          error: 'ForeignKeyError',
        };

      case 'P2014':
        // Required relation violation
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Cannot delete record with related data',
          error: 'RelationError',
        };

      default:
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Database error',
          error: 'DatabaseError',
        };
    }
  }
}
