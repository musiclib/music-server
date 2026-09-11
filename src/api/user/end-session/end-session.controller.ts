import { AllowedRoles, RoleGuard } from 'src/api/role.guard';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiHeader,
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { BadRequestResponseDto, InternalServerErrorResponseDto, SuccessResponseDto } from 'src/api/response.dto';
import { Controller, Delete, Logger, UseGuards } from '@nestjs/common';
import { JWT_AUTHENTICATED_REQUEST_DESCRIPTION, JWT_TOKEN, JWT_TOKEN_HEADER, USER_APIS } from 'src/constants/swagger';
import { Session } from 'src/api/session.decorator';
import { SessionEntity } from 'src/database/entities';
import { UserEndSessionService } from './end-session.service';
import { UserRoleEnum } from 'src/types/enums';

@Controller({
  path: '/api/user',
})
@ApiTags(USER_APIS)
@UseGuards(RoleGuard)
export class UserEndSessionController {
  private readonly logger: Logger = new Logger(UserEndSessionController.name);

  constructor(private readonly endSessionService: UserEndSessionService) {}

  @Delete('end-session')
  @ApiOperation({
    summary: 'Terminate the session',
    description: [
      'Ends a user session and invalidates the JWT token provided in the `Authorization` header.',
      JWT_AUTHENTICATED_REQUEST_DESCRIPTION,
    ].join('\n'),
  })
  @AllowedRoles([UserRoleEnum.USER, UserRoleEnum.ADMIN])
  @ApiBearerAuth(JWT_TOKEN)
  @ApiHeader(JWT_TOKEN_HEADER)
  @ApiResponse({
    type: SuccessResponseDto,
  })
  @ApiBadRequestResponse({
    type: BadRequestResponseDto,
  })
  @ApiInternalServerErrorResponse({
    type: InternalServerErrorResponseDto,
  })
  async delete(@Session() session: SessionEntity): Promise<SuccessResponseDto> {
    try {
      const success = await this.endSessionService.delete(session);
      return {
        success,
      };
    } catch (error) {
      this.logger.error('Error ending session:', error instanceof Error ? error.message : error);
      throw error;
    }
  }
}
