import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { AuthenticatedRequest } from 'src/types';
import { ErrorCodes } from 'src/constants/error-codes';
import { Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger: Logger = new Logger(GlobalExceptionFilter.name);

  // eslint-disable-next-line class-methods-use-this
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<AuthenticatedRequest>();
    this.logger.error('GlobalExceptionFilter caught an exception:', {
      method: request.method,
      url: request.url,
      headers: request.headers,
      body: request.body,
      query: request.query,
      exception,
    });
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const exceptionData =
      exception instanceof HttpException ? exception.getResponse() : ErrorCodes.INTERNAL_SERVER_ERROR;
    const errorData = {
      ...(exceptionData instanceof Object
        ? {
            message: (exceptionData as Record<string, string>).message,
            error: `${(exceptionData as Record<string, string>).error?.split(' ').join('-').toLowerCase()}-error`,
          }
        : {
            message: typeof exceptionData === 'string' ? [exceptionData] : exceptionData,
            error:
              exception instanceof Error
                ? `${(exception as Error).name.toLowerCase().split(' ').join('-')}-error`
                : ErrorCodes.INTERNAL_SERVER_ERROR,
          }),
    } as {
      message: string | string[];
      error: string;
    };
    const messageArray = typeof errorData.message === 'string' ? [errorData.message] : errorData.message;
    this.logger.error({
      url: request.url,
      method: request.method,
      query: request.query,
      userId: request.user?.id,
      sessionId: request.session?.id,
      error: errorData.error,
      message: messageArray.filter((v, i, a) => a.indexOf(v) === i),
      stack: exception instanceof Error ? exception.stack : undefined,
    });
    response.status(status).json({
      timestamp: new Date().toISOString(),
      path: request.url,
      error: errorData.error,
      message: messageArray.filter((v, i, a) => a.indexOf(v) === i),
    });
  }
}
