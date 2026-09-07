import {
  AlbumArtistEntity,
  AlbumEntity,
  ArtistEntity,
  CollatedArtistAlbumEntity,
  CollatedArtistEntity,
  CollatedArtistTrackEntity,
  CollatedComposerAlbumEntity,
  CollatedComposerTrackEntity,
  CollatedGenreAlbumEntity,
  CollatedGenreTrackEntity,
  CollatedTrackEntity,
  ComposerEntity,
  FavoriteItemEntity,
  FolderEntity,
  GenreEntity,
  PlaylistEntity,
  PlaylistItemEntity,
  SessionEntity,
} from 'src/database/entities';
import { AuthenticationService } from 'src/authentication/authentication.service';
import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from 'src/config/config.service';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { SessionRestrictionEnum } from 'src/types/enums';
import {
  SynologyEntryCertificateDataDto,
  SynologyEntryNewPinItemDto,
  SynologyEntryPinItemDto,
  SynologyEntryPinsDataDto,
  SynologyEntrySignInBodyDto,
  SynologyEntrySignInDataDto,
} from './dtos';
import { SynologyPinTypeEnum } from './enums';
import { normalizeString, replaceDoubleQuotes } from 'src/utils/strings';
import { readFileSync } from 'node:fs';
import { sep } from 'node:path';
import crypto from 'node:crypto';

function pinnedItemToRow(item: FavoriteItemEntity): SynologyEntryPinItemDto {
  return {
    id: item.id.toString(),
    criteria: {
      album: item.album?.title,
      album_artist: item.album?.albumArtists?.map((linkedArtist) => linkedArtist.artist?.name).join(', '),
      artist: item.artist?.name,
      composer: item.composer?.name,
      genre: item.genre?.name,
      folder: item.folderId ? `dir_${item.folderId}` : undefined,
      playlist: item.playlist?.name,
    },
    name:
      item.album?.title ||
      item.artist?.name ||
      item.composer?.name ||
      item.genre?.name ||
      item.folder?.folderPath.split(sep).pop() ||
      item.playlist?.name ||
      (item.allSongs ? 'All songs' : undefined) ||
      (item.randomHundred ? 'Random 100' : undefined) ||
      (item.recentlyAdded ? 'Recently added' : undefined) ||
      'Unknown',
    type:
      (item.albumId ? SynologyPinTypeEnum.ALBUM : '') ||
      (item.artistId ? SynologyPinTypeEnum.ARTIST : '') ||
      (item.composerId ? SynologyPinTypeEnum.COMPOSER : '') ||
      (item.genreId ? SynologyPinTypeEnum.GENRE : '') ||
      (item.folderId ? SynologyPinTypeEnum.FOLDER : '') ||
      (item.playlistId ? SynologyPinTypeEnum.PLAYLIST : '') ||
      (item.allSongs ? SynologyPinTypeEnum.ALBUM : '') ||
      (item.randomHundred ? SynologyPinTypeEnum.RANDOM_100 : '') ||
      (item.recentlyAdded ? SynologyPinTypeEnum.RECENTLY_ADDED : '') ||
      SynologyPinTypeEnum.ALBUM, // default to album if no type is found
  };
}

@Injectable()
export class SynologyEntryService {
  publicKey: string;

  privateKey: crypto.KeyObject;

  constructor(
    @InjectModel(AlbumEntity)
    private readonly albumEntity: typeof AlbumEntity,
    private readonly authenticationService: AuthenticationService,
    @InjectModel(CollatedArtistEntity)
    private readonly collatedArtistEntity: typeof CollatedArtistEntity,
    @InjectModel(CollatedArtistAlbumEntity)
    private readonly collatedArtistAlbumEntity: typeof CollatedArtistAlbumEntity,
    @InjectModel(CollatedArtistTrackEntity)
    private readonly collatedArtistTrackEntity: typeof CollatedArtistTrackEntity,
    @InjectModel(CollatedComposerAlbumEntity)
    private readonly collatedComposerAlbumEntity: typeof CollatedComposerAlbumEntity,
    @InjectModel(CollatedComposerTrackEntity)
    private readonly collatedComposerTrackEntity: typeof CollatedComposerTrackEntity,
    @InjectModel(CollatedGenreAlbumEntity)
    private readonly collatedGenreAlbumEntity: typeof CollatedGenreAlbumEntity,
    @InjectModel(CollatedGenreTrackEntity)
    private readonly collatedGenreTrackEntity: typeof CollatedGenreTrackEntity,
    @InjectModel(CollatedTrackEntity)
    private readonly collatedTrackEntity: typeof CollatedTrackEntity,
    @InjectModel(ComposerEntity)
    private readonly composerEntity: typeof ComposerEntity,
    @InjectModel(FolderEntity)
    private readonly folderEntity: typeof FolderEntity,
    @Inject(ConfigService) private readonly configService: ConfigService,
    @InjectModel(GenreEntity)
    private readonly genreEntity: typeof GenreEntity,
    @InjectModel(FavoriteItemEntity)
    private readonly favoriteItemEntity: typeof FavoriteItemEntity,
    @InjectModel(PlaylistEntity)
    private readonly playlistEntity: typeof PlaylistEntity,
    @InjectModel(PlaylistItemEntity)
    private readonly playlistItemEntity: typeof PlaylistItemEntity,
    @InjectModel(SessionEntity)
    private readonly sessionEntity: typeof SessionEntity,
  ) {
    const publicKey = readFileSync(this.configService.get('PUBLIC_KEY_PATH')).toString('utf8');
    this.publicKey = publicKey
      .split('\n')
      .filter((line) => !line.includes('BEGIN PUBLIC KEY') && !line.includes('END PUBLIC KEY'))
      .join('');
    const privateKeyData = readFileSync(this.configService.get('PRIVATE_KEY_PATH')).toString('utf8');
    this.privateKey = crypto.createPrivateKey({
      key: privateKeyData,
      format: 'pem',
      type: 'pkcs8',
    });
  }

