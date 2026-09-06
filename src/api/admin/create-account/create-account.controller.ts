import { ADMIN_APIS, JWT_TOKEN } from 'src/constants/swagger';
import {
  AdminCreateAccountBadRequestResponseDto,
  AdminCreateAccountBodyDto,
  AdminCreateAccountResponseDto,
} from './create-account.dto';
import { AdminCreateAccountService } from './create-account.service';
import { AllowedRoles } from 'src/api/role.guard';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiHeader,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Body, Controller, Post, Scope } from '@nestjs/common';
import { UserRoleEnum } from 'src/types/enums';

@Controller({
  path: '/api/admin',
  scope: Scope.REQUEST,
})
@ApiTags(ADMIN_APIS)
export class AdminCreateAccountController {
  constructor(private readonly createAccountService: AdminCreateAccountService) {}

  @Post('create-account')
  @ApiOperation({
    summary: 'Create a new account',
    description: 'Creates a new account with the specified roles.',
  })
  @AllowedRoles([UserRoleEnum.ADMIN])
  @ApiBearerAuth(JWT_TOKEN)
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token for authentication',
    required: true,
  })
  @ApiCreatedResponse({
    type: AdminCreateAccountResponseDto,
  })
  @ApiBadRequestResponse({
    type: AdminCreateAccountBadRequestResponseDto,
  })
  @ApiBadRequestResponse({ type: AdminCreateAccountBadRequestResponseDto })
  async post(@Body() body: AdminCreateAccountBodyDto): Promise<AdminCreateAccountResponseDto> {
    await this.createAccountService.post(body.username, body.password, body.roles);
    return {
      success: true,
    };
  }
}
