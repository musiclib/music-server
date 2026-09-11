import {
  ADMINISTRATOR_ONLY_ROUTE,
  ADMIN_APIS,
  JWT_AUTHENTICATED_REQUEST_DESCRIPTION,
  JWT_TOKEN,
  JWT_TOKEN_HEADER,
} from 'src/constants/swagger';
import {
  AdminListIndexerLogsBadRequestResponseDto,
  AdminListIndexerLogsNotFoundResponseDto,
  AdminListIndexerLogsQueryDto,
  AdminListIndexerLogsResponseDto,
} from './list-indexer-logs.dto';
import { AdminListIndexerLogsService } from './list-indexer-logs.service';
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
import { UserRoleEnum } from 'src/types/enums';

@Controller({
  path: '/api/admin',
})
@ApiTags(ADMIN_APIS)
@UseGuards(RoleGuard)
export class AdminListIndexerLogsController {
  constructor(private readonly listIndexerLogsService: AdminListIndexerLogsService) {}

  @Get('list-indexer-logs')
  @ApiOperation({
    summary: 'Monitor what the indexer is doing for all libraries',
    description: [
      'Retrieves the most recent indexer logs based on any provided query parameters.',
      `Logs are held in memory and will clear whenever the server restarts.`,
      'The oldest logs will discard as they accumulate beyond the capacity in the `system_configurations` table.',
      JWT_AUTHENTICATED_REQUEST_DESCRIPTION,
      ADMINISTRATOR_ONLY_ROUTE,
    ].join('\n'),
  })
  @AllowedRoles([UserRoleEnum.ADMIN])
  @ApiBearerAuth(JWT_TOKEN)
  @ApiHeader(JWT_TOKEN_HEADER)
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