  async authenticate(userAgent: string, body: SynologyEntrySignInBodyDto): Promise<SynologyEntrySignInDataDto> {
    const decrypted = crypto.privateDecrypt(
      {
        key: this.privateKey,
        padding: crypto.constants.RSA_PKCS1_PADDING,
      },
      // eslint-disable-next-line no-underscore-dangle
      Buffer.from(body.__cIpHeRtExT, 'base64'),
    );
    const plainText = decrypted.toString('utf8');
    const queryString = new URLSearchParams(plainText);
    const username = queryString.get('account');
    const password = queryString.get('passwd');
    if (!username?.length || !password?.length) {
      throw new BadRequestException({
        success: false,
        message: 'Invalid encrypted payload',
        body,
      });
    }
    const jwtToken = await this.authenticationService.createSession(
      username,
      password,
      userAgent,
      SessionRestrictionEnum.SYNOLOGY_AUDIOSTATION,
      3650,
    );
    const userAgentHash = await this.authenticationService.generateDeviceHash(username, userAgent);
    return {
      did: userAgentHash,
      sid: jwtToken,
      is_portal_port: false,
    };
  }

  getEncryptionKey(): SynologyEntryCertificateDataDto {
    return {
      cipherkey: '__cIpHeRtExT',
      ciphertoken: '__cIpHeRtOkEn',
      public_key: this.publicKey,
      server_time: Math.floor(Date.now() / 1000),
    };
  }

  async clearSessionToken(accountId: number, sessionId: number): Promise<unknown> {
    const session = await this.sessionEntity.findByPk(sessionId);
    if (!session || session.accountId !== accountId) {
      throw new BadRequestException({
        success: false,
        message: 'Invalid session ID',
        sessionId,
      });
    }
    await this.authenticationService.endSession(accountId, sessionId);
    return {
      success: true,
    };
  }

  async listPinnedItems(accountId: number, offset: number, limit: number): Promise<SynologyEntryPinsDataDto> {
    const items = await this.favoriteItemEntity.findAll({
      where: {
        accountId,
      },
      include: [
        {
          model: AlbumEntity,
          attributes: ['title'],
          required: false,
          as: 'album',
        },
        {
          model: ArtistEntity,
          attributes: ['name'],
          required: false,
          as: 'artist',
        },
        {
          model: ComposerEntity,
          attributes: ['name'],
          required: false,
          as: 'composer',
        },
        {
          model: GenreEntity,
          attributes: ['name'],
          required: false,
          as: 'genre',
        },
        {
          model: FolderEntity,
          attributes: ['folderPath'],
          required: false,
          as: 'folder',
        },
        {
          model: PlaylistEntity,
          attributes: ['name'],
          required: false,
          as: 'playlist',
        },
      ],
      offset: offset || 0,
      limit: limit || 100000,
    });
    const total = await this.favoriteItemEntity.count({
      where: {
        accountId,
      },
    });
    return {
      items: items.map(pinnedItemToRow),
      offset: offset || 0,
      total,
    };
  }

