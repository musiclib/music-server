/* eslint-disable no-await-in-loop */
import { AlbumArtistEntity, AlbumEntity, RootPathEntity } from 'src/database/entities';
import { IAudioMetadata } from 'src/types/music-metadata';
import { IndexArtistService } from './index-artist.service';
import { InjectModel } from '@nestjs/sequelize';
import { Injectable, Logger } from '@nestjs/common';
import { Op, Transaction } from 'sequelize';
import { Vibrant } from 'node-vibrant/node';
import { normalizeString, sanitizeString, splitArray } from 'src/utils/strings';
import sharp from 'sharp';

@Injectable()
export class IndexAlbumService {
  private readonly logger: Logger = new Logger(IndexAlbumService.name);

  constructor(
    @InjectModel(AlbumEntity)
    private readonly albumEntity: typeof AlbumEntity,
    @InjectModel(AlbumArtistEntity)
    private readonly albumArtistEntity: typeof AlbumArtistEntity,
    private readonly indexArtistService: IndexArtistService,
  ) {}

  async updateAlbum(
    rootPath: RootPathEntity,
    embeddedData: IAudioMetadata,
    folderPath: string,
    accountId?: number,
    transaction?: Transaction,
  ) {
    const existing = await this.albumEntity.findOne({
      where: {
        folderPath,
        accountId,
      },
      transaction,
    });

    // get the album color details
    let coverImage = embeddedData.common.picture?.[0]?.data ? Buffer.from(embeddedData.common.picture[0].data) : null;
    const coverImageMimeType = embeddedData.common.picture?.[0]?.format || null;
    let coverImageLightVibrant: string | null = null;
    let coverImageDarkVibrant: string | null = null;
    let coverImageMuted: string | null = null;
    let coverImageVibrant: string | null = null;
    let coverImageDarkMuted: string | null = null;
    let coverImageLightMuted: string | null = null;
    if (coverImage) {
      // make sure cover image is 600px x 600px jpeg
      const sharpImage = sharp(coverImage);
      const metadata = await sharpImage.metadata();
      if (metadata.width > 600 || metadata.height > 600) {
        const resizedImageBuffer = await sharpImage.resize(600, 600, { fit: 'inside' }).toBuffer();
        coverImage = resizedImageBuffer;
      }
      // measure the dominant colors
      const palette = await Vibrant.from(coverImage as Buffer).getPalette();
      coverImageLightVibrant = palette?.LightVibrant?.hex || null;
      coverImageDarkVibrant = palette?.DarkVibrant?.hex || null;
      coverImageMuted = palette?.Muted?.hex || null;
      coverImageVibrant = palette?.Vibrant?.hex || null;
      coverImageDarkMuted = palette?.DarkMuted?.hex || null;
      coverImageLightMuted = palette?.LightMuted?.hex || null;
    }
    let albumId;
    if (existing) {
      albumId = existing.id;
      // update the existing album
      await this.albumEntity.update(
        {
          coverImage,
          coverImageMimeType,
          coverImageLightVibrant,
          coverImageDarkVibrant,
          coverImageMuted,
          coverImageVibrant,
          coverImageDarkMuted,
          coverImageLightMuted,
          folderPath,
          rootPathId: rootPath.id,
          title: sanitizeString(embeddedData?.common.album || '') || '',
          titleNormalized: normalizeString(embeddedData?.common.album || '') || '',
          year: embeddedData?.common.year || 0,
        } as AlbumEntity,
        {
          where: {
            id: existing.id,
          },
          transaction,
        },
      );
    } else {
      // insert new album
      const album = await this.albumEntity.create(
        {
          accountId,
          coverImage,
          coverImageMimeType,
          coverImageLightVibrant,
          coverImageDarkVibrant,
          coverImageMuted,
          coverImageVibrant,
          coverImageDarkMuted,
          coverImageLightMuted,
          folderPath,
          rootPathId: rootPath.id,
          title: sanitizeString(embeddedData?.common.album || '') || '',
          titleNormalized: normalizeString(embeddedData?.common.album || '') || '',
          year: embeddedData?.common.year || 0,
        } as AlbumEntity,
        {
          transaction,
        },
      );
      albumId = album.id;
    }
    // insert the album artists
    const albumArtists = embeddedData.common.albumartist
      ? [embeddedData.common.albumartist]
      : splitArray(embeddedData.common.albumartists || [embeddedData.common.artist || 'Unknown Artist']);
    const validAssociationIds: number[] = [];
    for (let i = 0, len = albumArtists.length; i < len; i += 1) {
      const artist = albumArtists[i];
      if (artist) {
        const artistId = await this.indexArtistService.insertOrRetrieveArtist(artist, transaction);
        const existingAssociation = await this.albumArtistEntity.findOne({
          where: {
            albumId,
            artistId,
          },
          transaction,
        });
        if (!existingAssociation) {
          const newAssociation = await this.albumArtistEntity.create(
            {
              albumId,
              artistId,
            } as AlbumArtistEntity,
            {
              transaction,
            },
          );
          validAssociationIds.push(newAssociation.id);
        } else {
          validAssociationIds.push(existingAssociation.id);
        }
      }
    }
    // delete obsolete album-artist associations
    await this.albumArtistEntity.destroy({
      where: {
        albumId,
        id: {
          [Op.notIn]: validAssociationIds,
        },
      },
      transaction,
    });
    // return the album
    const updatedAlbum = await this.albumEntity.findOne({
      where: {
        id: albumId,
      },
    });
    if (!updatedAlbum) {
      throw new Error('Album not found');
    }
    return updatedAlbum;
  }
}
