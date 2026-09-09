import { AUTHENTICATED_REQUEST_DESCRIPTION, PAGINATED_DATA_DESCRIPTION } from './consts';
import { AccountEntity } from 'src/database/entities';
import { ApiExtraModels, ApiHeader, ApiOkResponse, ApiOperation, ApiTags, getSchemaPath } from '@nestjs/swagger';
import { Body, Controller, HttpCode, HttpStatus, Logger, Post, UseGuards } from '@nestjs/common';
import { SYNOLOGY_AUDIOSTATION_APIS } from 'src/constants/swagger';
import { SynologyDefaultGenreResponseDto, SynologyGenreBodyDto, SynologyGenreResponseDto } from './dtos';
import { SynologyGenreService } from './genre.service';
import { SynologyGuard } from './synology.guard';
import { SynologyMethodEnum } from './enums';
import { User } from '../user.decorator';

@Controller()
@ApiTags(SYNOLOGY_AUDIOSTATION_APIS)
@UseGuards(SynologyGuard)
export class SynologyGenreController {
  private readonly logger: Logger = new Logger(SynologyGenreController.name);

  constructor(private readonly genreService: SynologyGenreService) {}

  @Post('/webapi/AudioStation/genre.cgi')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Lists genres in the music library or default genres',
    description: [
      // eslint-disable-next-line max-len
      `Returns a list of genres found in the music library, or a hard-coded list of default genres.  The default genres are a hard-coded list that Synology appears to internally remap to actual genres, for instance "Rock/Metal" encompasses the "AlternRock" genre.  Exactly what they remap is unclear.`,
      // eslint-disable-next-line max-len
      `Each track can have one or more genres separated by \`,\` and they will each be counted as a separate genre.  For instance, a track with the genre "Rock, Pop" will be counted as both "Rock" and "Pop".`,
      PAGINATED_DATA_DESCRIPTION,
      AUTHENTICATED_REQUEST_DESCRIPTION,
    ].join('\n\n'),
  })
  @ApiHeader({
    name: 'cookie',
    description: 'The session ID and device ID cookies for the user `id={sessionId}; did={deviceId}`',
  })
  @ApiOkResponse({
    description: 'Returns a list of genres found in the music library, or a hard-coded list of default genres',
    schema: {
      oneOf: [
        {
          $ref: getSchemaPath(SynologyGenreResponseDto),
        },
        {
          $ref: getSchemaPath(SynologyDefaultGenreResponseDto),
        },
      ],
    },
  })
  @ApiExtraModels(SynologyGenreResponseDto, SynologyDefaultGenreResponseDto)
  async route(
    @User() user: AccountEntity,
    @Body() body: SynologyGenreBodyDto,
  ): Promise<SynologyGenreResponseDto | SynologyDefaultGenreResponseDto> {
    // Route #1:  the default genres presented in the "recommended genre" section of the app
    if (body.method === SynologyMethodEnum.LIST_DEFAULT_GENRE) {
      const data = await this.genreService.listDefaultGenres(user.id);
      return {
        data,
        success: true,
      };
    }
    // Route #2:  the genres present in the music catalog
    const data = await this.genreService.listGenres(user.id, body.offset || 0, body.limit || 100000);
    return {
      data,
      success: true,
    };
  }
}
