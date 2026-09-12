import { ConfigService } from 'src/config/config.service';
import { Cron, CronExpression, Interval, Timeout } from '@nestjs/schedule';
import { ErrorCodes } from 'src/constants/error-codes';
import { FSWatcher, readdir, stat, watch } from 'node:fs';
import { FileEntity, FolderEntity, IndexerConfigurationEntity, RootPathEntity } from 'src/database/entities';
import { IAudioMetadata, IOptions } from 'src/types/music-metadata';
import { IndexAlbumService } from './index-album.service';
import { IndexArtistService } from './index-artist.service';
import { IndexComposerService } from './index-composer.service';
import { IndexFileService } from './index-file.service';
import { IndexGenreService } from './index-genre.service';
import { InjectModel } from '@nestjs/sequelize';
import { Injectable, Logger } from '@nestjs/common';
import { Op } from 'sequelize';
import { SystemConfigurationEntity } from 'src/database/entities/system-configurations.entity';
import { basename, join, sep } from 'node:path';
import { promisify } from 'util';

const readDirAsync = promisify(readdir);
const statAsync = promisify(stat);
const validFiles = ['mp3', 'flac', 'ogg', 'm4a'];

type FileItem = { path: string; lastModified: Date; size: number };
type FileUpdateItem = {
  embeddedData: IAudioMetadata;
  fileId: number;
  path: string;
  lastModified: Date;
  size: number;
};

type LogEntry = {
  date: Date;
  accountId: number;
  message: string;
  rootPathId: number;
};

@Injectable()
export class IndexerService {
  private readonly logger: Logger = new Logger(IndexerService.name);

  private readonly scannerQueue: number[] = [];

  private readonly watchedFolders: Record<number, FSWatcher> = {};

  private isIndexing: boolean = false;

  public readonly logs: LogEntry[] = [];

  private logSizeLimit: number = 1000;

  private parseMetaData!: (filePath: string, options?: IOptions) => Promise<IAudioMetadata>;

  constructor(
    private readonly configService: ConfigService,
    private readonly indexAlbumService: IndexAlbumService,
    private readonly indexArtistService: IndexArtistService,
    private readonly indexComposerService: IndexComposerService,
    private readonly indexGenreService: IndexGenreService,
    private readonly indexFileService: IndexFileService,
    @InjectModel(FileEntity)
    private readonly fileEntity: typeof FileEntity,
    @InjectModel(FolderEntity)
    private readonly folderEntity: typeof FolderEntity,
    @InjectModel(IndexerConfigurationEntity)
    private readonly indexerConfigurationEntity: typeof IndexerConfigurationEntity,
    @InjectModel(RootPathEntity)
    private readonly rootPathEntity: typeof RootPathEntity,
    @InjectModel(SystemConfigurationEntity)
    private readonly systemConfigurationEntity: typeof SystemConfigurationEntity,
  ) {}

  @Timeout(1000)
  async manualStart() {
    this.addLogEntry(0, 0, 'Queueing root paths (manualStart)');
    await this.refreshFileWatchers();
    await this.scanQueuedPaths();
  }

  @Timeout(1)
  async testingStart() {
    if (this.configService.isTesting()) {
      this.manualStart();
    }
  }

  /**
   * Scans all root paths once an hour for any changes to the files and folders that
   * weren't detected by the file system watcher. This is a backup to ensure that any changes
   * that are missed by the file system watcher are still detected and processed.
   * @param {number} accountId The ID of the account whose root paths should be scanned
   * @returns {Promise<void>}
   */
  @Cron(CronExpression.EVERY_HOUR)
  async periodicRefresh(): Promise<void> {
    this.addLogEntry(0, 0, 'Queueing root paths (periodicRefresh)');
    // load the root paths to scan
    const rootPaths = await this.rootPathEntity.findAll({
      attributes: ['id'],
    });
    for (let i = 0, len = rootPaths.length; i < len; i += 1) {
      const rootPath = rootPaths[i];
      if (rootPath) {
        if (this.scannerQueue.indexOf(rootPath.id) === -1) {
          this.scannerQueue.push(rootPath.id);
        }
      }
    }
  }

