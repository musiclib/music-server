import { AccountEntity } from 'src/database/entities';
import { AllowedRoles, RoleGuard } from 'src/api/role.guard';
import { ApiBearerAuth, ApiHeader, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Controller, Delete, Query, UseGuards } from '@nestjs/common';
import { JWT_AUTHENTICATED_REQUEST_DESCRIPTION, JWT_TOKEN, JWT_TOKEN_HEADER, USER_APIS } from 'src/constants/swagger';
import { User } from 'src/api/user.decorator';
import {
  UserDeleteCustomFileDataNotFoundResponseDto,
  UserDeleteCustomFileDataQueryDto,
  UserDeleteCustomFileDataResponseDto,
} from './delete-custom-file-data.dto';
import { UserDeleteCustomFileDataService } from './delete-custom-file-data.service';
import { UserRoleEnum } from 'src/types/enums';

@Controller({
  path: '/api/user',
})
@ApiTags(USER_APIS)
@UseGuards(RoleGuard)
export class UserDeleteCustomFileDataController {
  constructor(private readonly deleteCustomFileDataService: UserDeleteCustomFileDataService) {}

  @Delete('delete-custom-file-data')
  @ApiOperation({
    summary: `Remove custom data from a file in the user's account`,
    description: [
      `Deletes the specified custom data in the database immediately.`,
      `The file this data is for will revert to its embedded data on its next indexing.`,
      JWT_AUTHENTICATED_REQUEST_DESCRIPTION,
    ].join('\n'),
  })
  @AllowedRoles([UserRoleEnum.USER, UserRoleEnum.ADMIN])
  @ApiBearerAuth(JWT_TOKEN)
  @ApiHeader(JWT_TOKEN_HEADER)
  @ApiOkResponse({
    description: 'Custom data deleted successfully',
    type: UserDeleteCustomFileDataResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'File not found',
    type: UserDeleteCustomFileDataNotFoundResponseDto,
  })
  async delete(@User() user: AccountEntity, @Query() query: UserDeleteCustomFileDataQueryDto) {
    await this.deleteCustomFileDataService.deleteCustomFileData(user.id, query.id);
    return {
      success: true,
    };
  }
}
