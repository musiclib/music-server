import { AUTHENTICATED_REQUEST_DESCRIPTION } from './consts';
import { AllowGuest } from '../role.guard';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Controller, HttpCode, HttpStatus, Logger, Post, UseGuards } from '@nestjs/common';
import { SYNOLOGY_AUDIOSTATION_APIS } from 'src/constants/swagger';
import { SynologyGuard } from './synology.guard';
import { SynologyQueryService } from './query.service';

@Controller()
@ApiTags(SYNOLOGY_AUDIOSTATION_APIS)
@UseGuards(SynologyGuard)
export class SynologyQueryController {
  private readonly logger: Logger = new Logger(SynologyQueryController.name);

  constructor(private readonly queryService: SynologyQueryService) {}

  /**
   * The initial request to the Synology AudioStation API returns information for all of the available
   * Synology software features.  This endpoint omits any features that are not relevant to AudioStation.
   * @returns The JSON response containing the API information.
   */
  @Post('/webapi/query.cgi')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Returns information about the Synology AudioStation API',
    description: [
      `Provides information to Synology DS Audio apps about the server and its capabilities.`,
      AUTHENTICATED_REQUEST_DESCRIPTION,
    ].join('\n\n'),
  })
  @AllowGuest()
  async route() {
    const data = this.queryService.getApiCapabilities();
    return {
      data,
      success: true,
    };
  }
}
