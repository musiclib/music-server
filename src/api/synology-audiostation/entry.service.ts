import {
  AlbumArtistEntity,
  AlbumEntity,
  ArtistEntity,
  ComposerEntity,
  FavoriteItemEntity,
  FileEntity,
  FolderEntity,
  GenreEntity,
  LinkedArtistEntity,
  LinkedComposerEntity,
  LinkedGenreEntity,
  PlaylistEntity,
  PlaylistItemEntity,
  SessionEntity,
} from 'src/database/entities';
import { AuthenticationService } from 'src/authentication/authentication.service';
import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from 'src/config/config.service';
import { ErrorCodes } from 'src/constants/error-codes';
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
import { readFileSync } from 'node:fs';
import { replaceDoubleQuotes } from 'src/utils/strings';
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
    @Inject(AuthenticationService)
    private readonly authenticationService: AuthenticationService,
    @InjectModel(AlbumEntity)
    private readonly albumEntity: typeof AlbumEntity,
    @InjectModel(ArtistEntity)
    private readonly artistEntity: typeof ArtistEntity,
    @InjectModel(ComposerEntity)
    private readonly composerEntity: typeof ComposerEntity,
    @InjectModel(FileEntity)
    private readonly fileEntity: typeof FileEntity,
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

  getEncryptionKey(): SynologyEntryCertificateDataDto {
    return {
      cipherkey: '__cIpHeRtExT',
      ciphertoken: '__cIpHeRtOkEn',
      public_key: this.publicKey,
      server_time: Math.floor(Date.now() / 1000),
    };
  }

  private async getArtistId(accountId: number, artistName: string): Promise<number> {
    const artist = await this.artistEntity.findOne({
      attributes: ['id'],
      where: {
        name: replaceDoubleQuotes(artistName),
      },
      include: [
        {
          model: LinkedArtistEntity,
          attributes: ['artistId'],
          include: [
            {
              attributes: ['id'],
              model: FileEntity,
              where: {
                accountId,
              },
              required: true,
            },
          ],
          required: true,
          separate: true,
        },
      ],
    });
    if (!artist) {
      throw new NotFoundException(ErrorCodes.INVALID_ARTIST_ERROR);
    }
    return artist.id;
  }

  private async getComposerId(accountId: number, composerName: string): Promise<number> {
    const composer = await this.composerEntity.findOne({
      attributes: ['id'],
      where: {
        name: replaceDoubleQuotes(composerName),
      },
      include: [
        {
          model: LinkedComposerEntity,
          attributes: ['composerId'],
          include: [
            {
              attributes: ['id'],
              model: FileEntity,
              where: {
                accountId,
              },
              required: true,
            },
          ],
          required: true,
          separate: true,
        },
      ],
    });
    if (!composer) {
      throw new NotFoundException(ErrorCodes.INVALID_COMPOSER_ERROR);
    }
    return composer.id;
  }

  private async getGenreId(accountId: number, genreName: string): Promise<number> {
    const genre = await this.genreEntity.findOne({
      attributes: ['id'],
      where: {
        name: replaceDoubleQuotes(genreName),
      },
      include: [
        {
          model: LinkedGenreEntity,
          attributes: ['genreId'],
          include: [
            {
              attributes: ['id'],
              model: FileEntity,
              where: {
                accountId,
              },
              required: true,
            },
          ],
          required: true,
          separate: true,
        },
      ],
    });
    if (!genre) {
      throw new NotFoundException(ErrorCodes.INVALID_GENRE_ERROR);
    }
    return genre.id;
  }

  private async getAlbumIdByTitleAndArtist(
    accountId: number,
    albumTitle: string,
    albumArtist: string,
  ): Promise<number> {
    const album = await this.albumEntity.findOne({
      attributes: ['id'],
      include: [
        {
          attributes: ['albumId'],
          model: AlbumArtistEntity,
          required: true,
          separate: true,
          include: [
            {
              attributes: ['id'],
              model: ArtistEntity,
              where: {
                name: replaceDoubleQuotes(albumArtist),
              },
              required: true,
            },
          ],
        },
      ],
      where: {
        accountId,
        title: replaceDoubleQuotes(albumTitle),
      },
    });
    if (!album) {
      throw new NotFoundException(`Album not found for title: ${albumTitle} and artist: ${albumArtist}`);
    }
    return album.id;
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
          albumId = await this.getAlbumIdByTitleAndArtist(accountId, item.criteria.album, item.criteria.album_artist);
        }
        if (item.criteria.artist) {
          // eslint-disable-next-line no-await-in-loop
          artistId = await this.getArtistId(accountId, item.criteria.artist);
        }
        if (item.criteria.composer) {
          // eslint-disable-next-line no-await-in-loop
          composerId = await this.getComposerId(accountId, item.criteria.composer);
        }
        if (item.criteria.genre) {
          // eslint-disable-next-line no-await-in-loop
          genreId = await this.getGenreId(accountId, item.criteria.genre);
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

  async addAlbumToPlaylist(accountId: number, playlistId: string, albumTitle: string, albumArtist: string) {
    const playlist = await this.getPlaylist(accountId, playlistId);
    const albumId = await this.getAlbumIdByTitleAndArtist(accountId, albumTitle, albumArtist);
    const tracks = await this.fileEntity.findAll({
      attributes: ['id'],
      where: {
        accountId,
        albumId,
      },
      order: [
        ['discNumber', 'ASC'],
        ['trackNumber', 'ASC'],
      ],
    });
    const existingItems = await this.playlistItemEntity.findAll({
      attributes: ['fileId'],
      where: {
        playlistId: playlist.id,
        fileId: {
          [Op.in]: tracks.map((track) => track.id),
        },
      },
    });
    const existingFileIds = new Set(existingItems.map((item) => item.fileId));
    const newTracks = tracks.filter((track) => !existingFileIds.has(track.id));
    if (newTracks.length) {
      await this.playlistItemEntity.bulkCreate(
        newTracks.map(
          (track, index) =>
            ({
              playlistId: playlist.id,
              fileId: track.id,
              position: existingItems.length + index + 1,
            }) as PlaylistItemEntity,
        ),
      );
    }
  }

  async addArtistToPlaylist(accountId: number, playlistId: string, artistName: string) {
    const playlist = await this.getPlaylist(accountId, playlistId);
    const artistId = await this.getArtistId(accountId, artistName);
    const tracks = await this.fileEntity.findAll({
      attributes: ['id'],
      where: {
        accountId,
      },
      include: [
        {
          model: LinkedArtistEntity,
          required: true,
          where: {
            artistId,
          },
        },
      ],
    });
    const existingItems = await this.playlistItemEntity.findAll({
      attributes: ['fileId'],
      where: {
        playlistId: playlist.id,
        fileId: {
          [Op.in]: tracks.map((track) => track.id),
        },
      },
    });
    const existingFileIds = new Set(existingItems.map((item) => item.fileId));
    const newTracks = tracks.filter((track) => !existingFileIds.has(track.id));
    if (newTracks.length) {
      await this.playlistItemEntity.bulkCreate(
        newTracks.map(
          (track, index) =>
            ({
              playlistId: playlist.id,
              fileId: track.id,
              position: existingItems.length + index + 1,
            }) as PlaylistItemEntity,
        ),
      );
    }
  }

  async addComposerToPlaylist(accountId: number, playlistId: string, composerName: string) {
    const playlist = await this.getPlaylist(accountId, playlistId);
    const composerId = await this.getComposerId(accountId, composerName);
    const tracks = await this.fileEntity.findAll({
      attributes: ['id'],
      where: {
        accountId,
      },
      include: [
        {
          model: LinkedComposerEntity,
          required: true,
          where: {
            composerId,
          },
        },
      ],
    });
    const existingItems = await this.playlistItemEntity.findAll({
      attributes: ['fileId'],
      where: {
        playlistId: playlist.id,
        fileId: {
          [Op.in]: tracks.map((track) => track.id),
        },
      },
    });
    const existingFileIds = new Set(existingItems.map((item) => item.fileId));
    const newTracks = tracks.filter((track) => !existingFileIds.has(track.id));
    if (newTracks.length) {
      await this.playlistItemEntity.bulkCreate(
        newTracks.map(
          (track, index) =>
            ({
              playlistId: playlist.id,
              fileId: track.id,
              position: existingItems.length + index + 1,
            }) as PlaylistItemEntity,
        ),
      );
    }
  }

  async addGenreToPlaylist(accountId: number, playlistId: string, genreName: string) {
    const playlist = await this.getPlaylist(accountId, playlistId);
    const genreId = await this.getGenreId(accountId, genreName);
    const tracks = await this.fileEntity.findAll({
      attributes: ['id'],
      include: [
        {
          model: LinkedGenreEntity,
          required: true,
          where: {
            genreId,
          },
        },
      ],
      where: {
        accountId,
      },
    });
    const existingItems = await this.playlistItemEntity.findAll({
      attributes: ['fileId'],
      where: {
        playlistId: playlist.id,
        fileId: {
          [Op.in]: tracks.map((track) => track.id),
        },
      },
    });
    const existingFileIds = new Set(existingItems.map((item) => item.fileId));
    const newTracks = tracks.filter((track) => !existingFileIds.has(track.id));
    if (newTracks.length) {
      await this.playlistItemEntity.bulkCreate(
        newTracks.map(
          (track, index) =>
            ({
              playlistId: playlist.id,
              fileId: track.id,
              position: existingItems.length + index + 1,
            }) as PlaylistItemEntity,
        ),
      );
    }
  }
}
