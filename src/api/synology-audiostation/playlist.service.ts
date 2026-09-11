import {
  ContentTypeEnum,
  FileTypeEnum,
  PlaylistTypeEnum,
  SmartPlaylistFieldEnum,
  SmartPlaylistIntervalTagEnum,
  SmartPlaylistOperationEnum,
} from 'src/types/enums';
import { InjectModel } from '@nestjs/sequelize';
import { Injectable } from '@nestjs/common';
import { LibraryService } from 'src/library/library.service';
import { Op } from 'sequelize';
import { PlaylistEntity, PlaylistItemEntity, PlaylistSmartRuleEntity } from 'src/database/entities';
import {
  SynologyPlaylistAddOrRemoveItemBodyDto,
  SynologyPlaylistCreateNormalBodyDto,
  SynologyPlaylistCreateSmartBodyDto,
  SynologyPlaylistDataDto,
  SynologyPlaylistDeleteBodyDto,
  SynologyPlaylistRenameBodyDto,
  SynologyPlaylistRetrieveBodyDto,
  SynologyPlaylistRuleDto,
  SynologyPlaylistTrackListBodyDto,
  SynologyPlaylistUpdateSmartBodyDto,
  SynologyPlaylistWithItemsDataDto,
} from './dtos';
import { replaceDoubleQuotes } from 'src/utils/strings';

function ruleToRow(rule: PlaylistSmartRuleEntity): SynologyPlaylistRuleDto {
  let interval: number;
  switch (rule.interval) {
    case SmartPlaylistIntervalTagEnum.DAYS:
      interval = 1;
      break;
    case SmartPlaylistIntervalTagEnum.WEEKS:
      interval = 2;
      break;
    case SmartPlaylistIntervalTagEnum.MONTHS:
      interval = 3;
      break;
    default:
      interval = 0;
  }
  let op: number;
  switch (rule.operation) {
    case SmartPlaylistOperationEnum.IS:
      op = 1;
      break;
    case SmartPlaylistOperationEnum.IS_NOT:
      op = 2;
      break;
    case SmartPlaylistOperationEnum.CONTAINS:
      op = 3;
      break;
    case SmartPlaylistOperationEnum.DOES_NOT_CONTAIN:
      op = 4;
      break;
    case SmartPlaylistOperationEnum.LESS_THAN:
      op = 5;
      break;
    case SmartPlaylistOperationEnum.GREATER_THAN_OR_EQUAL_TO:
      op = 6;
      break;
    case SmartPlaylistOperationEnum.IN_THE_LAST:
      op = 7;
      break;
    case SmartPlaylistOperationEnum.NOT_IN_THE_LAST:
      op = 8;
      break;
    case SmartPlaylistOperationEnum.AFTER:
      op = 9;
      break;
    case SmartPlaylistOperationEnum.BEFORE:
      op = 10;
      break;
    default:
      op = 0;
  }
  let tag: number;
  switch (rule.field) {
    case SmartPlaylistFieldEnum.ARTIST:
      tag = 1;
      break;
    case SmartPlaylistFieldEnum.ALBUM:
      tag = 2;
      break;
    case SmartPlaylistFieldEnum.ALBUM_ARTIST:
      tag = 3;
      break;
    case SmartPlaylistFieldEnum.COMPOSER:
      tag = 4;
      break;
    case SmartPlaylistFieldEnum.GENRE:
      tag = 5;
      break;
    case SmartPlaylistFieldEnum.FILE_PATH:
      tag = 6;
      break;
    case SmartPlaylistFieldEnum.YEAR:
      tag = 7;
      break;
    case SmartPlaylistFieldEnum.BIT_RATE:
      tag = 8;
      break;
    case SmartPlaylistFieldEnum.DATE_ADDED:
      tag = 9;
      break;
    case SmartPlaylistFieldEnum.RATING:
      tag = 10;
      break;
    default:
      tag = 0;
  }
  return {
    interval,
    op,
    tag,
    tagval: rule.value,
  };
}

@Injectable()
export class SynologyPlaylistService {
  constructor(
    private readonly libraryService: LibraryService,
    @InjectModel(PlaylistEntity)
    private readonly playlistEntity: typeof PlaylistEntity,
    @InjectModel(PlaylistItemEntity)
    private readonly playlistItemEntity: typeof PlaylistItemEntity,
    @InjectModel(PlaylistSmartRuleEntity)
    private readonly playlistSmartRuleEntity: typeof PlaylistSmartRuleEntity,
  ) {}

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

