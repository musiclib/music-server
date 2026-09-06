import { ADMIN_APIS, JWT_TOKEN } from 'src/constants/swagger';
import { AdminIndexerConfigurationResponseDto } from './indexer-configuration.dto';
import { AdminIndexerConfigurationService } from './indexer-configuration.service';
import { AllowedRoles } from 'src/api/role.guard';
import { ApiBearerAuth, ApiHeader, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Scope } from '@nestjs/common';
import { UserRoleEnum } from 'src/types/enums';

@Controller({
  path: '/api/admin',
  scope: Scope.REQUEST,
})
@ApiTags(ADMIN_APIS)
export class AdminIndexerConfigurationController {
  constructor(private readonly indexerConfigurationService: AdminIndexerConfigurationService) {}

  @Get('/indexer-configuration')
  @ApiOperation({
    summary: 'Get the indexer configuration',
    description: 'Retrieves the current indexer configuration for the platform.',
  })
  @AllowedRoles([UserRoleEnum.ADMIN])
  @ApiBearerAuth(JWT_TOKEN)
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token for authentication',
    required: true,
  })
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
