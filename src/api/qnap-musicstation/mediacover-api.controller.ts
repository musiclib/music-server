import { AccountEntity } from 'src/database/entities';
import { AllowedRoles } from '../role.guard';
import { ApiOkResponse, ApiProduces, ApiTags } from '@nestjs/swagger';
import { Controller, Get, HttpCode, HttpStatus, NotFoundException, Query, Req, Res, UseGuards } from '@nestjs/common';
import { CoverImage } from 'src/types/cover-image';
import { QNAP_MUSICSTATION_APIS } from 'src/constants/swagger';
import { QnapGuard } from './qnap.guard';
import { QnapMediaCoverApiQueryDto } from './dtos/mediacover-api.dto';
import { QnapMediaCoverApiService } from './mediacover-api.service';
import { User } from '../user.decorator';
import { UserRoleEnum } from 'src/types/enums';
import { join, sep } from 'node:path';
import { readFileSync } from 'node:fs';
import type { Request, Response } from 'express';

let blankBuffer: Buffer;
const emptyBuffer = Buffer.alloc(0);

@Controller({
  path: '/musicstation/api',
})
@ApiTags(QNAP_MUSICSTATION_APIS)
@UseGuards(QnapGuard)
export class QnapMediaCoverApiController {
  constructor(private readonly mediaCoverApiService: QnapMediaCoverApiService) {}

  @Get('mediacover_api.php')
  @AllowedRoles([UserRoleEnum.USER, UserRoleEnum.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiProduces('image/jpeg', 'image/png', 'image/webp')
  @ApiOkResponse({
    schema: {
      type: 'string',
      format: 'binary',
    },
  })
  async get(
    @User() user: AccountEntity,
    @Req() request: Request,
    @Res() response: Response,
    @Query() query: QnapMediaCoverApiQueryDto,
  ) {
    const itemId = Number(query.imagepath.split('_')[1]);
    if (!itemId) {
      throw new NotFoundException('Resource not found');
    }
    let cover: CoverImage | undefined;
    let eTagKey: string;
    let fileName: string;
    if (query.imagepath.startsWith('album_')) {
      cover = await this.mediaCoverApiService.getAlbumCoverImage(user.id, itemId);
      eTagKey = `album-${itemId}-${cover?.updatedAt?.getTime() || ''}`;
      fileName = `album-cover.${itemId}.${cover?.coverImageMimeType?.split(sep).pop()}`;
    } else if (query.imagepath.startsWith('artist_')) {
      cover = await this.mediaCoverApiService.getArtistCoverImage(user.id, itemId);
      eTagKey = `artist-${itemId}-${cover?.updatedAt?.getTime() || ''}`;
      fileName = `artist-cover.${itemId}.${cover?.coverImageMimeType?.split(sep).pop()}`;
    } else {
      throw new NotFoundException('Resource not found');
    }
    if (!cover) {
      throw new NotFoundException('Resource not found');
    }
    if (cover?.coverImage) {
      response.set({
        'Content-Type': cover.coverImageMimeType,
        'Content-Disposition': `inline; filename="${fileName}"`,
        ETag: eTagKey,
      });
      if (request.fresh) {
        response.status(304);
        return response.end(emptyBuffer);
      }
      return response.end(cover.coverImage);
    }
    response.set({
      'Content-Type': 'image/png',
      'Content-Disposition': `inline; filename="album-cover.blank.png"`,
      ETag: 'blank-cover',
    });
    if (request.fresh) {
      response.status(304);
      return response.end(emptyBuffer);
    }
    blankBuffer = blankBuffer || readFileSync(join(__dirname, 'resources', 'blank-cover.png'));
    return response.end(blankBuffer);
  }
}
