import { AccountEntity } from 'src/database/entities/account.entity';
import { AllowedRoles } from 'src/api/role.guard';
import { ApiBearerAuth, ApiHeader, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Controller, Get } from '@nestjs/common';
import { JWT_TOKEN, USER_APIS } from 'src/constants/swagger';
import { User } from 'src/api/user.decorator';
import { UserFolderStructureResponseDto } from './folder-structure.dto';
import { UserFolderStructureService } from './folder-structure.service';
import { UserRoleEnum } from 'src/types/enums';

@Controller({
  path: '/api/user',
})
@ApiTags(USER_APIS)
export class UserFolderStructureController {
  constructor(private readonly listFoldersService: UserFolderStructureService) {}

  @Get('folder-structure')
  @ApiOperation({
    summary: 'Retrieve library folder structure',
    description: `Returns the folder and file structure of the library.`,
  })
  @AllowedRoles([UserRoleEnum.USER, UserRoleEnum.ADMIN])
  @ApiBearerAuth(JWT_TOKEN)
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token for authentication',
    required: true,
  })
  @ApiOkResponse({
    description: 'Successfully retrieved the tree of folders and file contents.',
    type: UserFolderStructureResponseDto,
  })
  async get(@User() user: AccountEntity) {
    const items = await this.listFoldersService.getTreeStructure(user.id);
    return {
      items,
      success: true,
    };
  }
}
