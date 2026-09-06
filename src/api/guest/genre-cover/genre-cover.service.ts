import { AlbumArtistEntity, AlbumEntity } from 'src/database/entities';
import { CoverImage } from 'src/types/cover-image';
import { InjectModel } from '@nestjs/sequelize';
import { Injectable } from '@nestjs/common';
import { Op, col, where } from 'sequelize';
import sharp from 'sharp';

@Injectable()
export class GuestGenreCoverService {
  constructor(
    @InjectModel(AlbumEntity)
    private readonly albumEntity: typeof AlbumEntity,
  ) {}

  async getGenreCoverImage(accountId: number, genreId: number, size: number): Promise<CoverImage | undefined> {
    const genreCover = await this.albumEntity.findOne({
      attributes: ['id', 'coverImage', 'coverImageMimeType'],
      include: [
        {
          attributes: ['albumId', 'genreId'],
          model: AlbumArtistEntity,
          where: {
            genreId,
          },
          required: true,
        },
      ],
      where: {
        accountId,
        [Op.and]: [where(col('coverImage'), Op.not, null), where(col('coverImageMimeType'), Op.not, null)],
      },
    });
    if (!genreCover) {
      return undefined;
    }
    const sharpImage = sharp(genreCover.coverImage);
    const metadata = await sharpImage.metadata();
    if (!metadata.width || !metadata.height) {
      return undefined;
    }
    if (metadata.width !== size || metadata.height !== size) {
      const resizedImageBuffer = await sharpImage.resize(size, size, { fit: 'inside' });
      genreCover.coverImage = await resizedImageBuffer.toBuffer();
    }
    return {
      coverImage: genreCover.coverImage,
      coverImageMimeType: genreCover.coverImageMimeType,
    };
  }
}
