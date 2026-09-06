/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger/dist/decorators/api-property.decorator';
import { IsInt, IsString } from 'class-validator';
import { SuccessResponseDto } from 'src/api/response.dto';
import { UserRoleEnum } from 'src/types/enums';

export class AdminAccountDto {
  @IsInt()
  declare id: number;

  @IsString()
  declare username: string;

  @ApiProperty({
    enum: UserRoleEnum,
    enumName: 'UserRoleEnum',
    isArray: true,
  })
  declare roles: UserRoleEnum[];
}

export class AdminListAccountsResponseDto extends SuccessResponseDto {
  @ApiProperty({ type: AdminAccountDto, isArray: true })
  declare accounts: AdminAccountDto[];
}
