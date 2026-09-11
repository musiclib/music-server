import { ApiExcludeController, ApiTags } from '@nestjs/swagger';
import { Controller, Logger, Post, UseGuards } from '@nestjs/common';
import { SYNOLOGY_AUDIOSTATION_APIS } from 'src/constants/swagger';
import { SynologyGuard } from './synology.guard';

@Controller()
@ApiTags(SYNOLOGY_AUDIOSTATION_APIS)
@ApiExcludeController()
@UseGuards(SynologyGuard)
export class SynologyRemotePlayerController {
  private readonly logger: Logger = new Logger(SynologyRemotePlayerController.name);

  // eslint-disable-next-line class-methods-use-this
  @Post('/webapi/AudioStation/remote_player.cgi')
  async route() {
    return {
      success: false,
    };
  }
}
