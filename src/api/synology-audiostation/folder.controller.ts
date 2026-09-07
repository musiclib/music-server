/* eslint-disable max-classes-per-file */
import { AUTHENTICATED_REQUEST_DESCRIPTION } from './consts';
import { AccountEntity } from 'src/database/entities';
import {
  ApiBody,
  ApiExtraModels,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { Body, Controller, HttpCode, HttpStatus, Logger, Post, UseGuards } from '@nestjs/common';
import { SYNOLOGY_AUDIOSTATION_APIS } from 'src/constants/swagger';
import {
  SynologyFolderBodyDto,
  SynologyFolderDto,
  SynologyFolderResponseDto,
  SynologyRootFolderBodyDto,
} from './dtos/folder.cgi.dto';
import { SynologyFolderService } from './folder.service';
import { SynologyGuard } from './synology.guard';
import { SynologySongDto } from './dtos';
import { User } from '../user.decorator';
import { plainToInstance } from 'class-transformer';

@Controller()
@ApiTags(SYNOLOGY_AUDIOSTATION_APIS)
@UseGuards(SynologyGuard)
export class SynologyFolderController {
  private readonly logger: Logger = new Logger(SynologyFolderController.name);

  constructor(private readonly folderService: SynologyFolderService) {}

  @Post('/webapi/AudioStation/folder.cgi')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Lists folders in the music library',
    description: [
      // eslint-disable-next-line max-len
      `Lists folders found in the music library to enable navigating music by the file path.  In this server the root folders are presented as the top-level contents.\n\nThe folders are returned in a paginated format, with the ability to specify an offset and limit for the results, where the offset indicates the starting point in the list and the limit specifies the maximum number of folders to return.`,
      AUTHENTICATED_REQUEST_DESCRIPTION,
    ].join('\n\n'),
  })
  @ApiHeader({
    name: 'cookie',
    description: 'The session ID and device ID cookies for the user `id={sessionId}; did={deviceId}`',
  })
  @ApiOkResponse({
    description: 'Returns a list of folders starting from the root paths and then traversing down their folder trees',
    type: SynologyFolderResponseDto,
  })
  @ApiExtraModels(SynologyRootFolderBodyDto, SynologyFolderBodyDto, SynologyFolderDto, SynologySongDto)
  @ApiBody({
    schema: {
      oneOf: [
        {
          $ref: getSchemaPath(SynologyRootFolderBodyDto),
        },
        {
          $ref: getSchemaPath(SynologyFolderBodyDto),
        },
      ],
    },
  })
  async route(
    @User() user: AccountEntity,
    @Body() variousBodies: SynologyRootFolderBodyDto | SynologyFolderBodyDto,
  ): Promise<SynologyFolderResponseDto> {
    if ('id' in variousBodies) {
      const body = plainToInstance(SynologyFolderBodyDto, variousBodies);
      const data = await this.folderService.listFolders(user.id, body.id, body.offset, body.limit);
      return {
        data,
        success: true,
      };
    }
    const body = plainToInstance(SynologyRootFolderBodyDto, variousBodies);
    const data = await this.folderService.listRootFolders(user.id, body.offset, body.limit);
    return {
      data,
      success: true,
    };
  }
}
