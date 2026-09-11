import {
  ADMINISTRATOR_ONLY_ROUTE,
  ADMIN_APIS,
  JWT_AUTHENTICATED_REQUEST_DESCRIPTION,
  JWT_TOKEN,
  JWT_TOKEN_HEADER,
} from 'src/constants/swagger';
import {
  AdminCreateRootPathBadRequestResponseDto,
  AdminCreateRootPathBodyDto,
  AdminCreateRootPathNotFoundResponseDto,
  AdminCreateRootPathQueryDto,
  AdminCreateRootPathResponseDto,
} from './create-root-path.dto';
import { AdminCreateRootPathService } from './create-root-path.service';
import { AllowedRoles, RoleGuard } from 'src/api/role.guard';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiHeader,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Body, Controller, Post, Query, UseGuards } from '@nestjs/common';
import { UserRoleEnum } from 'src/types/enums';

@Controller({
  path: '/api/admin',
})
@ApiTags(ADMIN_APIS)
@UseGuards(RoleGuard)
export class AdminCreateRootPathController {
  constructor(private readonly createRootPathService: AdminCreateRootPathService) {}

  @Post('create-root-path')
  @ApiOperation({
    summary: 'Add new root path to account',
    description: [
      'Add a library root path to an account.  This will add media in the path when the indexer reaches it.',
      JWT_AUTHENTICATED_REQUEST_DESCRIPTION,
      ADMINISTRATOR_ONLY_ROUTE,
    ].join('\n'),
  })
  @AllowedRoles([UserRoleEnum.ADMIN])
  @ApiBearerAuth(JWT_TOKEN)
  @ApiHeader(JWT_TOKEN_HEADER)
  @ApiCreatedResponse({
    description: 'Root path created successfully',
    type: AdminCreateRootPathResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid request data',
    type: AdminCreateRootPathBadRequestResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Account not found',
    type: AdminCreateRootPathNotFoundResponseDto,
  })
  async post(
    @Query() query: AdminCreateRootPathQueryDto,
    @Body() body: AdminCreateRootPathBodyDto,
  ): Promise<AdminCreateRootPathResponseDto> {
    await this.createRootPathService.createRootPath(query.id, body.rootPath);
    return {
      success: true,
    };
  }
}
