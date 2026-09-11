import { AuthenticationService } from 'src/authentication/authentication.service';
import { ErrorCodes } from 'src/constants/error-codes';
import { Inject, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import type { CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class QnapGuard implements CanActivate {
  private readonly logger: Logger = new Logger(QnapGuard.name);

  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly jwtService: JwtService,
    @Inject(Reflector) private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const allowGuest = this.reflector.getAllAndOverride<boolean>('allowGuest', [
      context.getHandler(),
      context.getClass(),
    ]);
    const request = context.switchToHttp().getRequest();
    const sessionToken = this.extractPayloadFromHeader(request);
    if (sessionToken) {
      try {
        // verify the session token
        const payload: {
          accountId: number;
          sessionId: number;
          tokenHash: string;
        } = await this.jwtService.verifyAsync(sessionToken);
        if (payload) {
          const user = await this.authenticationService.getAccount(payload.accountId);
          if (!user) {
            throw new UnauthorizedException(ErrorCodes.AUTHORIZATION_ERROR, 'session-error-1');
          }
          // verify the session is still valid
          const session = await this.authenticationService.getSession(payload.sessionId);
          if (!session || session.expiresAt.getTime() < new Date().getTime() || session.endedAt !== null) {
            throw new UnauthorizedException(ErrorCodes.AUTHORIZATION_ERROR, 'session-error-2');
          }
          const validSessionToken = await this.authenticationService.verifySessionToken(
            user,
            session,
            payload.tokenHash,
          );
          if (!validSessionToken) {
            throw new UnauthorizedException(ErrorCodes.AUTHORIZATION_ERROR, 'session-error-3');
          }
          request.user = user;
          request.session = session;
        }
      } catch (error) {
        this.logger.error('Error verifying JWT token:', error instanceof Error ? error.message : error);
        if (!allowGuest) {
          throw new UnauthorizedException(ErrorCodes.AUTHORIZATION_ERROR, 'session-error-4');
        }
      }
    }
    return allowGuest || request.user;
  }

  // eslint-disable-next-line class-methods-use-this
  private extractPayloadFromHeader(request: Request): string | undefined {
    if (request.query.sid) {
      return request.query.sid as string;
    }
    if (request.body?.sid) {
      return request.body.sid as string;
    }
    if (!request.headers.cookie) {
      return undefined;
    }
    if (request.cookies?.QMS_SID) {
      return request.cookies.QMS_SID;
    }
    return undefined;
  }
}
