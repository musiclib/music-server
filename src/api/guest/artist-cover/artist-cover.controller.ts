import { ApiOkResponse, ApiOperation, ApiProduces, ApiTags } from '@nestjs/swagger';
import { BINARY_RESPONSE, GUEST_APIS, IMAGE_MIME_TYPES } from 'src/constants/swagger';
import { Controller, Get, Query, Req, Res, StreamableFile } from '@nestjs/common';
import { GuestArtistCoverQueryDto } from './artist-cover.dto';
import { GuestArtistCoverService } from './artist-cover.service';
import { join, sep } from 'node:path';
import { readFileSync } from 'node:fs';
import type { Request, Response } from 'express';

let blankBuffer: Buffer;
const emptyBuffer = Buffer.alloc(0);

@Controller({
  path: '/api/guest',
})
@ApiTags(GUEST_APIS)
export class GuestArtistCoverController {
  constructor(private readonly artistCoverService: GuestArtistCoverService) {}

  @Get('artist-cover')
  @ApiOperation({
    summary: 'Retrieves cover images for artists',
    description: [
      'This endpoint retrieves the cover image for a specified artist.',
      // eslint-disable-next-line max-len
      'The image comes from the first track that contains a cover and credits them as an album artist, falling back to the first track crediting them as a track artist.',
      'If the artist has no cover image a default blank cover is returned.',
      'The response supports Etag caching to optimize browser performance.',
    ].join('\n'),
  })
  @ApiProduces(...IMAGE_MIME_TYPES)
  @ApiOkResponse(BINARY_RESPONSE)
  async get(
    @Query() query: GuestArtistCoverQueryDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<StreamableFile> {
    const artistCover = await this.artistCoverService.getArtistCoverImage(query.id, query.size);
    if (artistCover?.coverImage && artistCover.coverImageMimeType) {
      const eTag = `artist-${query.id}-cover-${query.size}-${artistCover.updatedAt?.getTime() || ''}`;
      const fileType = artistCover.coverImageMimeType.split(sep).pop();
      response.set({
        'Content-Disposition': `inline; filename="artist-cover.${query.id}.${fileType}"`,
        'Content-Type': artistCover.coverImageMimeType,
        ETag: eTag,
      });
      if (request.fresh) {
        response.status(304);
        return new StreamableFile(emptyBuffer);
      }
      return new StreamableFile(artistCover.coverImage);
    }
    response.set({
      'Content-Disposition': `inline; filename="artist-cover.${query.id}.png"`,
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
