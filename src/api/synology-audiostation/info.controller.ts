import { AUTHENTICATED_REQUEST_DESCRIPTION } from './consts';
import { ApiHeader, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Headers, HttpCode, HttpStatus, Logger, Post, UseGuards } from '@nestjs/common';
import { SYNOLOGY_AUDIOSTATION_APIS } from 'src/constants/swagger';
import { SynologyGuard } from './synology.guard';
import { SynologyInfoBodyDto, SynologyInfoResponseDto } from './dtos/info.cgi.dto';
import { SynologyInfoService } from './info.service';

@Controller()
@ApiTags(SYNOLOGY_AUDIOSTATION_APIS)
@UseGuards(SynologyGuard)
export class SynologyInfoController {
  private readonly logger: Logger = new Logger(SynologyInfoController.name);

  constructor(private readonly infoService: SynologyInfoService) {}

  /**
   * The `info.cgi` endpoint returns configuration information for the Synology AudioStation API
   * and client capabilities.
   * @returns
   */
  @Post('/webapi/AudioStation/info.cgi')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Returns configuration information for the Synology AudioStation API and client capabilities',
    description: [
      // eslint-disable-next-line max-len
      `The \`info.cgi\` endpoint returns configuration information for the Synology DS Audio apps.\n\nThe request must be authenticated using a valid Synology session ID and device ID cookie for the user, which can be obtained by signing in via the \`entry.cgi\` endpoint, a two-step process requesting the encryption public key from \`/certs\` and then submitting credentials encrypted with it.`,
      AUTHENTICATED_REQUEST_DESCRIPTION,
    ].join('\n\n'),
  })
  @ApiHeader({
    name: 'cookie',
    description: 'The session ID and device ID cookies for the user `id={sessionId}; did={deviceId}`',
  })
  @ApiOkResponse({
    description: 'Returns configuration information for the Synology AudioStation API and client capabilities',
    type: SynologyInfoResponseDto,
  })
  async route(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Body() body: SynologyInfoBodyDto,
    @Headers('id') sessionTokenHash: string,
  ): Promise<SynologyInfoResponseDto> {
    const data = await this.infoService.getConfiguration(sessionTokenHash);
    return {
      data,
      success: true,
    };
  }
}
