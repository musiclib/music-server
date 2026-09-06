import { FileEntity } from 'src/database/entities/file.entity';
import { FileTypeEnum } from 'src/types/enums';
import { FolderEntity } from 'src/database/entities/folder.entity';
import { InjectModel } from '@nestjs/sequelize/dist/common/sequelize.decorators';
import { Injectable } from '@nestjs/common';
import { UserTreeItemDto } from './folder-structure.dto';
import { sep } from 'node:path';

const fileTypes = Object.values(FileTypeEnum);

function isMusicFile(candidate: string): boolean {
  return fileTypes.some((type) => candidate.toLowerCase().endsWith(`.${type}`));
}

function pathsToTree(rootPath: FolderEntity, paths: UserTreeItemDto[]): UserTreeItemDto {
  const root: UserTreeItemDto = {
    folder: rootPath.folderPath,
    fullPath: rootPath.folderPath,
    id: rootPath.id,
    children: [],
  };
  for (let i = 0, len = paths.length; i < len; i += 1) {
    const item = paths[i];
    const fullPath = item?.fullPath;
    if (fullPath && fullPath !== rootPath.folderPath) {
      if (fullPath.startsWith(`${rootPath.folderPath}/`)) {
        const relativePath = fullPath.slice(rootPath.folderPath.length + 1);
        const parts = relativePath.split('/');
        let current: UserTreeItemDto = root;
        for (let j = 0, jLen = parts.length; j < jLen; j += 1) {
          const part = parts[j];
          if (part) {
            const isFile = j === parts.length - 1 && isMusicFile(part);
            if (isFile) {
              current.children?.push({
                file: part,
                fullPath,
                id: item.id,
              });
            } else {
              let folder: UserTreeItemDto | undefined = current.children?.find((node) => node.folder === part);
              if (!folder) {
                folder = {
                  folder: part,
                  fullPath: `${current.fullPath}/${part}`,
                  id: item.id,
                  children: [],
                };
                current.children?.push(folder);
              }
              current = folder;
            }
          }
        }
      }
    }
  }
  return root;
}

@Injectable()
export class UserFolderStructureService {
  constructor(
    @InjectModel(FileEntity)
    private readonly fileEntity: typeof FileEntity,
    @InjectModel(FolderEntity)
    private readonly folderEntity: typeof FolderEntity,
  ) {}

  async getTreeStructure(accountId: number) {
    const rootPaths = await this.folderEntity.findAll({
      attributes: ['id', 'folderPath', 'rootPathId'],
      where: {
        accountId,
        isRoot: true,
      },
    });
    const files = await this.fileEntity.findAll({
      attributes: ['id', 'filePath', 'rootPathId'],
      where: {
        accountId,
      },
    });
    const trees: UserTreeItemDto[] = [];
    for (let i = 0, len = rootPaths.length; i < len; i += 1) {
      const rootPath = rootPaths[i];
      if (rootPath) {
        const fileIndex: Record<string, FileEntity[]> = {};
        for (let j = 0, jLen = files.length; j < jLen; j += 1) {
          const file = files[j];
          if (file?.rootPathId === rootPath.rootPathId) {
            const filePath = file.filePath.split('/').slice(0, -1).join(sep);
            const array = fileIndex[filePath] || [];
            array.push(file);
            fileIndex[filePath] = array;
          }
        }
        // eslint-disable-next-line no-await-in-loop
        const folders = await this.folderEntity.findAll({
          attributes: ['id', 'folderPath'],
          where: {
            accountId,
            rootPathId: rootPath.rootPathId,
          },
        });
        const paths: UserTreeItemDto[] = [];
        for (let j = 0, jLen = folders.length; j < jLen; j += 1) {
          const folder = folders[j];
          if (folder) {
            paths.push({
              folder: folder.folderPath.substring(rootPath.folderPath.length),
              fullPath: folder.folderPath,
              id: folder.id,
            });
            const folderPath = folder.folderPath.substring(rootPath.folderPath.length);
            const folderFiles = fileIndex[folderPath] || [];
            paths.push(
              ...folderFiles.map((file) => ({
                fullPath: `${rootPath.folderPath}${file.filePath}`,
                file: file.filePath.split(sep).pop(),
                id: file.id,
              })),
            );
          }
        }
        trees.push(pathsToTree(rootPath, paths));
      }
    }
    return trees;
  }
}
