import { AccountEntity } from 'src/database/entities';
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
import { Body, Controller, Put, Query, UseGuards } from '@nestjs/common';
import { JWT_AUTHENTICATED_REQUEST_DESCRIPTION, JWT_TOKEN, JWT_TOKEN_HEADER, USER_APIS } from 'src/constants/swagger';
import { User } from 'src/api/user.decorator';
import {
  UserDeleteCustomFileDataNotFoundResponseDto,
  UserDeleteCustomFileDataResponseDto,
} from '../delete-custom-file-data/delete-custom-file-data.dto';
import { UserRoleEnum } from 'src/types/enums';
import {
  UserSetCustomFileDataBadRequestResponseDto,
  UserSetCustomFileDataBodyDto,
  UserSetCustomFileDataQueryDto,
} from './set-custom-file-data.dto';
import { UserSetCustomFileDataService } from './set-custom-file-data.service';

@Controller({
  path: '/api/user',
})
@ApiTags(USER_APIS)
@UseGuards(RoleGuard)
export class UserSetCustomFileDataController {
  constructor(private readonly setCustomFileDataService: UserSetCustomFileDataService) {}

  @Put('set-custom-file-data')
  @ApiOperation({
    summary: `Set custom data for a file in the user's account`,
    description: [
      `Assigns custom data to a file, overriding the embedded data within it.`,
      `The next indexing pass of the file will reflect the newly set custom data.`,
      JWT_AUTHENTICATED_REQUEST_DESCRIPTION,
    ].join('\n'),
  })
  @AllowedRoles([UserRoleEnum.USER, UserRoleEnum.ADMIN])
  @ApiBearerAuth(JWT_TOKEN)
  @ApiHeader(JWT_TOKEN_HEADER)
  @ApiOkResponse({
    description: 'Custom data set successfully',
    type: UserDeleteCustomFileDataResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'File not found',
    type: UserDeleteCustomFileDataNotFoundResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Request failed',
    type: UserSetCustomFileDataBadRequestResponseDto,
  })
  async put(
    @User() user: AccountEntity,
    @Query() query: UserSetCustomFileDataQueryDto,
    @Body() body: UserSetCustomFileDataBodyDto,
  ) {
    await this.setCustomFileDataService.setCustomFileData(user.id, query.id, body);
    return {
      success: true,
    };
  }
}