  /**
   * Periodically do a SQLite vacuum to clean up
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async vacuumDatabase() {
    this.addLogEntry(0, 0, 'Vacuuming database');
    await this.fileEntity.sequelize?.query('VACUUM');
  }

  /**
   * Periodically checks for deletions and additions to the root paths and sets up or
   * destroys their filesystem watcher.
   */
  @Interval(10000)
  async refreshFileWatchers() {
    const rootPaths = await this.rootPathEntity.findAll({
      attributes: ['id', 'rootPath'],
    });
    // set file watchers on any new root paths
    for (let i = 0, len = rootPaths.length; i < len; i += 1) {
      const rootPath = rootPaths[i];
      if (rootPath) {
        if (!this.watchedFolders[rootPath.id]) {
          this.addLogEntry(0, 0, `Setting up watcher for root path: ${rootPath.rootPath}`);
          const watcher = watch(rootPath.rootPath, async (eventType, filename) => {
            this.addLogEntry(
              0,
              0,
              `File system event detected: ${eventType} - ${filename} (root path: ${rootPath.rootPath})`,
            );
            if (this.scannerQueue.indexOf(rootPath.id) === -1) {
              this.scannerQueue.push(rootPath.id);
            }
          });
          this.watchedFolders[rootPath.id] = watcher;
          this.scannerQueue.push(rootPath.id);
        }
      }
    }
    // delete obsolete watchers
    const currentIndexedRootPathIds = rootPaths.map((rootPath) => rootPath.id);
    const watchingRootPathIds = Object.keys(this.watchedFolders).map((id) => parseInt(id, 10));
    for (let i = 0, len = watchingRootPathIds.length; i < len; i += 1) {
      const watchingRootPathId = watchingRootPathIds[i];
      if (watchingRootPathId) {
        if (!currentIndexedRootPathIds.includes(watchingRootPathId)) {
          const staleWatcher = this.watchedFolders[watchingRootPathId];
          if (staleWatcher) {
            staleWatcher.close();
            delete this.watchedFolders[watchingRootPathId];
          }
          if (this.scannerQueue.indexOf(watchingRootPathId) !== -1) {
            this.scannerQueue.splice(this.scannerQueue.indexOf(watchingRootPathId), 1);
          }
        }
      }
    }
  }

  @Interval(10000)
  async scanQueuedPaths() {
    if (!this.scannerQueue.length) {
      return;
    }
    const config = await this.getSystemConfiguration();
    this.logSizeLimit = config.indexerLogSize;
    if (this.isIndexing) {
      this.addLogEntry(0, 0, `indexing in progress, queue will be processed later (${this.scannerQueue.length})`);
      return;
    }
    if (await this.isDisabled()) {
      this.addLogEntry(0, 0, `scanner is disabled, queue will be processed later (${this.scannerQueue.length})`);
      return;
    }
    this.addLogEntry(0, 0, `checking for queued root paths to scan (${this.scannerQueue.length})`);
    this.isIndexing = true;
    const nextRootPathToScan = this.scannerQueue.shift();
    if (nextRootPathToScan) {
      const rootPath = await this.rootPathEntity.findByPk(nextRootPathToScan);
      if (rootPath) {
        await this.scanRootPath(rootPath);
      }
    }
    this.isIndexing = false;
  }

  async addLogEntry(accountId: number, rootPathId: number, message: string) {
    const logEntry: LogEntry = {
      accountId,
      rootPathId,
      message,
      date: new Date(),
    };
    this.logger.log(`[accountId: ${accountId} rootPathId: ${rootPathId}] ${message}`);
    this.logs.push(logEntry);
    while (this.logs.length > this.logSizeLimit) {
      this.logs.shift();
    }
  }

  async getSystemConfiguration(): Promise<SystemConfigurationEntity> {
    const config = await this.systemConfigurationEntity.findOne({
      order: [['id', 'DESC']],
    });
    if (!config) {
      throw new Error(ErrorCodes.SYSTEM_CONFIGURATION_NOT_FOUND_ERROR);
    }
    return config;
  }

