import { AlbumEntity } from 'src/database/entities/album.entity';
import { CoverImage } from 'src/types/cover-image';
import { InjectModel } from '@nestjs/sequelize';
import { Injectable } from '@nestjs/common';
import { Op, col, where } from 'sequelize';
import sharp from 'sharp';

@Injectable()
export class GuestAlbumCoverService {
  constructor(
    @InjectModel(AlbumEntity)
    private readonly albumEntity: typeof AlbumEntity,
  ) {}

  async getAlbumCoverImage(albumId: number, size: number): Promise<CoverImage | undefined> {
    const albumCover = await this.albumEntity.findOne({
      attributes: ['coverImage', 'coverImageMimeType', 'createdAt', 'updatedAt'],
      where: {
        id: albumId,
        [Op.and]: [where(col('coverImage'), Op.not, null), where(col('coverImageMimeType'), Op.not, null)],
      },
    });
    if (!albumCover) {
      return undefined;
    }
    const sharpImage = sharp(albumCover.coverImage);
    const metadata = await sharpImage.metadata();
    if (!metadata.width || !metadata.height) {
      return undefined;
    }
    if (metadata.width !== size || metadata.height !== size) {
      const resizedImageBuffer = await sharpImage.resize(size, size, { fit: 'inside' });
      albumCover.coverImage = await resizedImageBuffer.toBuffer();
    }
    return {
      coverImage: albumCover.coverImage,
      coverImageMimeType: albumCover.coverImageMimeType,
      updatedAt: albumCover.updatedAt || albumCover.createdAt,
    };
  }
}
