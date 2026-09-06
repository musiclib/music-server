/* eslint-disable max-classes-per-file */
import {
  UserListTrackArtistsBadRequestResponseDto,
  UserListTrackArtistsQueryDto,
  UserListTrackArtistsResponseDto,
} from '../list-track-artists/list-track-artists.dto';

export class UserListAlbumArtistsQueryDto extends UserListTrackArtistsQueryDto {}

export class UserListAlbumArtistsResponseDto extends UserListTrackArtistsResponseDto {}

export class UserListAlbumArtistsBadRequestResponseDto extends UserListTrackArtistsBadRequestResponseDto {}