  async getConfiguration(): Promise<IndexerConfigurationEntity> {
    const config = await this.indexerConfigurationEntity.findOne({
      order: [['id', 'DESC']],
    });
    if (!config) {
      throw new Error(ErrorCodes.INDEXER_CONFIGURATION_NOT_FOUND_ERROR);
    }
    return config;
  }

  async isDisabled() {
    const config = await this.getConfiguration();
    return !config?.isEnabled;
  }

  async onModuleInit() {
    const musicMetaData = await import('music-metadata');
    this.parseMetaData = musicMetaData.parseFile;
  }

  /**
   * Performs a full scan of a root path and its nested contents and then examines
   * files for additions or modifications and synchronizes the database
   * @param {RootPathEntity} rootPath The indexer root path being scanned
   * @returns {Promise<void>}
   */
  async scanRootPath(rootPath: RootPathEntity): Promise<void> {
    if (await this.isDisabled()) {
      await this.addLogEntry(rootPath.accountId, rootPath.id, 'scanner is disabled, skipping scan');
      return;
    }
    await this.addLogEntry(rootPath.accountId, rootPath.id, `scanning root path `);
    const filesToScan: FileItem[] = [];
    const filesToUpdate: FileUpdateItem[] = [];
    const uniqueFolderPaths: string[] = [rootPath.rootPath];
    // start the path scanning to recursively identify all the files within the root path
    await this.scanFolderContents(rootPath, [rootPath.rootPath], filesToScan, uniqueFolderPaths);
    await this.addLogEntry(
      rootPath.accountId,
      rootPath.id,
      `root path contains ${uniqueFolderPaths.length} folders with ${filesToScan.length} files`,
    );
    // remove deleted folders and files from the database
    const deletedFolders = await this.folderEntity.destroy({
      where: {
        accountId: rootPath.accountId,
        folderPath: {
          [Op.notIn]: uniqueFolderPaths,
        },
        rootPathId: rootPath.id,
      },
    });
    if (deletedFolders) {
      await this.addLogEntry(
        rootPath.accountId,
        rootPath.id,
        `deleted ${deletedFolders} stale folder references from the database`,
      );
    }
    const deletedFiles = await this.fileEntity.destroy({
      where: {
        accountId: rootPath.accountId,
        rootPathId: rootPath.id,
        filePath: {
          [Op.notIn]: filesToScan.map((file) => file.path.substring(rootPath.rootPath.length)),
        },
      },
    });
    if (deletedFiles) {
      await this.addLogEntry(
        rootPath.accountId,
        rootPath.id,
        `deleted ${deletedFiles} stale file references from the database`,
      );
    }
    // start the file scanning to recursively identify all new or modified files
    await this.checkFile(rootPath, filesToScan, filesToUpdate);
    // start the metadata scanning to update the database with the latest file information
    await this.updateFile(rootPath, filesToUpdate);
    // update the folder tree for the root path
    await this.updateFolders(rootPath, uniqueFolderPaths);
  }

  /**
   * Recursively scans the root path and any subfolders for audio files
   * @param {RootPathEntity} rootPath The indexer root path being scanned
   * @param {string[]} foldersToScan Array of folders identified during the scan
   * @param {FileItem[]} filesToScan Array of files identified during the scan
   * @param {string[]} uniqueFolderPaths Array of unique folder paths identified during the scan
   * @returns {Promise<void>}
   */
  async scanFolderContents(
    rootPath: RootPathEntity,
    foldersToScan: string[],
    filesToScan: FileItem[],
    uniqueFolderPaths: string[],
  ): Promise<void> {
    if (await this.isDisabled()) {
      await this.addLogEntry(rootPath.accountId, rootPath.id, 'scanner is disabled, skipping scan');
      return;
    }
    if (!foldersToScan.length) {
      return;
    }
    const folderPath = foldersToScan.shift();
    if (!folderPath) {
      return;
    }
    const folderContents = await readDirAsync(folderPath);
    for (let i = 0, len = folderContents.length; i < len; i += 1) {
      const fileName = folderContents[i];
      if (fileName) {
        const filePath = join(folderPath, fileName);
        // eslint-disable-next-line no-await-in-loop
        const contentStat = await statAsync(filePath);
        if (contentStat.isDirectory()) {
          foldersToScan.push(filePath);
          if (!uniqueFolderPaths.includes(filePath)) {
            uniqueFolderPaths.push(filePath);
          }
        } else if (contentStat.isFile()) {
          const fileType = fileName.toLowerCase().split('.').pop() || '';
          if (validFiles.includes(fileType.toLowerCase())) {
            filesToScan.push({
              path: filePath,
              lastModified: contentStat.mtime,
              size: contentStat.size,
            });
          }
        }
      }
    }
    await this.scanFolderContents(rootPath, foldersToScan, filesToScan, uniqueFolderPaths);
  }