  async createPinnedItem(accountId: number, items: SynologyEntryNewPinItemDto[]): Promise<SynologyEntryPinsDataDto> {
    for (let i = 0, len = items.length; i < len; i += 1) {
      const item = items[i];
      if (item) {
        let albumId;
        let artistId;
        let composerId;
        let genreId;
        let folderId;
        let playlistId;
        if (item.criteria.album && item.criteria.album_artist) {
          // eslint-disable-next-line no-await-in-loop
          const album = await this.collatedArtistAlbumEntity.findOne({
            attributes: ['id'],
            where: {
              accountId,
              title: replaceDoubleQuotes(item.criteria.album),
              artist: replaceDoubleQuotes(item.criteria.album_artist),
            },
          });
          if (!album) {
            throw new NotFoundException({
              success: false,
              message: 'Album not found',
              album: item.criteria.album,
              artist: item.criteria.album_artist,
            });
          }
          albumId = album.id;
        }
        if (item.criteria.artist) {
          // eslint-disable-next-line no-await-in-loop
          const artist = await this.collatedArtistEntity.findOne({
            attributes: ['id'],
            where: {
              accountId,
              name: replaceDoubleQuotes(item.criteria.artist),
            },
          });
          if (!artist) {
            throw new NotFoundException({
              success: false,
              message: 'Artist not found',
              artist: item.criteria.artist,
            });
          }
          artistId = artist.id;
        }
        if (item.criteria.composer) {
          // eslint-disable-next-line no-await-in-loop
          const composer = await this.collatedComposerAlbumEntity.findOne({
            attributes: ['composerId'],
            where: {
              accountId,
              composerName: replaceDoubleQuotes(item.criteria.composer),
            },
          });
          if (!composer) {
            throw new NotFoundException({
              success: false,
              message: 'Composer not found',
              composer: item.criteria.composer,
            });
          }
          composerId = composer.composerId;
        }
        if (item.criteria.genre) {
          // eslint-disable-next-line no-await-in-loop
          const genre = await this.collatedGenreAlbumEntity.findOne({
            attributes: ['genreId'],
            where: {
              accountId,
              genreName: replaceDoubleQuotes(item.criteria.genre),
            },
          });
          if (!genre) {
            throw new NotFoundException({
              success: false,
              message: 'Genre not found',
              genre: item.criteria.genre,
            });
          }
          genreId = genre.genreId;
        }
        if (item.type === 'folder') {
          // eslint-disable-next-line no-await-in-loop
          const folder = await this.folderEntity.findOne({
            attributes: ['id'],
            where: {
              accountId,
              id: item.criteria.folder,
            },
          });
          if (!folder) {
            throw new NotFoundException({
              success: false,
              message: 'Folder not found',
              folderId: item.criteria.folder,
            });
          }
          folderId = folder.id;
        }
        if (item.type === 'playlist') {
          // eslint-disable-next-line no-await-in-loop
          const playlist = await this.playlistEntity.findOne({
            attributes: ['id'],
            where: {
              accountId,
              name: replaceDoubleQuotes(item.name),
            },
          });
          if (!playlist) {
            throw new NotFoundException({
              success: false,
              message: 'Playlist not found',
              playlistId: item.criteria.playlist,
            });
          }
          playlistId = playlist.id;
        }
        // eslint-disable-next-line no-await-in-loop
        await this.favoriteItemEntity.create({
          accountId,
          albumId,
          allSongs: item.name === 'All songs',
          artistId,
          composerId,
          genreId,
          folderId,
          playlistId,
          randomHundred: item.type === SynologyPinTypeEnum.RANDOM_100,
          recentlyAdded: item.type === SynologyPinTypeEnum.RECENTLY_ADDED,
        } as FavoriteItemEntity);
      }
    }
    return this.listPinnedItems(accountId, 0, 100000);
  }

  async deletePinnedItem(accountId: number, itemIds: number[]): Promise<SynologyEntryPinsDataDto> {
    await this.favoriteItemEntity.destroy({
      where: {
        accountId,
        id: {
          [Op.in]: itemIds,
        },
      },
    });
    return this.listPinnedItems(accountId, 0, 100000);
  }

  private async getPlaylist(accountId: number, playlistId: string) {
    const playlist = await this.playlistEntity.findOne({
      where: {
        accountId,
        name: playlistId,
      },
    });
    if (!playlist) {
      throw new Error(`Playlist with id ${playlistId} not found`);
    }
    return playlist;
  }

