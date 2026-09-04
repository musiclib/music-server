/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsInt, IsString } from 'class-validator';
import { LibraryAlbumWithTracksDto } from './library.album.dto';

export class LibraryComposerDto {
  /**
   * The date the composer was added to the library
   */
  @ApiProperty({
    type: Date,
    format: 'date-time',
  })
  @IsDate()
  declare createdAt: Date;

  /**
   * The internally-generated unique ID of the composer
   */
  @IsInt()
  declare id: number;

  /**
   * The name of the composer.
   */
  @IsString()
  declare name: string;
}

export class LibraryComposerWithTracksDto extends LibraryComposerDto {
  /**
   * The list of albums including tracks for the composer
   */
  @ApiProperty() // not sure why but defining type + isArray results in LibraryAlbumWithTracksDto[][]
  declare albums: LibraryAlbumWithTracksDto[];
}
