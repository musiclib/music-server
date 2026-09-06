import { ADMIN_APIS, JWT_TOKEN } from 'src/constants/swagger';
import {
  AdminCreateRootPathBadRequestResponseDto,
  AdminCreateRootPathBodyDto,
  AdminCreateRootPathNotFoundResponseDto,
  AdminCreateRootPathQueryDto,
  AdminCreateRootPathResponseDto,
} from './create-root-path.dto';
import { AdminCreateRootPathService } from './create-root-path.service';
import { AllowedRoles } from 'src/api/role.guard';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiHeader,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Body, Controller, Post, Query } from '@nestjs/common';
import { UserRoleEnum } from 'src/types/enums';

@Controller({
  path: '/api/admin',
})
@ApiTags(ADMIN_APIS)
export class AdminCreateRootPathController {
  constructor(private readonly createRootPathService: AdminCreateRootPathService) {}

  @Post('create-root-path')
  @ApiOperation({
    summary: 'Create a new root path',
    description: 'Creates a new root path for the specified account.',
  })
  @AllowedRoles([UserRoleEnum.ADMIN])
  @ApiBearerAuth(JWT_TOKEN)
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token for authentication',
    required: true,
  })
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