  /**
   * Recursively checks files to determine if they need to be added or updated in the database
   * @param {RootPathEntity} rootPath The indexer root path being scanned
   * @param {FileItem[]} filesToScan Array of files to be scanned
   * @param {FileUpdateItem[]} filesToUpdate Array of files that have been added or modified
   * @returns {Promise<void>}
   */
  async checkFile(rootPath: RootPathEntity, filesToScan: FileItem[], filesToUpdate: FileUpdateItem[]): Promise<void> {
    if (await this.isDisabled()) {
      await this.addLogEntry(rootPath.accountId, rootPath.id, 'scanner is disabled, skipping scan');
      return;
    }
    if (!filesToScan.length) {
      return;
    }
    const fileItem = filesToScan.shift();
    if (!fileItem) {
      return;
    }
    const { path: filePath, lastModified } = fileItem;
    const relativePath = filePath.substring(rootPath.rootPath.length);
    // get the album for the file
    const fileName = basename(filePath);
    const albumPath = filePath.replace(rootPath.rootPath, '').split(sep).slice(0, 3).join(sep);
    // check if the file exists in the database and is up to date
    const existingFile = await this.indexFileService.retrieveFileByPath(relativePath, ['id', 'fileMtime']);
    if (!existingFile || existingFile.fileMtime.getTime() !== lastModified.getTime()) {
      // get the idv3 information from the file
      let embeddedData: IAudioMetadata;
      try {
        embeddedData = await this.parseMetaData(filePath);
        if (existingFile) {
          embeddedData = await this.indexFileService.applyCustomFileData(existingFile.id, embeddedData);
        }
      } catch (error) {
        this.logger.error(`error reading metadata ${filePath}`, error);
        return;
      }
      if (!existingFile) {
        // add new track
        await this.addLogEntry(rootPath.accountId, rootPath.id, `found new track ${filePath}`);
        const album = await this.indexAlbumService.updateAlbum(rootPath, embeddedData, albumPath, rootPath.accountId);
        if (!album) {
          await this.addLogEntry(rootPath.accountId, rootPath.id, `album not found for file ${filePath}`);
          return;
        }
        // if it doesn't exist add it to the database
        const newFile = await this.fileEntity.create({
          accountId: rootPath.accountId,
          albumId: album.id,
          fileMtime: lastModified,
          filePath: relativePath,
          fileSize: fileItem.size,
          fileType: fileName.split('.').pop() || '',
          rootPathId: rootPath.id,
        } as FileEntity);
        filesToUpdate.push({
          embeddedData,
          fileId: newFile.id,
          lastModified,
          path: relativePath,
          size: fileItem.size,
        });
      } else if (existingFile.fileMtime.getTime() !== lastModified.getTime()) {
        await this.addLogEntry(rootPath.accountId, rootPath.id, `found modified track ${relativePath}`);
        // if it exists but the last-modified is different update it
        filesToUpdate.push({
          embeddedData,
          fileId: existingFile.id,
          lastModified,
          path: relativePath,
          size: fileItem.size,
        });
      }
    }
    await this.checkFile(rootPath, filesToScan, filesToUpdate);
  }

