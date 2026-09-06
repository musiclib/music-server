/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger/dist/decorators/api-property.decorator';
import { IsInt } from 'class-validator';
import { LibraryArtistWithTracksDto } from 'src/library/dtos/library.artist.dto';
import { SuccessResponseDto } from 'src/api/response.dto';
import {
  UserListTrackArtistsBadRequestResponseDto,
  UserListTrackArtistsQueryDto,
} from '../list-track-artists/list-track-artists.dto';

export class UserListTrackArtistsWithTracksQueryDto extends UserListTrackArtistsQueryDto {}

export class UserListTrackArtistsWithTracksResponseDto extends SuccessResponseDto {
  /**
   * The list of artists that match the query parameters, which may be limited by pagination.
   */
  @ApiProperty({
    type: LibraryArtistWithTracksDto,
    isArray: true,
  })
  declare artists: LibraryArtistWithTracksDto[];

  /**
   * The offset of the first artist in the artists array, which may be greater than 0 if
   * pagination is applied.
   */
  @IsInt()
  declare offset: number;

  /**
   * The total number of artists that match the query parameters, which may be greater
   * than the number of artists returned in the artists array if pagination is applied.
   */
  @IsInt()
  declare total: number;
}

export class UserListTrackArtistsWithTracksBadRequestResponseDto extends UserListTrackArtistsBadRequestResponseDto {}
