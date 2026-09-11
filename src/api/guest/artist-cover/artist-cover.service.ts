import { AlbumArtistEntity, LinkedArtistEntity } from 'src/database/entities';
import { AlbumEntity } from 'src/database/entities/album.entity';
import { CoverImage } from 'src/types/cover-image';
import { InjectModel } from '@nestjs/sequelize/dist/common/sequelize.decorators';
import { Injectable } from '@nestjs/common';
import { Op, col, where } from 'sequelize';
import sharp from 'sharp';

@Injectable()
export class GuestArtistCoverService {
  constructor(
    @InjectModel(AlbumEntity)
    private readonly albumEntity: typeof AlbumEntity,
  ) {}

  async getArtistCoverImage(artistId: number, size: number): Promise<CoverImage | undefined> {
    let artistCover = await this.albumEntity.findOne({
      attributes: ['id', 'coverImage', 'coverImageMimeType', 'createdAt', 'updatedAt'],
      include: [
        {
          attributes: ['albumId', 'artistId'],
          model: AlbumArtistEntity,
          where: {
            artistId,
          },
          required: true,
        },
      ],
      where: {
        [Op.and]: [where(col('coverImage'), Op.not, null), where(col('coverImageMimeType'), Op.not, null)],
      },
    });
    if (!artistCover) {
      artistCover = await this.albumEntity.findOne({
        attributes: ['id', 'coverImage', 'coverImageMimeType', 'createdAt', 'updatedAt'],
        include: [
          {
            attributes: ['albumId', 'artistId'],
            model: LinkedArtistEntity,
            where: {
              artistId,
            },
            required: true,
          },
        ],
        where: {
          [Op.and]: [where(col('coverImage'), Op.not, null), where(col('coverImageMimeType'), Op.not, null)],
        },
      });
    }

    if (!artistCover) {
      return undefined;
    }
    const sharpImage = sharp(artistCover.coverImage);
    const metadata = await sharpImage.metadata();
    if (!metadata.width || !metadata.height) {
      return undefined;
    }
    if (metadata.width !== size || metadata.height !== size) {
      const resizedImageBuffer = await sharpImage.resize(size, size, { fit: 'inside' });
      artistCover.coverImage = await resizedImageBuffer.toBuffer();
    }
    return {
      coverImage: artistCover.coverImage,
      coverImageMimeType: artistCover.coverImageMimeType,
    };
  }
}
