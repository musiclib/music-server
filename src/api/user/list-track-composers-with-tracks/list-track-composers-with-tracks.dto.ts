/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';
import { LibraryComposerWithTracksDto } from 'src/library/dtos/library.composer.dto';
import { SuccessResponseDto } from 'src/api/response.dto';
import {
  UserListTrackComposersBadRequestResponseDto,
  UserListTrackComposersQueryDto,
} from '../list-track-composers/list-track-composers.dto';

export class UserListTrackComposersWithTracksQueryDto extends UserListTrackComposersQueryDto {}

export class UserListTrackComposersWithTracksResponseDto extends SuccessResponseDto {
  /**
   * The list of composers that match the query parameters, which may be limited by pagination.
   */
  @ApiProperty({
    type: LibraryComposerWithTracksDto,
    isArray: true,
  })
  declare composers: LibraryComposerWithTracksDto[];

  /**
   * The offset of the first composer in the composers array, which may be greater than 0 if
   * pagination is applied.
   */
  @IsInt()
  declare offset: number;

  /**
   * The total number of composers that match the query parameters, which may be greater
   * than the number of composers returned in the composers array if pagination is applied.
   */
  @IsInt()
  declare total: number;
}

// eslint-disable-next-line max-len
export class UserListTrackComposersWithTracksBadRequestResponseDto extends UserListTrackComposersBadRequestResponseDto {}
