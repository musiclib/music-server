/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { SuccessResponseDto } from 'src/api/response.dto';

export class UserTreeItemDto {
  @IsString()
  @IsOptional()
  declare folder?: string;

  @IsString()
  @IsOptional()
  declare file?: string;

  @IsString()
  declare fullPath: string;

  @IsInt()
  declare id: number;

  @ApiProperty({
    type: UserTreeItemDto,
    isArray: true,
    required: false,
  })
  declare children?: UserTreeItemDto[];
}

export class UserFolderStructureResponseDto extends SuccessResponseDto {
  @ApiProperty({
    type: UserTreeItemDto,
    isArray: true,
  })
  declare items: UserTreeItemDto[];
}
