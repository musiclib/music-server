import { AccountEntity } from 'src/database/entities';
import { AllowedRoles } from 'src/api/role.guard';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiHeader,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Controller, Get, Query } from '@nestjs/common';
import { JWT_TOKEN, USER_APIS } from 'src/constants/swagger';
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
export class UserListIndexerLogsController {
  constructor(private readonly listIndexerLogsService: UserListIndexerLogsService) {}

  @Get('list-indexer-logs')
  @ApiOperation({
    summary: 'List indexer logs',
    description:
      // eslint-disable-next-line max-len
      'Retrieves a list of indexer logs based on the provided query parameters which may filter by root path or search term.  The logs are only held in memory and will disappear when the server restarts or to stay within the log size specified in the `system_configurations` table.',
  })
  @AllowedRoles([UserRoleEnum.USER, UserRoleEnum.ADMIN])
  @ApiBearerAuth(JWT_TOKEN)
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token for authentication',
    required: true,
  })
  @ApiOkResponse({
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
