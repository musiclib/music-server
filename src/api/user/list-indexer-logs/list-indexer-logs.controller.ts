import { AccountEntity } from 'src/database/entities';
import { AllowedRoles, RoleGuard } from 'src/api/role.guard';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiHeader,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JWT_AUTHENTICATED_REQUEST_DESCRIPTION, JWT_TOKEN, JWT_TOKEN_HEADER, USER_APIS } from 'src/constants/swagger';
import { User } from 'src/api/user.decorator';
import {
  UserListIndexerLogsBadRequestResponseDto,
  UserListIndexerLogsNotFoundResponseDto,
  UserListIndexerLogsQueryDto,
  UserListIndexerLogsResponseDto,
} from './list-indexer-logs.dto';
import { UserListIndexerLogsService } from './list-indexer-logs.service';
import { UserRoleEnum } from 'src/types/enums';

@Controller({
  path: '/api/user',
})
@ApiTags(USER_APIS)
@UseGuards(RoleGuard)
export class UserListIndexerLogsController {
  constructor(private readonly listIndexerLogsService: UserListIndexerLogsService) {}

  @Get('list-indexer-logs')
  @ApiOperation({
    summary: 'Monitor what the indexer is doing for your library',
    description: [
      'Retrieves the most recent indexer logs based on any provided query parameters.',
      `Logs are held in memory and will clear whenever the server restarts.`,
      'The oldest logs will discard as they accumulate beyond the capacity in the `system_configurations` table.',
      'If you have multiple users it may be common for this to be empty as the capacity is filled by other users.',
      JWT_AUTHENTICATED_REQUEST_DESCRIPTION,
    ].join('\n'),
  })
  @AllowedRoles([UserRoleEnum.USER, UserRoleEnum.ADMIN])
  @ApiBearerAuth(JWT_TOKEN)
  @ApiHeader(JWT_TOKEN_HEADER)
  @ApiOkResponse({
    description: 'Successful response with an array of data and pagination information.',
    type: UserListIndexerLogsResponseDto,
  })
  @ApiBadRequestResponse({
    type: UserListIndexerLogsBadRequestResponseDto,
  })
  @ApiNotFoundResponse({
    type: UserListIndexerLogsNotFoundResponseDto,
  })
  async get(
    @User() user: AccountEntity,
    @Query() query: UserListIndexerLogsQueryDto,
  ): Promise<UserListIndexerLogsResponseDto> {
    const logs = await this.listIndexerLogsService.list(user.id, query.rootPathId, query.search);
    return {
      logs,
      success: true,
    };
  }
}
