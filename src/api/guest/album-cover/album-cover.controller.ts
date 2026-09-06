import { AllowGuest } from 'src/api/role.guard';
import { ApiOkResponse, ApiOperation, ApiProduces, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Query, Req, Res, StreamableFile } from '@nestjs/common';
import { GUEST_APIS } from 'src/constants/swagger';
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
  @AllowGuest()
  @ApiOperation({
    summary: 'Cover images for albums, this route is guest-accessible for better browser handling',
  })
  @ApiProduces('image/jpeg', 'image/png', 'image/webp')
  @ApiOkResponse({
    schema: {
      type: 'string',
      format: 'binary',
    },
  })
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
