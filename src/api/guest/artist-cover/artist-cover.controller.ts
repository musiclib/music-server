import { ApiOkResponse, ApiOperation, ApiProduces, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Query, Req, Res, StreamableFile } from '@nestjs/common';
import { GUEST_APIS } from 'src/constants/swagger';
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
    summary: 'Cover images for artists.  This route is guest-accessible for better browser-handling.',
  })
  @ApiProduces('image/jpeg', 'image/png', 'image/webp')
  @ApiOkResponse({
    schema: {
      type: 'string',
      format: 'binary',
    },
  })
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
