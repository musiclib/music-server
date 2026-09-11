import {
  ADMINISTRATOR_ONLY_ROUTE,
  ADMIN_APIS,
  JWT_AUTHENTICATED_REQUEST_DESCRIPTION,
  JWT_TOKEN,
  JWT_TOKEN_HEADER,
} from 'src/constants/swagger';
import { AdminIndexerConfigurationResponseDto } from './indexer-configuration.dto';
import { AdminIndexerConfigurationService } from './indexer-configuration.service';
import { AllowedRoles, RoleGuard } from 'src/api/role.guard';
import { ApiBearerAuth, ApiHeader, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Scope, UseGuards } from '@nestjs/common';
import { UserRoleEnum } from 'src/types/enums';

@Controller({
  path: '/api/admin',
  scope: Scope.REQUEST,
})
@ApiTags(ADMIN_APIS)
@UseGuards(RoleGuard)
export class AdminIndexerConfigurationController {
  constructor(private readonly indexerConfigurationService: AdminIndexerConfigurationService) {}

  @Get('/indexer-configuration')
  @ApiOperation({
    summary: 'Get the indexer configuration',
    description: [
      'Retrieves the current indexer configuration for the platform.  This is currently limited to "on" or "off".',
      JWT_AUTHENTICATED_REQUEST_DESCRIPTION,
      ADMINISTRATOR_ONLY_ROUTE,
    ].join('\n'),
  })
  @AllowedRoles([UserRoleEnum.ADMIN])
  @ApiBearerAuth(JWT_TOKEN)
  @ApiHeader(JWT_TOKEN_HEADER)
  @ApiOkResponse({
    type: AdminIndexerConfigurationResponseDto,
  })
  async get(): Promise<AdminIndexerConfigurationResponseDto> {
    const configuration = await this.indexerConfigurationService.getIndexerConfiguration();
    return {
      configuration,
      success: true,
    };
  }
}
