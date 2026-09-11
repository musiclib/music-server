import { ApiOkResponse, ApiOperation, ApiProduces, ApiTags } from '@nestjs/swagger';
import { BINARY_RESPONSE, GUEST_APIS, IMAGE_MIME_TYPES } from 'src/constants/swagger';
import { Controller, Get, Query, Req, Res, StreamableFile } from '@nestjs/common';
import { GuestAlbumCoverQueryDto } from './album-cover.dto';
import { GuestAlbumCoverService } from './album-cover.service';
import { join, sep } from 'node:path';
import { readFileSync } from 'node:fs';
import type { Request, Response } from 'express';

let blankBuffer: Buffer;
const emptyBuffer = Buffer.alloc(0);

@Controller('/api/guest')
@ApiTags(GUEST_APIS)
export class GuestAlbumCoverController {
  constructor(private readonly albumCoverService: GuestAlbumCoverService) {}

  @Get('album-cover')
  @ApiOperation({
    summary: 'Retrieves cover images for albums',
    description: [
      'This endpoint retrieves the cover image for a specified album.',
      'The image comes from the first song in the album that contains an embedded image.',
      'If the album has no cover image a default blank cover is returned.',
      'The response supports Etag caching to optimize browser performance.',
    ].join('\n'),
  })
  @ApiProduces(...IMAGE_MIME_TYPES)
  @ApiOkResponse(BINARY_RESPONSE)
  async get(
    @Query() query: GuestAlbumCoverQueryDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<StreamableFile | void> {
    const albumCover = await this.albumCoverService.getAlbumCoverImage(query.id, query.size);
    if (albumCover?.coverImage && albumCover?.coverImageMimeType) {
      const eTag = `album-${query.id}-cover-${query.size}-${albumCover.updatedAt?.getTime() || ''}-2`;
      const fileType = albumCover.coverImageMimeType.split(sep).pop();
      response.set({
        'Content-Disposition': `inline; filename="album-cover.${query.id}.${fileType}"`,
        'Content-Type': albumCover.coverImageMimeType,
        ETag: eTag,
      });
      if (request.fresh) {
        response.status(304);
        return new StreamableFile(emptyBuffer);
      }
      return new StreamableFile(albumCover.coverImage);
    }
    response.set({
      'Content-Disposition': `inline; filename="album-cover.${query.id}.png"`,
      'Content-Type': 'image/png',
      ETag: 'blank-cover',
    });
    if (request.fresh) {
      response.status(304);
      return new StreamableFile(emptyBuffer);
    }
    const blankCoverPath = join(__dirname, 'resources', 'blank-cover.png');
    blankBuffer = blankBuffer || readFileSync(blankCoverPath);
    return new StreamableFile(blankBuffer);
  }
}
