import { ApiOkResponse, ApiOperation, ApiProduces, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Query, Req, Res, StreamableFile } from '@nestjs/common';
import { GUEST_APIS } from 'src/constants/swagger';
import { GuestGenreCoverQueryDto } from './genre-cover.dto';
import { GuestGenreCoverService } from './genre-cover.service';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import type { Request, Response } from 'express';

let blankBuffer: Buffer;
const emptyBuffer = Buffer.alloc(0);

@Controller({
  path: '/api/guest',
})
@ApiTags(GUEST_APIS)
export class GuestGenreCoverController {
  constructor(private readonly genreCoverService: GuestGenreCoverService) {}

  // eslint-disable-next-line class-methods-use-this
  @Get('genre-cover')
  @ApiOperation({
    summary: 'Retrieves cover images for genres',
    description: ['This endpoint returns a placeholder image for all genres.'].join('\n'),
  })
  @ApiProduces('image/jpeg', 'image/png', 'image/webp')
  @ApiOkResponse({
    schema: {
      type: 'string',
      format: 'binary',
    },
  })
  async get(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Query() query: GuestGenreCoverQueryDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<StreamableFile> {
    // const genreCover = await this.genreCoverService.getGenreCoverImage(query.id, query.size);
    // if (genreCover?.coverImage) {
    //   return new StreamableFile(genreCover.coverImage, {
    //     type: genreCover.coverImageMimeType,
    //     disposition: 'inline',
    //     length: genreCover.coverImage.length,
    //   });
    // }
    response.set({
      'Content-Disposition': `inline; filename="genre-cover.${query.id}.png"`,
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
