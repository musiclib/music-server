import { AUTHENTICATED_REQUEST_DESCRIPTION } from './consts';
import { AccountEntity } from 'src/database/entities';
import { ApiHeader, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Logger, Query, Res } from '@nestjs/common';
import { SYNOLOGY_AUDIOSTATION_APIS } from 'src/constants/swagger';
import { StreamCgiQueryDto } from './dtos';
import { SynologyStreamService } from './stream.service';
import { User } from '../user.decorator';
import { getAudioContentType } from 'src/utils/strings';
import type { Response } from 'express';

@Controller()
@ApiTags(SYNOLOGY_AUDIOSTATION_APIS)
export class SynologyStreamController {
  private readonly logger: Logger = new Logger(SynologyStreamController.name);

  constructor(private readonly streamService: SynologyStreamService) {}

  @Get('/webapi/AudioStation/stream.cgi')
  @ApiOperation({
    summary: 'Streams audio files',
    description: [
      // eslint-disable-next-line max-len
      `Downloads audio files from the music library to the client.  This is used to stream audio files for playback or to download for offline usage.  The audio files are streamed in their original format, and the client is responsible for decoding and playing the audio.  Synology implements transcoding for certain formats, but this is not supported in this server.`,
      AUTHENTICATED_REQUEST_DESCRIPTION,
    ].join('\n\n'),
  })
  @ApiHeader({
    name: 'cookie',
    description: 'The session ID and device ID cookies for the user `id={sessionId}; did={deviceId}`',
  })
  @ApiOkResponse({
    schema: {
      type: 'string',
      format: 'binary',
    },
  })
  async getStreamCgi(@User() user: AccountEntity, @Query() query: StreamCgiQueryDto, @Res() res: Response) {
    const streamInfo = await this.streamService.getStream(user.id, query.id);
    res.sendFile(streamInfo.path, {
      headers: {
        'Content-Type': getAudioContentType(streamInfo.codec),
        'Content-Length': streamInfo.fileSize,
      },
    });
  }
}
