import { AlbumArtistEntity, AlbumEntity } from 'src/database/entities';
import { CoverImage } from 'src/types/cover-image';
import { InjectModel } from '@nestjs/sequelize';
import { Injectable } from '@nestjs/common';
import { Op, col, where } from 'sequelize';
import sharp from 'sharp';

@Injectable()
export class GuestComposerCoverService {
  constructor(
    @InjectModel(AlbumEntity)
    private readonly albumEntity: typeof AlbumEntity,
  ) {}

  async getComposerCoverImage(composerId: number, size: number): Promise<CoverImage | undefined> {
    const composerCover = await this.albumEntity.findOne({
      attributes: ['id', 'coverImage', 'coverImageMimeType'],
      include: [
        {
          attributes: ['albumId', 'composerId'],
          model: AlbumArtistEntity,
          where: {
            composerId,
          },
          required: true,
        },
      ],
      where: {
        [Op.and]: [where(col('coverImage'), Op.not, null), where(col('coverImageMimeType'), Op.not, null)],
      },
    });
    if (!composerCover) {
      return undefined;
    }
    const sharpImage = sharp(composerCover.coverImage);
    const metadata = await sharpImage.metadata();
    if (!metadata.width || !metadata.height) {
      return undefined;
    }
    if (metadata.width !== size || metadata.height !== size) {
      const resizedImageBuffer = await sharpImage.resize(size, size, { fit: 'inside' });
      composerCover.coverImage = await resizedImageBuffer.toBuffer();
    }
    return {
      coverImage: composerCover.coverImage,
      coverImageMimeType: composerCover.coverImageMimeType,
    };
  }
}
