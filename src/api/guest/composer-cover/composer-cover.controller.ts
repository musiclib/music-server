import { ApiOkResponse, ApiOperation, ApiProduces, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Query, Req, Res, StreamableFile } from '@nestjs/common';
import { GUEST_APIS } from 'src/constants/swagger';
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
    summary: 'Cover images for composers.  This route is guest-accessible for better browser-handling.',
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
