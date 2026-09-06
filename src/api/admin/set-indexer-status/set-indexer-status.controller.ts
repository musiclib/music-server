import { ADMIN_APIS, JWT_TOKEN } from 'src/constants/swagger';
import { AccountEntity } from 'src/database/entities';
import { AdminSetIndexerStatusBodyDto, AdminSetIndexerStatusResponseDto } from './set-indexer-status.dto';
import { AdminSetIndexerStatusService } from './set-indexer-status.service';
import { AllowedRoles } from 'src/api/role.guard';
import { ApiBearerAuth, ApiHeader, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Patch, Scope } from '@nestjs/common';
import { User } from 'src/api/user.decorator';
import { UserRoleEnum } from 'src/types/enums';

@Controller({
  path: '/api/admin',
  scope: Scope.REQUEST,
})
@ApiTags(ADMIN_APIS)
export class AdminSetIndexerStatusController {
  constructor(private readonly setIndexerStatusService: AdminSetIndexerStatusService) {}

  @Patch('/set-indexer-status')
  @ApiOperation({
    summary: 'Set the indexer status',
    description: 'Enables or disables the indexer to allow moving root paths or to preserve system resources.',
  })
  @AllowedRoles([UserRoleEnum.ADMIN])
  @ApiBearerAuth(JWT_TOKEN)
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token for authentication',
    required: true,
  })
  @ApiOkResponse({
    description: 'Scanner status updated successfully',
    type: AdminSetIndexerStatusResponseDto,
  })
  async patch(
    @User() user: AccountEntity,
    @Body() body: AdminSetIndexerStatusBodyDto,
  ): Promise<AdminSetIndexerStatusResponseDto> {
    const { enabled } = body;
    await this.setIndexerStatusService.setScannerStatus(user.id, enabled);
    return { success: true };
  }
}
