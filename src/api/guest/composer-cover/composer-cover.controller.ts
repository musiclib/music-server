import { ApiOkResponse, ApiOperation, ApiProduces, ApiTags } from '@nestjs/swagger';
import { BINARY_RESPONSE, GUEST_APIS, IMAGE_MIME_TYPES } from 'src/constants/swagger';
import { Controller, Get, Query, Req, Res, StreamableFile } from '@nestjs/common';
import { GuestComposerCoverQueryDto } from './composer-cover.dto';
import { GuestComposerCoverService } from './composer-cover.service';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import type { Request, Response } from 'express';

let blankBuffer: Buffer;
const emptyBuffer = Buffer.alloc(0);

@Controller({
  path: '/api/guest',
})
@ApiTags(GUEST_APIS)
export class GuestComposerCoverController {
  constructor(private readonly composerCoverService: GuestComposerCoverService) {}

  // eslint-disable-next-line class-methods-use-this
  @Get('composer-cover')
  @ApiOperation({
    summary: 'Retrieves cover images for composers',
    description: [
      'This endpoint retrieves the cover image for a specified composer.',
      'The image comes from the first song crediting them as a composer that contains an embedded image.',
      'If the composer has no cover image a default blank cover is returned.',
      'The response supports Etag caching to optimize browser performance.',
    ].join('\n'),
  })
  @ApiProduces(...IMAGE_MIME_TYPES)
  @ApiOkResponse(BINARY_RESPONSE)
  async get(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Query() query: GuestComposerCoverQueryDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<StreamableFile> {
    response.set({
      'Content-Disposition': `inline; filename="composer-cover.${query.id}.png"`,
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