  async getAlbumByTitleAndArtist(accountId: number, albumTitle: string, albumArtist: string): Promise<AlbumEntity> {
    const album = await this.albumEntity.findOne({
      attributes: ['id'],
      where: {
        titleNormalized: normalizeString(albumTitle),
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
                nameNormalized: normalizeString(albumArtist),
              },
            },
          ],
        },
      ],
    });
    if (!album) {
      throw new NotFoundException(`Album not found for title: ${albumTitle} and artist: ${albumArtist}`);
    }
    return album;
  }

  async addAlbumToPlaylist(accountId: number, playlistId: string, albumTitle: string, albumArtist: string) {
    const playlist = await this.getPlaylist(accountId, playlistId);
    const album = await this.getAlbumByTitleAndArtist(accountId, albumTitle, albumArtist);
    const tracks = await this.collatedTrackEntity.findAll({
      where: {
        accountId,
        albumId: album.id,
      },
    });
    const existingItems = await this.playlistItemEntity.findAll({
      where: {
        playlistId: playlist.id,
        fileId: {
          [Op.in]: tracks.map((track) => track.fileId),
        },
      },
    });
    const existingFileIds = new Set(existingItems.map((item) => item.fileId));
    const newTracks = tracks.filter((track) => !existingFileIds.has(track.fileId));
    if (newTracks.length) {
      await this.playlistItemEntity.bulkCreate(
        newTracks.map(
          (track, index) =>
            ({
              playlistId: playlist.id,
              fileId: track.fileId,
              position: existingItems.length + index + 1,
            }) as PlaylistItemEntity,
        ),
      );
    }
  }

  async addArtistToPlaylist(accountId: number, playlistId: string, artistName: string) {
    const playlist = await this.getPlaylist(accountId, playlistId);
    const artist = await this.collatedArtistEntity.findOne({
      where: {
        accountId,
        nameNormalized: normalizeString(artistName),
      },
    });
    if (!artist) {
      throw new NotFoundException(`Artist not found for name: ${artistName}`);
    }
    const tracks = await this.collatedArtistTrackEntity.findAll({
      where: {
        accountId,
        artistId: artist.id,
      },
    });
    const existingItems = await this.playlistItemEntity.findAll({
      where: {
        playlistId: playlist.id,
        fileId: {
          [Op.in]: tracks.map((track) => track.fileId),
        },
      },
    });
    const existingFileIds = new Set(existingItems.map((item) => item.fileId));
    const newTracks = tracks.filter((track) => !existingFileIds.has(track.fileId));
    if (newTracks.length) {
      await this.playlistItemEntity.bulkCreate(
        newTracks.map(
          (track, index) =>
            ({
              playlistId: playlist.id,
              fileId: track.fileId,
              position: existingItems.length + index + 1,
            }) as PlaylistItemEntity,
        ),
      );
    }
  }

  async addComposerToPlaylist(accountId: number, playlistId: string, composerName: string) {
    const playlist = await this.getPlaylist(accountId, playlistId);
    const composer = await this.composerEntity.findOne({
      where: {
        nameNormalized: normalizeString(composerName),
      },
    });
    if (!composer) {
      throw new NotFoundException(`Composer not found for name: ${composerName}`);
    }
    const tracks = await this.collatedComposerTrackEntity.findAll({
      where: {
        accountId,
        composerId: composer.id,
      },
    });
    const existingItems = await this.playlistItemEntity.findAll({
      where: {
        playlistId: playlist.id,
        fileId: {
          [Op.in]: tracks.map((track) => track.fileId),
        },
      },
    });
    const existingFileIds = new Set(existingItems.map((item) => item.fileId));
    const newTracks = tracks.filter((track) => !existingFileIds.has(track.fileId));
    if (newTracks.length) {
      await this.playlistItemEntity.bulkCreate(
        newTracks.map(
          (track, index) =>
            ({
              playlistId: playlist.id,
              fileId: track.fileId,
              position: existingItems.length + index + 1,
            }) as PlaylistItemEntity,
        ),
      );
    }
  }

  async addGenreToPlaylist(accountId: number, playlistId: string, genreName: string) {
    const playlist = await this.getPlaylist(accountId, playlistId);
    const genre = await this.genreEntity.findOne({
      where: {
        accountId,
        nameNormalized: normalizeString(genreName),
      },
    });
    if (!genre) {
      throw new NotFoundException(`Genre not found for name: ${genreName}`);
    }
    const tracks = await this.collatedGenreTrackEntity.findAll({
      where: {
        accountId,
        genreId: genre.id,
      },
    });
    const existingItems = await this.playlistItemEntity.findAll({
      where: {
        playlistId: playlist.id,
        fileId: {
          [Op.in]: tracks.map((track) => track.fileId),
        },
      },
    });
    const existingFileIds = new Set(existingItems.map((item) => item.fileId));
    const newTracks = tracks.filter((track) => !existingFileIds.has(track.fileId));
    if (newTracks.length) {
      await this.playlistItemEntity.bulkCreate(
        newTracks.map(
          (track, index) =>
            ({
              playlistId: playlist.id,
              fileId: track.fileId,
              position: existingItems.length + index + 1,
            }) as PlaylistItemEntity,
        ),
      );
    }
  }
}
