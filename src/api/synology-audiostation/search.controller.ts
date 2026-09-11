import { AccountEntity } from 'src/database/entities';
import { ApiHeader, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Body, Controller, HttpCode, HttpStatus, Logger, Post, UseGuards } from '@nestjs/common';
import {
  SYNOLOGY_AUDIOSTATION_APIS,
  SYNOLOGY_AUTHENTICATED_REQUEST_DESCRIPTION,
  SYNOLOGY_COOKIE_HEADER,
} from 'src/constants/swagger';
import { SynologyGuard } from './synology.guard';
import { SynologySearchBodyDto, SynologySearchResponseDto } from './dtos/search.cgi.dto';
import { SynologySearchService } from './search.service';
import { User } from '../user.decorator';

@Controller()
@ApiTags(SYNOLOGY_AUDIOSTATION_APIS)
@UseGuards(SynologyGuard)
export class SynologySearchController {
  private readonly logger: Logger = new Logger(SynologySearchController.name);

  constructor(private readonly searchService: SynologySearchService) {}

  @Post('/webapi/AudioStation/search.cgi')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Searches for artists, albums and songs in the music library',
    description: [
      // eslint-disable-next-line max-len
      `Searches for artists, albums and songs in the music library matching a search query.  The search  is case-insensitive and supports partially matching names and titles, a search for "beat" will match "The Beatles" and "Beat It".`,
      `The search results are unpaginated.`,
      SYNOLOGY_AUTHENTICATED_REQUEST_DESCRIPTION,
    ].join('\n\n'),
  })
  @ApiHeader(SYNOLOGY_COOKIE_HEADER)
  @ApiOkResponse({
    description: 'Returns a list of artists, albums and songs matching a search query',
    type: SynologySearchResponseDto,
  })
  async route(@User() user: AccountEntity, @Body() body: SynologySearchBodyDto): Promise<SynologySearchResponseDto> {
    const data = await this.searchService.listSearchResults(user.id, body.keyword);
    return {
      data,
      success: true,
    };
  }
}
