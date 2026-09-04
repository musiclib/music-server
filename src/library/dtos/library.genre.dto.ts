/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString } from 'class-validator';
import { LibraryAlbumWithTracksDto } from './library.album.dto';

export class LibraryGenreDto {
  /**
   * The internally-generated unique ID of the genre
   */
  @IsInt()
  declare id: number;

  /**
   * The name of the genre.
   */
  @IsString()
  declare name: string;
}

export class LibraryGenreWithTracksDto extends LibraryGenreDto {
  /**
   * The list of albums including tracks for the genre
   */
  @ApiProperty() // not sure why but defining type + isArray results in LibraryAlbumWithTracksDto[][]
  declare albums: LibraryAlbumWithTracksDto[];
}
