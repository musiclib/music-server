import { AccountEntity } from 'src/database/entities';
import { AllowedRoles } from '../role.guard';
import { ApiOkResponse, ApiProduces, ApiTags } from '@nestjs/swagger';
import { Controller, Get, HttpCode, HttpStatus, NotFoundException, Query, Req, Res, UseGuards } from '@nestjs/common';
import { CoverImage } from 'src/types/cover-image';
import { QNAP_MUSICSTATION_APIS } from 'src/constants/swagger';
import { QnapGuard } from './qnap.guard';
import { QnapMediaCoverQueryDto } from './dtos/media-cover.dto';
import { QnapMediaCoverService } from './media-cover.service';
import { User } from '../user.decorator';
import { UserRoleEnum } from 'src/types/enums';
import { join, sep } from 'node:path';
import { readFileSync } from 'node:fs';
import type { Request, Response } from 'express';

let blankAlbumBuffer: Buffer;
let blankFolderBuffer: Buffer;
const emptyBuffer = Buffer.alloc(0);

@Controller({
  path: '/musicstation/api',
})
@ApiTags(QNAP_MUSICSTATION_APIS)
@UseGuards(QnapGuard)
export class QnapMediaCoverController {
  constructor(private readonly mediaCoverApiService: QnapMediaCoverService) {}

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
    @Query() query: QnapMediaCoverQueryDto,
  ) {
    const itemId = Number(query.imagepath.split('_')[1]);
    if (!itemId) {
      throw new NotFoundException('Resource not found');
    }
    let cover: CoverImage | undefined;
    let eTagKey: string;
    let fileName: string;
    let blankFileName: string;
    if (query.imagepath.startsWith('album_')) {
      cover = await this.mediaCoverApiService.getAlbumCoverImage(user.id, itemId);
      eTagKey = `album-${itemId}-${cover?.updatedAt?.getTime() || ''}`;
      fileName = `album-cover.${itemId}.${cover?.coverImageMimeType?.split(sep).pop()}`;
      blankFileName = 'album-cover.blank.png';
    } else if (query.imagepath.startsWith('artist_')) {
      cover = await this.mediaCoverApiService.getArtistCoverImage(user.id, itemId);
      eTagKey = `artist-${itemId}-${cover?.updatedAt?.getTime() || ''}`;
      fileName = `artist-cover.${itemId}.${cover?.coverImageMimeType?.split(sep).pop()}`;
      blankFileName = 'artist-cover.blank.png';
    } else if (query.imagepath.startsWith('folder_')) {
      cover = await this.mediaCoverApiService.getFolderCoverImage();
      eTagKey = `folder-${itemId}-${cover?.updatedAt?.getTime() || ''}`;
      fileName = `folder-cover.${itemId}.${cover?.coverImageMimeType?.split(sep).pop()}`;
      blankFileName = 'folder-cover.blank.png';
    } else {
      throw new NotFoundException('Resource not found');
    }
    if (!cover) {
      throw new NotFoundException('Resource not found');
    }
    if (cover?.coverImage && cover?.coverImageMimeType) {
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
      'Content-Disposition': `inline; filename="${blankFileName}"`,
      ETag: blankFileName,
    });
    if (request.fresh) {
      response.status(304);
      return response.end(emptyBuffer);
    }
    if (query.imagepath.startsWith('folder_')) {
      blankFolderBuffer = blankFolderBuffer || readFileSync(join(__dirname, 'resources', 'blank-folder.png'));
      return response.end(blankFolderBuffer);
    }
    blankAlbumBuffer = blankAlbumBuffer || readFileSync(join(__dirname, 'resources', 'blank-cover.png'));
    return response.end(blankAlbumBuffer);
  }
}
