import { ApiTags } from '@nestjs/swagger';
import { Controller, Logger, Post, UseGuards } from '@nestjs/common';
import { SYNOLOGY_AUDIOSTATION_APIS } from 'src/constants/swagger';
import { SynologyGuard } from './synology.guard';

@Controller()
@ApiTags(SYNOLOGY_AUDIOSTATION_APIS)
@UseGuards(SynologyGuard)
export class SynologyLyricsController {
  private readonly logger: Logger = new Logger(SynologyLyricsController.name);

  // eslint-disable-next-line class-methods-use-this
  @Post('/webapi/AudioStation/lyrics.cgi')
  async route() {
    return {
      success: false,
    };
  }

  // eslint-disable-next-line class-methods-use-this
  @Post('/webapi/AudioStation/lyrics_search.cgi')
  async routeSearch() {
    return {
      success: false,
    };
  }
}