  async addItem(accountId: number, body: SynologyPlaylistAddOrRemoveItemBodyDto) {
    const playlist = await this.getPlaylist(accountId, body.id);
    if (playlist.type === PlaylistTypeEnum.SMART) {
      throw new Error('Cannot add items to a smart playlist');
    }
    const insertData: PlaylistItemEntity[] = [];
    let position = body.offset > -1 ? body.offset : 0;
    body.songs.forEach(async (id) => {
      position += 1;
      // if the id is a number then it is a file
      if (typeof id === 'number') {
        insertData.push({
          playlistId: playlist.id,
          fileId: id,
          position,
        } as PlaylistItemEntity);
      } else if (typeof id === 'string' && id.startsWith('radio_')) {
        const url = id.substring(id.lastIndexOf(' ') + 1);
        const title = id.substring(6).split(' ').slice(0, -1).join(' ');
        insertData.push({
          playlistId: playlist.id,
          radioStationTitle: title,
          radioStationUrl: url,
          position,
        } as PlaylistItemEntity);
      }
    });
    const transaction = await this.playlistItemEntity.sequelize?.transaction();
    await this.playlistItemEntity.update(
      {
        position: this.playlistItemEntity.sequelize?.literal(`position + ${insertData.length}`),
      },
      {
        where: {
          playlistId: playlist.id,
          position: {
            [Op.gte]: body.offset,
          },
        },
        transaction,
      },
    );
    await this.playlistItemEntity.bulkCreate(insertData, {
      transaction,
    });
    if (transaction) {
      try {
        await transaction.commit();
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    }
  }

  async createPlaylist(accountId: number, body: SynologyPlaylistCreateNormalBodyDto) {
    const playlist = await this.playlistEntity.create({
      accountId,
      name: replaceDoubleQuotes(body.name),
      type: PlaylistTypeEnum.NORMAL,
    } as PlaylistEntity);
    return {
      id: `playlist_personal_normal/${playlist.name}`,
    };
  }

  async createSmartPlaylist(accountId: number, body: SynologyPlaylistCreateSmartBodyDto) {
    const transaction = await this.playlistEntity.sequelize?.transaction();
    const playlist = await this.playlistEntity.create(
      {
        accountId,
        name: replaceDoubleQuotes(body.name),
        rulesConjugal: body.conj_rule,
        type: PlaylistTypeEnum.SMART,
      } as PlaylistEntity,
      {
        transaction,
      },
    );
    for (let i = 0, len = body.rules_json.length; i < len; i += 1) {
      const rule = body.rules_json[i];
      if (rule) {
        // eslint-disable-next-line no-await-in-loop
        await this.playlistSmartRuleEntity.create(
          {
            playlistId: playlist.id,
            field: rule.fieldName,
            operation: rule.operationName,
            value: rule.tagval,
            interval: rule.intervalName,
          } as PlaylistSmartRuleEntity,
          {
            transaction,
          },
        );
      }
    }
    if (transaction) {
      try {
        await transaction.commit();
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    }
    return {
      id: `playlist_personal_smart/${body.name}`,
    };
  }

  async deletePlaylist(accountId: number, body: SynologyPlaylistDeleteBodyDto) {
    const playlist = await this.getPlaylist(accountId, body.id);
    await this.playlistEntity.destroy({
      where: {
        id: playlist.id,
      },
    });
  }

  async getPlaylists(accountId: number): Promise<SynologyPlaylistDataDto> {
    const playlists = await this.playlistEntity.findAndCountAll({
      where: {
        accountId,
      },
      order: [['name', 'ASC']],
    });
    const rules = await this.playlistSmartRuleEntity.findAll({
      where: {
        playlistId: playlists.rows.map((p) => p.id),
      },
      order: [['id', 'ASC']],
    });
    return {
      offset: 0,
      total: playlists.count,
      playlists: playlists.rows.map((playlist) => {
        const playlistRules = rules.filter((rule) => rule.playlistId === playlist.id);
        return {
          id: `playlist_personal_${playlist.type}/${playlist.name}`,
          library: 'personal',
          name: playlist.name,
          sharing_status: 'none',
          type: playlist.type,
          additional: {
            rules: playlistRules.map(ruleToRow),
            rules_conjunction: playlist.rulesConjugal,
            sharing_info: {
              date_available: 0,
              date_expired: 0,
              id: '',
              url: '',
              status: 'none',
            },
          },
        };
      }),
    };
  }

  async getItems(accountId: number, body: SynologyPlaylistTrackListBodyDto): Promise<SynologyPlaylistWithItemsDataDto> {
    const playlist = await this.getPlaylist(accountId, body.id);
    const itemIds = await this.playlistItemEntity.findAll({
      attributes: ['id', 'fileId', 'position', 'radioStationTitle', 'radioStationUrl'],
      where: {
        playlistId: playlist.id,
      },
      order: [['position', 'ASC']],
    });
    const tracks = await this.libraryService.listTracks(accountId, {}, 0, 100_000);
    const radioStationTrack = {
      albumArtists: [],
      albumTitle: '',
      artists: [],
      comment: '',
      composers: [],
      discNumber: 0,
      duration: 0,
      fileBitRate: 0,
      fileChannels: 0,
      fileFrequency: 0,
      filePath: '',
      fileSize: 0,
      fileType: FileTypeEnum.FLAC,
      genres: [],
      id: '',
      title: '',
      trackNumber: 0,
      year: 0,
    };
    return {
      playlists: [
        {
          id: `playlist_personal_normal/${playlist.name}`,
          library: 'personal',
          name: playlist.name,
          sharing_status: 'none',
          type: playlist.type,
          additional: {
            sharing_info: {
              date_available: 0,
              date_expired: 0,
              id: '',
              url: '',
              status: 'none',
            },
            songs_offset: body.offset,
            songs_total: tracks.items.length,
            songs: itemIds.map((item) => {
              const track = tracks.items.find((t) => t.id === item.fileId) || radioStationTrack;
              const id = track.id
                ? `music_${track.id}`
                : // eslint-disable-next-line max-len
                  `remote_{"album":""\\,"artist":""\\,"cover":""\\,"duration":0\\,"title":"${item.radioStationTitle}"}\n ${item.radioStationUrl}}`;
              return {
                id,
                position: item.position,
                path: track?.filePath || item.radioStationUrl || '',
                title: track?.title || item.radioStationTitle || '',
                type: track.id ? ContentTypeEnum.FILE : ContentTypeEnum.REMOTE,
                additional: {
                  song_audio: {
                    bitrate: track?.fileBitRate || 0,
                    channel: track?.fileChannels || 0,
                    codec: track?.fileType || FileTypeEnum.FLAC,
                    container: track?.fileType || FileTypeEnum.FLAC,
                    duration: track?.duration || 0,
                    filesize: track?.fileSize || 0,
                    frequency: track?.fileFrequency || 0,
                  },
                  song_rating: {
                    rating: 0,
                  },
                  song_tag: {
                    album: track.albumTitle || 'sbin',
                    artist: track.artists?.map((artist) => artist.name)?.join(', ') || '',
                    album_artist: track.albumArtists?.map((artist) => artist.name)?.join(', ') || '',
                    composer: track.composers.map((composer) => composer.name)?.join(', ') || '',
                    comment: track.comment || '',
                    genre: track.genres?.map((genre) => genre.name)?.join(', ') || '',
                    title: track.title || '',
                    track: track.trackNumber || 0,
                    year: track.year || 0,
                    disc: track.discNumber || 0,
                  },
                },
              };
            }),
          },
        },
      ],
    };
  }

  async getPlaylistInfo(accountId: number, body: SynologyPlaylistRetrieveBodyDto): Promise<SynologyPlaylistDataDto> {
    const playlist = await this.getPlaylist(accountId, body.id);
    if (playlist.type === PlaylistTypeEnum.NORMAL) {
      return {
        offset: 0,
        total: 1,
        playlists: [
          {
            id: `playlist_personal_${playlist.type}/${playlist.name}`,
            library: 'personal',
            name: playlist.name,
            sharing_status: 'none',
            type: playlist.type,
            additional: {
              sharing_info: {
                date_available: 0,
                date_expired: 0,
                id: '',
                url: '',
                status: 'none',
              },
            },
          },
        ],
      };
    }
    const rules = await this.playlistSmartRuleEntity.findAll({
      where: {
        playlistId: playlist.id,
      },
      order: [['id', 'ASC']],
    });
    return {
      offset: 0,
      total: 1,
      playlists: [
        {
          id: `playlist_personal_${playlist.type}/${playlist.name}`,
          library: 'personal',
          name: playlist.name,
          sharing_status: 'none',
          type: playlist.type,
          additional: {
            rules: rules.map(ruleToRow),
            rules_conjunction: playlist.rulesConjugal,
            sharing_info: {
              date_available: 0,
              date_expired: 0,
              id: '',
              url: '',
              status: 'none',
            },
          },
        },
      ],
    };
  }

  async moveItem(accountId: number, body: SynologyPlaylistAddOrRemoveItemBodyDto) {
    const playlist = await this.getPlaylist(accountId, body.id);
    if (playlist.type === PlaylistTypeEnum.SMART) {
      throw new Error('Cannot move items in a smart playlist');
    }
    const items = await this.playlistItemEntity.findAll({
      attributes: ['id', 'fileId', 'radioStationUrl', 'radioStationTitle', 'position'],
      where: {
        playlistId: playlist.id,
      },
      order: [['position', 'ASC']],
    });
    const movingItems = items.filter((item) => {
      const idValue = item.fileId || `radio_${item.radioStationTitle} ${item.radioStationUrl}`;
      return body.songs.includes(idValue);
    });
    const remainingItems = items.filter((item) => {
      const idValue = item.fileId || `radio_${item.radioStationTitle} ${item.radioStationUrl}`;
      return !body.songs.includes(idValue);
    });
    const insertAt = Math.min(Math.max(body.offset, 0), remainingItems.length);
    const newOrder = [...remainingItems.slice(0, insertAt), ...movingItems, ...remainingItems.slice(insertAt)];
    const transaction = await this.playlistItemEntity.sequelize?.transaction();
    for (let i = 0; i < newOrder.length; i += 1) {
      const item = newOrder[i];
      if (item) {
        // eslint-disable-next-line no-await-in-loop
        await this.playlistItemEntity.update(
          {
            position: i + 1,
          },
          {
            where: {
              id: item.id,
              playlistId: playlist.id,
            },
            transaction,
          },
        );
      }
    }
    if (transaction) {
      try {
        await transaction.commit();
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    }
  }

  async removeItem(accountId: number, body: SynologyPlaylistAddOrRemoveItemBodyDto) {
    const playlist = await this.getPlaylist(accountId, body.id);
    const items = await this.playlistItemEntity.findAll({
      attributes: ['id'],
      where: {
        playlistId: playlist.id,
      },
    });
    if (!items || items.length < body.offset) {
      throw new Error(`Playlist item with offset ${body.offset} not found in playlist ${body.id}`);
    }
    const deleteItems: number[] = [];
    for (let i = body.offset; i < body.offset + body.limit; i += 1) {
      const item = items[i];
      if (item) {
        deleteItems.push(item.id);
      }
    }
    if (deleteItems.length === 0) {
      throw new Error(`Playlist item with offset ${body.offset} not found in playlist ${body.id}`);
    }
    const transaction = await this.playlistItemEntity.sequelize?.transaction();
    await this.playlistItemEntity.destroy({
      where: {
        id: {
          [Op.in]: deleteItems,
        },
      },
      transaction,
    });
    for (let i = body.offset - 1 + body.limit; i < items.length; i += 1) {
      const nextItem = items[i];
      if (nextItem) {
        // eslint-disable-next-line no-await-in-loop
        await this.playlistItemEntity.update(
          {
            position: i - body.limit + 1,
          },
          {
            where: {
              id: nextItem.id,
            },
            transaction,
          },
        );
      }
    }
    if (transaction) {
      try {
        await transaction.commit();
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    }
  }

  async renamePlaylist(accountId: number, body: SynologyPlaylistRenameBodyDto) {
    const playlist = await this.getPlaylist(accountId, body.id);
    await this.playlistEntity.update(
      {
        name: replaceDoubleQuotes(body.new_name),
      },
      {
        where: {
          id: playlist.id,
        },
      },
    );
    return {
      id: `playlist_personal/${replaceDoubleQuotes(body.new_name)}`,
    };
  }

  async updateSmartPlaylist(accountId: number, body: SynologyPlaylistUpdateSmartBodyDto) {
    const playlist = await this.getPlaylist(accountId, body.id);
    const transaction = await this.playlistEntity.sequelize?.transaction();
    await this.playlistEntity.update(
      {
        name: replaceDoubleQuotes(body.name),
        rulesConjugal: body.conj_rule,
        type: PlaylistTypeEnum.SMART,
      } as PlaylistEntity,
      {
        where: {
          id: playlist.id,
        },
        transaction,
      },
    );
    await this.playlistSmartRuleEntity.destroy({
      where: {
        playlistId: playlist.id,
      },
      transaction,
    });
    for (let i = 0, len = body.rules_json.length; i < len; i += 1) {
      const rule = body.rules_json[i];
      if (rule) {
        // eslint-disable-next-line no-await-in-loop
        await this.playlistSmartRuleEntity.create(
          {
            playlistId: playlist.id,
            field: rule.fieldName,
            operation: rule.operationName,
            value: rule.tagval,
            interval: rule.intervalName,
          } as PlaylistSmartRuleEntity,
          {
            transaction,
          },
        );
      }
    }
    if (transaction) {
      try {
        await transaction.commit();
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    }
    return {
      id: `playlist_personal_smart/${body.name}`,
    };
  }
}
