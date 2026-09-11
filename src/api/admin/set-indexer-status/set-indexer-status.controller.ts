import {
  ADMINISTRATOR_ONLY_ROUTE,
  ADMIN_APIS,
  JWT_AUTHENTICATED_REQUEST_DESCRIPTION,
  JWT_TOKEN,
  JWT_TOKEN_HEADER,
} from 'src/constants/swagger';
import { AccountEntity } from 'src/database/entities';
import { AdminSetIndexerStatusBodyDto, AdminSetIndexerStatusResponseDto } from './set-indexer-status.dto';
import { AdminSetIndexerStatusService } from './set-indexer-status.service';
import { AllowedRoles, RoleGuard } from 'src/api/role.guard';
import { ApiBearerAuth, ApiHeader, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Patch, Scope, UseGuards } from '@nestjs/common';
import { User } from 'src/api/user.decorator';
import { UserRoleEnum } from 'src/types/enums';

@Controller({
  path: '/api/admin',
  scope: Scope.REQUEST,
})
@ApiTags(ADMIN_APIS)
@UseGuards(RoleGuard)
export class AdminSetIndexerStatusController {
  constructor(private readonly setIndexerStatusService: AdminSetIndexerStatusService) {}

  @Patch('/set-indexer-status')
  @ApiOperation({
    summary: 'Set the indexer status',
    description: [
      'Enables or disables the indexer to allow moving root paths or to preserve system resources.',
      JWT_AUTHENTICATED_REQUEST_DESCRIPTION,
      ADMINISTRATOR_ONLY_ROUTE,
    ].join('\n'),
  })
  @AllowedRoles([UserRoleEnum.ADMIN])
  @ApiBearerAuth(JWT_TOKEN)
  @ApiHeader(JWT_TOKEN_HEADER)
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
