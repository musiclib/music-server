import { AccountEntity } from 'src/database/entities';
import {
  ApiBody,
  ApiExtraModels,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { Body, Controller, HttpCode, HttpStatus, Logger, Post, UseGuards } from '@nestjs/common';
import {
  PAGINATED_DATA_DESCRIPTION,
  SYNOLOGY_AUDIOSTATION_APIS,
  SYNOLOGY_AUTHENTICATED_REQUEST_DESCRIPTION,
  SYNOLOGY_COOKIE_HEADER,
} from 'src/constants/swagger';
import {
  SynologyArtistResponseDto,
  SynologyArtistsBodyDto,
  SynologyArtistsByDefaultGenreBodyDto,
  SynologyArtistsByGenreBodyDto,
} from './dtos';
import { SynologyArtistService } from './artist.service';
import { SynologyGuard } from './synology.guard';
import { User } from '../user.decorator';
import { plainToInstance } from 'class-transformer';

@Controller()
@ApiTags(SYNOLOGY_AUDIOSTATION_APIS)
@UseGuards(SynologyGuard)
export class SynologyArtistController {
  private readonly logger: Logger = new Logger(SynologyArtistController.name);

  constructor(private readonly artistService: SynologyArtistService) {}

  @Post('/webapi/AudioStation/artist.cgi')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Lists artists in the music library',
    description: [
      `Lists artists found in the music library.  The artists can be filtered by genre.`,
      PAGINATED_DATA_DESCRIPTION,
      SYNOLOGY_AUTHENTICATED_REQUEST_DESCRIPTION,
    ].join('\n\n'),
  })
  @ApiHeader(SYNOLOGY_COOKIE_HEADER)
  @ApiOkResponse({
    description: 'Returns a list of artists',
    type: SynologyArtistResponseDto,
  })
  @ApiExtraModels(SynologyArtistsBodyDto, SynologyArtistsByGenreBodyDto, SynologyArtistsByDefaultGenreBodyDto)
  @ApiBody({
    schema: {
      oneOf: [
        {
          $ref: getSchemaPath(SynologyArtistsBodyDto),
        },
        {
          $ref: getSchemaPath(SynologyArtistsByGenreBodyDto),
        },
        {
          $ref: getSchemaPath(SynologyArtistsByDefaultGenreBodyDto),
        },
      ],
    },
  })
  async route(
    @User() user: AccountEntity,
    @Body()
    variousBodies: SynologyArtistsBodyDto | SynologyArtistsByGenreBodyDto | SynologyArtistsByDefaultGenreBodyDto,
  ) {
    // Route #1:  artists in a genre
    if ('genre' in variousBodies) {
      return this.listArtistsInGenre(user, plainToInstance(SynologyArtistsByGenreBodyDto, variousBodies));
    }
    // Route #2:  artists in a "default" genre
    if ('genre_filter' in variousBodies) {
      return this.listArtistsInDefaultGenre(user, plainToInstance(SynologyArtistsByDefaultGenreBodyDto, variousBodies));
    }
    // Route #3:  all artists
    return this.listArtists(user, plainToInstance(SynologyArtistsBodyDto, variousBodies));
  }

  private async listArtistsInGenre(user: AccountEntity, body: SynologyArtistsByGenreBodyDto) {
    const data = await this.artistService.listArtistsByGenre(user.id, body.genre, body.offset, body.limit);
    return {
      data,
      success: true,
    };
  }

  private async listArtistsInDefaultGenre(user: AccountEntity, body: SynologyArtistsByDefaultGenreBodyDto) {
    const data = await this.artistService.listArtistsByGenre(user.id, body.genre_filter, body.offset, body.limit);
    return {
      data,
      success: true,
    };
  }

  private async listArtists(user: AccountEntity, body: SynologyArtistsBodyDto) {
    const data = await this.artistService.listArtists(user.id, body.offset, body.limit);
    return {
      data,
      success: true,
    };
  }
}
