import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@jobportal/db';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let title = 'Internal Server Error';
    let detail: any = 'An unexpected error occurred';
    let errorCode: string | undefined = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'string') {
        detail = res;
      } else if (typeof res === 'object' && res !== null) {
        const obj = res as any;
        detail = obj.message || obj.detail || JSON.stringify(obj);
        errorCode = obj.code || obj.error;
      }
      title = exception.name;
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      if (exception.code === 'P2002') {
        status = HttpStatus.CONFLICT;
        title = 'Conflict Violation';
        errorCode = 'ALREADY_APPLIED';
        detail = 'A resource with these unique properties already exists (duplicate entry).';
      } else if (exception.code === 'P2025') {
        status = HttpStatus.NOT_FOUND;
        title = 'Record Not Found';
        detail = 'The requested resource was not found.';
      } else {
        status = HttpStatus.BAD_REQUEST;
        title = 'Database Error';
        detail = exception.message;
      }
    } else if (exception instanceof Error) {
      detail = exception.message;
      this.logger.error(`Unhandled error: ${exception.message}`, exception.stack);
    }

    response.status(status).json({
      type: `https://errors.jobportal.vn/${errorCode || status}`,
      title,
      status,
      detail,
      code: errorCode,
      instance: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
