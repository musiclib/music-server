import { AUTHENTICATED_REQUEST_DESCRIPTION } from 'src/api/synology-audiostation/consts';
import { AllowGuest } from 'src/api/role.guard';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Query, Req, Res, StreamableFile } from '@nestjs/common';
import { GUEST_APIS } from 'src/constants/swagger';
import { GuestStreamFileNotFoundResponseDto, GuestStreamFileQueryDto } from './stream-file.dto';
import { GuestStreamFileService } from './stream-file.service';
import { getAudioContentType } from 'src/utils/strings';
import { readFileSync } from 'node:fs';
import { sep } from 'node:path';
import type { Request, Response } from 'express';

const emptyBuffer = Buffer.alloc(0);

@Controller({
  path: '/api/guest',
})
@ApiTags(GUEST_APIS)
export class GuestStreamFileController {
  constructor(private readonly streamFileService: GuestStreamFileService) {}

  @Get('stream-file')
  @AllowGuest()
  @ApiOperation({
    summary: 'Streams audio files.  This route is guest-accessible for better browser handling.',
    description: [
      // eslint-disable-next-line max-len
      `Downloads audio files from the music library to the client.  This is used to stream audio files for playback or to download for offline usage.  The audio files are streamed in their original format, and the client is responsible for decoding and playing the audio.  Synology implements transcoding for certain formats, but this is not supported in this server.`,
      AUTHENTICATED_REQUEST_DESCRIPTION,
    ].join('\n\n'),
  })
  @ApiOkResponse({
    schema: {
      type: 'string',
      format: 'binary',
    },
  })
  @ApiNotFoundResponse({
    description: 'The requested file was not found',
    type: GuestStreamFileNotFoundResponseDto,
  })
  async get(
    @Query() query: GuestStreamFileQueryDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const streamInfo = await this.streamFileService.getStream(query.id);
    const fileType = streamInfo.path.split(sep).pop();
    const eTag = `file-${query.id}-${streamInfo.updatedAt?.getTime() || ''}`;
    response.set({
      'Content-Disposition': `inline; filename="track.${query.id}.${fileType}"`,
      'Content-Type': getAudioContentType(streamInfo.codec),
      ETag: eTag,
    });
    if (request.fresh) {
      response.status(304);
      return new StreamableFile(emptyBuffer);
    }
    const buffer = readFileSync(streamInfo.path);
    return new StreamableFile(buffer);
  }
}
