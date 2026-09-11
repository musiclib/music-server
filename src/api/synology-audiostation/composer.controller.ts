import { AccountEntity } from 'src/database/entities';
import { ApiHeader, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Body, Controller, HttpCode, HttpStatus, Logger, Post, UseGuards } from '@nestjs/common';
import {
  PAGINATED_DATA_DESCRIPTION,
  SYNOLOGY_AUDIOSTATION_APIS,
  SYNOLOGY_AUTHENTICATED_REQUEST_DESCRIPTION,
  SYNOLOGY_COOKIE_HEADER,
} from 'src/constants/swagger';
import { SynologyComposerBodyDto, SynologyComposerResponseDto } from './dtos/composer.cgi.dto';
import { SynologyComposerService } from './composer.service';
import { SynologyGuard } from './synology.guard';
import { User } from '../user.decorator';

@Controller()
@ApiTags(SYNOLOGY_AUDIOSTATION_APIS)
@UseGuards(SynologyGuard)
export class SynologyComposerController {
  private readonly logger: Logger = new Logger(SynologyComposerController.name);

  constructor(private readonly composerService: SynologyComposerService) {}

  @Post('/webapi/AudioStation/composer.cgi')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Lists composers in the music library',
    description: [
      // eslint-disable-next-line max-len
      `Lists composers found in the music library.  These are extracted from song metadata and are not necessarily the same as the artists.  This field can be problematic due to inconsistent structure for multiple composers, such as "Composer 1, Composer 2" vs "Composer 1; Composer 2" vs "Composer 1 & Composer 2".`,
      // eslint-disable-next-line max-len
      `When a track is recognized as having multiple composers, each composer is counted as a separate composer.  For  instance, a track with the composer "Composer 1, Composer 2" will be counted as both "Composer 1" and "Composer 2".`,
      PAGINATED_DATA_DESCRIPTION,
      SYNOLOGY_AUTHENTICATED_REQUEST_DESCRIPTION,
    ].join('\n\n'),
  })
  @ApiHeader(SYNOLOGY_COOKIE_HEADER)
  @ApiOkResponse({
    description: 'Returns a list of composers',
    type: SynologyComposerResponseDto,
  })
  async route(
    @User() user: AccountEntity,
    @Body() body: SynologyComposerBodyDto,
  ): Promise<SynologyComposerResponseDto> {
    // Route #1:  list composers
    const data = await this.composerService.listComposers(user.id, body.offset, body.limit);
    return {
      data,
      success: true,
    };
  }
}
