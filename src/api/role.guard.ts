import { AccountEntity } from 'src/database/entities';
import { AuthenticationService } from 'src/authentication/authentication.service';
import { ErrorCodes } from 'src/constants/error-codes';
import { ForbiddenException, Inject, Injectable, Logger, SetMetadata, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { SessionRestrictionEnum, UserRoleEnum } from 'src/types/enums';
import type { CanActivate, ExecutionContext } from '@nestjs/common';

export const AllowedRoles = (roles: UserRoleEnum[]) => SetMetadata('roles', roles);
export const AllowGuest = () => SetMetadata('allowGuest', true);

@Injectable()
export class RoleGuard implements CanActivate {
  private readonly logger: Logger = new Logger(RoleGuard.name);

  constructor(
    private readonly authenticationService: AuthenticationService,
    @Inject(Reflector) private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const allowGuest = this.reflector.getAllAndOverride<boolean>('allowGuest', [
      context.getHandler(),
      context.getClass(),
    ]);
    const request = context.switchToHttp().getRequest();
    // verify the session if a JWT token is present in authorization header
    const token = this.extractTokenFromHeader(request);
    if (token) {
      try {
        const payload: {
          accountId: number;
          sessionId: number;
          tokenHash: string;
        } = await this.jwtService.verifyAsync(token);
        if (payload) {
          const user = await this.authenticationService.getAccount(payload.accountId);
          if (!user) {
            throw new UnauthorizedException(ErrorCodes.AUTHORIZATION_ERROR);
          }
          const session = await this.authenticationService.getSession(payload.sessionId);
          if (!session || session.expiresAt.getTime() < new Date().getTime() || session.endedAt !== null) {
            throw new UnauthorizedException(ErrorCodes.AUTHORIZATION_ERROR);
          }
          const validSessionToken = await this.authenticationService.verifySessionToken(
            user,
            session,
            payload.tokenHash,
          );
          if (!validSessionToken) {
            throw new UnauthorizedException(ErrorCodes.AUTHORIZATION_ERROR);
          }
          // prevent a session from accessing APIs beyond the context it was created for
          // eg the synology ds audio apps cannot APIs for other apps or the web UI
          if (session.restrictSession) {
            // Synology APIs
            if (
              session.restrictSession === SessionRestrictionEnum.SYNOLOGY_AUDIOSTATION &&
              !request.url.startsWith('/webapi/')
            ) {
              throw new UnauthorizedException(ErrorCodes.AUTHORIZATION_ERROR);
            }
            // Web UI APIs
            if (session.restrictSession === SessionRestrictionEnum.WEB_UI && !request.url.startsWith('/api/')) {
              throw new UnauthorizedException(ErrorCodes.AUTHORIZATION_ERROR);
            }
          }
          request.user = user;
          request.session = session;
        }
      } catch (error) {
        this.logger.error('Error verifying JWT token:', error instanceof Error ? error.message : error);
        throw new UnauthorizedException(ErrorCodes.AUTHORIZATION_ERROR);
      }
    }
    if (allowGuest) {
      return true;
    }
    // check for role eligibility
    const requiredRoles = this.reflector.getAllAndOverride<UserRoleEnum[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles?.length) {
      // no roles are required for public route
      return true;
    }
    // enforce the role requirement for protected route
    if (request.url.startsWith('/api/admin/')) {
      if (!requiredRoles.includes(UserRoleEnum.ADMIN)) {
        throw new ForbiddenException(ErrorCodes.FORBIDDEN_ERROR);
      }
    }
    const user = request.user as AccountEntity;
    if (!user) {
      // role is required but user is not signed in
      return false;
    }
    if (requiredRoles.some((role) => user.roles.includes(role))) {
      // user satisfies role requirement
      return true;
    }
    throw new ForbiddenException(ErrorCodes.FORBIDDEN_ERROR);
  }

  // eslint-disable-next-line class-methods-use-this
  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
