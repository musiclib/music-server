import { AUTHENTICATED_REQUEST_DESCRIPTION } from './consts';
import { AllowGuest } from '../role.guard';
import {
  ApiBody,
  ApiExtraModels,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { Body, Controller, Get, HttpCode, HttpStatus, Logger, Post, Query, Res, UseGuards } from '@nestjs/common';
import { SYNOLOGY_AUDIOSTATION_APIS } from 'src/constants/swagger';
import { SynologyGuard } from './synology.guard';
import {
  SynologyProxyDeleteSongInfoBodyDto,
  SynologyProxySongInfoBodyDto,
  SynologyProxySongInfoResponseDto,
  SynologyProxyStreamInfoBodyDto,
  SynologyProxyStreamInfoResponseDto,
  SynologyProxyStreamQueryDto,
} from './dtos/proxy.cgi.dto';
import { SynologyProxyService } from './proxy.service';
import { SynologySuccessResponseDto } from './dtos/synology.dto';
import { plainToInstance } from 'class-transformer';
import type { Response } from 'express';

@Controller()
@ApiTags(SYNOLOGY_AUDIOSTATION_APIS)
@UseGuards(SynologyGuard)
export class SynologyProxyController {
  private readonly logger: Logger = new Logger(SynologyProxyController.name);

  constructor(private readonly proxyService: SynologyProxyService) {}

  @Post('/webapi/AudioStation/proxy.cgi')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Proxies SHOUTcast radio streams',
    description: [
      `Creates and terminates a basic HTTP proxy to a SHOUTcast radio stream.`,
      AUTHENTICATED_REQUEST_DESCRIPTION,
    ].join('\n\n'),
  })
  @ApiHeader({
    name: 'cookie',
    description: 'The session ID and device ID cookies for the user `id={sessionId}; did={deviceId}`',
  })
  @ApiOkResponse({
    description: 'Proxies a SHOUTcast radio stream',
    schema: {
      oneOf: [
        {
          $ref: getSchemaPath(SynologyProxyStreamInfoResponseDto),
        },
        {
          $ref: getSchemaPath(SynologyProxySongInfoResponseDto),
        },
        {
          $ref: getSchemaPath(SynologySuccessResponseDto),
        },
      ],
    },
  })
  @ApiBody({
    description: 'Creates a new SHOUTcast radio stream',
    schema: {
      oneOf: [
        {
          $ref: getSchemaPath(SynologyProxyStreamInfoBodyDto),
        },
        {
          $ref: getSchemaPath(SynologyProxySongInfoBodyDto),
        },
        {
          $ref: getSchemaPath(SynologyProxyDeleteSongInfoBodyDto),
        },
      ],
    },
  })
  @ApiExtraModels(
    SynologyProxyStreamInfoBodyDto,
    SynologyProxySongInfoBodyDto,
    SynologyProxyDeleteSongInfoBodyDto,
    SynologyProxyStreamInfoResponseDto,
    SynologyProxySongInfoResponseDto,
    SynologySuccessResponseDto,
  )
  async route(
    @Body()
    variousBodies: SynologyProxyStreamInfoBodyDto | SynologyProxySongInfoBodyDto | SynologyProxyDeleteSongInfoBodyDto,
  ): Promise<SynologyProxyStreamInfoResponseDto | SynologyProxySongInfoResponseDto | SynologySuccessResponseDto> {
    if (variousBodies.method === 'getstreamid') {
      // this request can come in two formats:
      // 1) `id` of the SHOUTcast radio station is `radio_<station title> <station url>`
      // 2) `id` of the SHOUTcast radio station is `<container>_<genre> <favorite title>`
      const body = plainToInstance(SynologyProxyStreamInfoBodyDto, variousBodies);
      const data = await this.proxyService.createStream(body.id);
      return {
        data,
        success: true,
      };
    }
    if (variousBodies.method === 'deletesonginfo') {
      const body = plainToInstance(SynologyProxyDeleteSongInfoBodyDto, variousBodies);
      await this.proxyService.deleteSongInfo(body.stream_id);
      return {
        success: true,
      };
    }
    const body = plainToInstance(SynologyProxySongInfoBodyDto, variousBodies);
    const data = await this.proxyService.getCurrentSongInfo(body.stream_id);
    return {
      data,
      success: true,
    };
  }

  @Get('/webapi/AudioStation/proxy.cgi')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Proxies SHOUTcast radio streams',
    description: `Pipes the SHOUTcast radio stream to the client.`,
  })
  @AllowGuest()
  async getProxyCgi(@Query() query: SynologyProxyStreamQueryDto, @Res() response: Response): Promise<void> {
    this.proxyService.proxyStream(query.stream_id, response);
  }
}