  /**
   * Recursively updates files until the queue is exhausted.  Each update will scan the file
   * for its IDv3 data and then synchronous the database with those values.
   * @param {RootPathEntity} rootPath The indexer root path being scanned
   * @param {FileUpdateItem[]} filesToUpdate Array of files that have been added or modified
   * @returns {Promise<void>}
   */
  async updateFile(rootPath: RootPathEntity, filesToUpdate: FileUpdateItem[]): Promise<void> {
    if (await this.isDisabled()) {
      await this.addLogEntry(rootPath.accountId, rootPath.id, 'scanner is disabled, skipping scan');
      return;
    }
    if (!filesToUpdate.length) {
      return;
    }
    const fileItem = filesToUpdate.shift();
    if (!fileItem) {
      return;
    }
    await this.synchronizeFile(
      rootPath,
      fileItem.embeddedData,
      fileItem.fileId,
      fileItem.path,
      fileItem.size,
      fileItem.lastModified,
    );
    await this.updateFile(rootPath, filesToUpdate);
  }

  /**
   * Copies the IDv3 data from the file to the database and updates the file's last-modified date
   * @param {RootPathEntity} rootPath The indexer root path being scanned
   * @param {IAudioMetadata} embeddedData The IDv3 data extracted from the file
   * @param {number} fileId The ID of the file in the database
   * @param {string} relativePath The path to the file on disk
   * @param {number} fileSize The size of the file
   * @param {Date} fileMtime The last-modified date of the file
   * @param {number} accountId The ID of the account owning the file
   * @returns {Promise<void>}
   */
  async synchronizeFile(
    rootPath: RootPathEntity,
    embeddedData: IAudioMetadata,
    fileId: number,
    relativePath: string,
    fileSize: number,
    fileMtime: Date,
  ) {
    if (await this.isDisabled()) {
      await this.addLogEntry(rootPath.accountId, rootPath.id, 'scanner is disabled, skipping scan');
      return;
    }
    await this.addLogEntry(rootPath.accountId, rootPath.id, `saving track ${relativePath}`);
    const transaction = await this.fileEntity.sequelize?.transaction();
    if (!transaction) {
      this.logger.error('transaction not available synchronizing file');
      return;
    }
    const fileDetail = await this.indexFileService.updateFile(embeddedData, fileId, rootPath.accountId, transaction);
    await this.indexArtistService.updateArtists(embeddedData, fileDetail, transaction);
    await this.indexComposerService.updateComposers(embeddedData, fileDetail, transaction);
    await this.indexGenreService.updateGenres(embeddedData, rootPath.accountId, fileDetail, transaction);
    await this.fileEntity.update(
      {
        fileMtime,
        fileSize,
        filePath: relativePath,
      },
      {
        where: {
          id: fileId,
        },
        transaction,
      },
    );
    try {
      await transaction.commit();
    } catch (error) {
      this.logger.error('transaction error synchronizing file', error);
      this.addLogEntry(rootPath.accountId, rootPath.id, `error synchronizing file ${error}`);
      await transaction.rollback();
    }
  }

  async updateFolders(rootPath: RootPathEntity, uniqueFolderPaths: string[]): Promise<void> {
    if (await this.isDisabled()) {
      await this.addLogEntry(rootPath.accountId, rootPath.id, 'scanner is disabled, skipping scan');
      return;
    }
    if (!uniqueFolderPaths.length) {
      return;
    }
    const folderItem = uniqueFolderPaths.shift();
    if (!folderItem) {
      return;
    }
    await this.synchronizeFolder(rootPath, folderItem);
    await this.updateFolders(rootPath, uniqueFolderPaths);
  }

  async synchronizeFolder(rootPath: RootPathEntity, folderPath: string): Promise<void> {
    if (await this.isDisabled()) {
      await this.addLogEntry(rootPath.accountId, rootPath.id, 'scanner is disabled, skipping scan');
      return;
    }
    const existing = await this.folderEntity.findOne({
      where: {
        folderPath,
        accountId: rootPath.accountId,
      },
    });
    if (!existing) {
      await this.addLogEntry(rootPath.accountId, rootPath.id, `adding folder ${folderPath}`);
      await this.folderEntity.create({
        accountId: rootPath.accountId,
        folderPath,
        isRoot: folderPath === rootPath.rootPath,
        rootPathId: rootPath.id,
      } as FolderEntity);
    }
  }
}
