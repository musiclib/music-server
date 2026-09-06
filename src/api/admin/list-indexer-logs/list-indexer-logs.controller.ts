import { ADMIN_APIS, JWT_TOKEN } from 'src/constants/swagger';
import {
  AdminListIndexerLogsBadRequestResponseDto,
  AdminListIndexerLogsNotFoundResponseDto,
  AdminListIndexerLogsQueryDto,
  AdminListIndexerLogsResponseDto,
} from './list-indexer-logs.dto';
import { AdminListIndexerLogsService } from './list-indexer-logs.service';
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
import { UserRoleEnum } from 'src/types/enums';

@Controller({
  path: '/api/admin',
})
@ApiTags(ADMIN_APIS)
export class AdminListIndexerLogsController {
  constructor(private readonly listIndexerLogsService: AdminListIndexerLogsService) {}

  @Get('list-indexer-logs')
  @ApiOperation({
    summary: 'List indexer logs',
    description:
      // eslint-disable-next-line max-len
      'Retrieves a list of indexer logs based on the provided query parameters which may filter by user or root path or search term.  The logs are only held in memory and will disappear when the server restarts or to stay within the log size specified in the `system_configurations` table.',
  })
  @AllowedRoles([UserRoleEnum.ADMIN])
  @ApiBearerAuth(JWT_TOKEN)
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token for authentication',
    required: true,
  })
  @ApiOkResponse({
    type: AdminListIndexerLogsResponseDto,
  })
  @ApiBadRequestResponse({
    type: AdminListIndexerLogsBadRequestResponseDto,
  })
  @ApiNotFoundResponse({
    type: AdminListIndexerLogsNotFoundResponseDto,
  })
  async get(@Query() query: AdminListIndexerLogsQueryDto): Promise<AdminListIndexerLogsResponseDto> {
    const logs = await this.listIndexerLogsService.list(query.accountId, query.rootPathId, query.search);
    return {
      logs,
      success: true,
    };
  }
}
