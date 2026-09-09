import { AlbumArtistEntity, AlbumEntity, ArtistEntity } from 'src/database/entities';
import { CoverImage } from 'src/types/cover-image';
import { InjectModel } from '@nestjs/sequelize';
import { Injectable, NotFoundException } from '@nestjs/common';

const emptyBuffer = Buffer.alloc(0);

@Injectable()
export class QnapMediaCoverApiService {
  constructor(
    @InjectModel(AlbumEntity)
    private readonly albumEntity: typeof AlbumEntity,
  ) {}

  /**
   * Returns the cover image for a given artist.  If there are no albums it throws a NotFoundException.  The
   * image is embedded in the first-returned album's first file's IDv3 tag data and stored into SQLite for
   * retrieval.  The image can be updated by saving a new image into the IDv3 tag data and then the file being
   * modified will be picked up by the indexer on its next run.
   * @param {number} accountId The account ID for the user requesting the cover image.
   * @param {string} albumArtist The name of the artist for which to retrieve the cover image.
   * @returns {Promise<CoverImage | undefined>} The album cover image.
   */
  async getArtistCoverImage(accountId: number, artistId: number): Promise<CoverImage | undefined> {
    const album = await this.albumEntity.findOne({
      attributes: ['id', 'coverImage', 'coverImageMimeType', 'createdAt', 'updatedAt'],
      where: {
        accountId,
      },
      include: [
        {
          model: AlbumArtistEntity,
          attributes: [],
          include: [
            {
              model: ArtistEntity,
              attributes: [],
              where: {
                id: artistId,
              },
            },
          ],
        },
      ],
    });
    if (!album) {
      throw new NotFoundException(`Cover image not found for artist ID: ${artistId}`);
    }
    return album;
  }

  /**
   * Returns the cover image for a given album.  If the album is not found it throws a NotFoundException.  The
   * image is embedded in the first-returned album's first file's IDv3 tag data and stored into SQLite for
   * retrieval.  The image can be updated by saving a new image into the IDv3 tag data and then the file being
   * modified will be picked up by the indexer on its next run.
   * @param {number} accountId The account ID for the user requesting the cover image.
   * @param {number} albumId The ID of the album for which to retrieve the cover image.
   * @returns {Promise<CoverImage | undefined>} The album cover image.
   */
  async getAlbumCoverImage(accountId: number, albumId: number): Promise<CoverImage | undefined> {
    const album = await this.albumEntity.findOne({
      attributes: ['id', 'coverImage', 'coverImageMimeType', 'createdAt', 'updatedAt'],
      where: {
        id: albumId,
        accountId,
      },
    });
    if (!album) {
      throw new NotFoundException(`Album not found for album ID: ${albumId}`);
    }
    return album;
  }

  // eslint-disable-next-line class-methods-use-this
  async getFolderCoverImage() {
    return {
      coverImage: emptyBuffer,
      coverImageMimeType: '',
      updatedAt: new Date(1970, 0, 1, 0, 0, 0, 0),
    };
  }
}
