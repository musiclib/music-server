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
    if (query.imagepath) {
      const parts = query.imagepath.split('?').pop();
      if (parts?.length) {
        const [key, val] = parts.split('=');
        if (val) {
          const q = query;
          if (key === 'artistId') {
            q.artistId = Number.parseInt(val, 10);
          } else if (key === 'albumId') {
            q.albumId = Number.parseInt(val, 10);
          } else if (key === 'folderId') {
            q.folderId = Number.parseInt(val, 10);
          }
        }
      }
    }

    let cover: CoverImage | undefined;
    let eTagKey: string;
    let fileName: string;
    let blankFileName: string;
    if (query.albumId) {
      cover = await this.mediaCoverApiService.getAlbumCoverImage(user.id, query.albumId);
      eTagKey = `album-${query.albumId}-${cover?.updatedAt?.getTime() || ''}`;
      fileName = `album-cover.${query.albumId}.${cover?.coverImageMimeType?.split(sep).pop()}`;
      blankFileName = 'album-cover.blank.png';
    } else if (query.artistId) {
      cover = await this.mediaCoverApiService.getArtistCoverImage(user.id, query.artistId);
      eTagKey = `artist-${query.artistId}-${cover?.updatedAt?.getTime() || ''}`;
      fileName = `artist-cover.${query.artistId}.${cover?.coverImageMimeType?.split(sep).pop()}`;
      blankFileName = 'artist-cover.blank.png';
    } else if (query.folderId) {
      cover = await this.mediaCoverApiService.getFolderCoverImage();
      eTagKey = `folder-${query.folderId}-${cover?.updatedAt?.getTime() || ''}`;
      fileName = `folder-cover.${query.folderId}.${cover?.coverImageMimeType?.split(sep).pop()}`;
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
    if (query.folderId) {
      blankFolderBuffer = blankFolderBuffer || readFileSync(join(__dirname, 'resources', 'blank-folder.png'));
      return response.end(blankFolderBuffer);
    }
    blankAlbumBuffer = blankAlbumBuffer || readFileSync(join(__dirname, 'resources', 'blank-cover.png'));
    return response.end(blankAlbumBuffer);
  }
}
