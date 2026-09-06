/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { FileTypeEnum } from 'src/types/enums';
import { IsEnum, IsInt, IsNumber, IsString } from 'class-validator';
import { LibraryArtistDto, LibraryComposerDto } from '.';
import { LibraryGenreDto } from './library.genre.dto';
import type { RatingOrUnset } from 'src/types';

export class LibraryTrackDto {
  /**
   * The list of artists for the track.
   */
  @ApiProperty() // not sure why but defining type + isArray results in LibraryArtistDto[][]
  declare albumArtists: LibraryArtistDto[];

  /**
   * The title of the album to which the track belongs.
   */
  @IsString()
  declare albumId: number;

  /**
   * The title of the album to which the track belongs.
   */
  @IsString()
  declare albumTitle: string;

  /**
   * The list of artists for the track.
   */
  @ApiProperty() // not sure why but defining type + isArray results in LibraryArtistDto[][]
  declare artists: LibraryArtistDto[];

  /**
   * The comment or description associated with the track.
   */
  @IsString()
  declare comment: string;

  /**
   * The list of composers for the track.
   */
  @ApiProperty() // not sure why but defining type + isArray results in LibraryComposerDto[][]
  declare composers: LibraryComposerDto[];

  /**
   * The disc number of the track on the album or disc if there are multiple discs.  If this field is not
   * specified it is assumed to be a single-disc album.
   */
  declare discNumber: number;

  /**
   * The duration of the track in seconds.
   */
  @IsNumber()
  declare duration: number;

  /**
   * The bitrate of the audio file for the track, in Kb/s.
   */
  @IsInt()
  declare fileBitRate: number;

  /**
   * The number of audio channels in the file for the track, such as 2 for stereo or 1 for mono.
   */
  @IsInt()
  declare fileChannels: number;

  /**
   * The frequency or sample rate of the audio file for the track, in Hz.
   */
  @IsInt()
  declare fileFrequency: number;

  /**
   * The file path of the file for the track.
   */
  @IsString()
  declare filePath: string;

  /**
   * The size of the file in bytes
   */
  @IsInt()
  declare fileSize: number;

  /**
   * The type of the file for the track, such as MP3, FLAC, etc.
   */
  @IsEnum(FileTypeEnum)
  declare fileType: FileTypeEnum;

  /**
   * The list of genres for the track.
   */
  @ApiProperty({
    type: LibraryGenreDto,
    isArray: true,
  })
  declare genres: LibraryGenreDto[];

  /**
   * The internally-generated unique ID of the track
   */
  @IsInt()
  declare id: number;

  /**
   * The rating of the track which is a value between 0 and 5 inclusive applied to the track.
   */
  @IsInt()
  declare rating: RatingOrUnset;

  /**
   * The title of the track, which is usually the name of the song or piece of music.
   */
  @IsString()
  declare title: string;

  /**
   * The track number of the track on the album or disc if there are multiple discs.
   */
  @IsInt()
  declare trackNumber: number;

  /**
   * The year of release of the track, often the same as the album except in "greatest hits"
   * and compilations.
   */
  @IsInt()
  declare year: number;
}
