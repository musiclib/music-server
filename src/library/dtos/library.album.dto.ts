/* eslint-disable max-classes-per-file */
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsDate, IsInt, IsNumber, IsString } from 'class-validator';
import { LibraryArtistDto } from './library.artist.dto';
import { LibraryComposerDto } from './library.composer.dto';
import { LibraryGenreDto } from './library.genre.dto';
import { LibraryTrackDto } from './library.track.dto';
import type { RatingOrUnset } from 'src/types';

export class LibraryAlbumDto {
  /**
   * The artist for the album, which is all the album artists in a comma-delimited list
   */
  @ApiProperty({
    type: LibraryArtistDto,
    isArray: true,
  })
  declare artists: LibraryArtistDto[];

  @ApiProperty({
    type: LibraryComposerDto,
    isArray: true,
  })
  declare composers: LibraryComposerDto[];

  /**
   * A color detected in the cover art image
   */
  @IsString()
  declare coverImageLightVibrant?: string;

  /**
   * A color detected in the cover art image
   */
  @IsString()
  declare coverImageDarkVibrant?: string;

  /**
   * A color detected in the cover art image
   */
  @IsString()
  declare coverImageMuted?: string;

  /**
   * A color detected in the cover art image
   */
  @IsString()
  declare coverImageVibrant?: string;

  /**
   * A color detected in the cover art image
   */
  @IsString()
  declare coverImageDarkMuted?: string;

  /**
   * A color detected in the cover art image
   */
  @IsString()
  declare coverImageLightMuted?: string;

  /**
   * The date the album was added to the library
   */
  @IsDate()
  declare createdAt: Date;

  @ApiProperty({
    type: LibraryGenreDto,
    isArray: true,
  })
  declare genres: LibraryGenreDto[];

  /**
   * The internally-generated unique ID of the album
   */
  @IsInt()
  declare id: number;

  /**
   * The aggregate rating for the album, which is a value between 0 and 5 inclusive applied to tracks.
   */
  @ApiProperty({
    type: 'integer',
  })
  @IsNumber()
  declare rating: RatingOrUnset;

  /**
   * The name or title of the album, this would usually come from an official source such as MusicBrainz
   * or Discogs.
   */
  @IsString()
  declare title: string;

  /**
   * The year the album was released.
   */
  @IsInt()
  declare year: number;
}

export class LibraryAlbumTrackDto extends OmitType(LibraryTrackDto, [
  'albumArtists',
  'albumId',
  'albumTitle',
] as const) {}

export class LibraryAlbumWithTracksDto extends LibraryAlbumDto {
  /**
   * The list of tracks for the album
   */
  @ApiProperty() // not sure why but defining type + isArray results in LibraryAlbumWithTracksDto[][]
  declare tracks: LibraryAlbumTrackDto[];
}
