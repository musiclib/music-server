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
import { SynologyGuard } from './synology.guard';
import {
  SynologyRadioAddOrUpdateItemBodyDto,
  SynologyRadioAddUserStationBodyDto,
  SynologyRadioContainerListBodyDto,
  SynologyRadioItemListBodyDto,
  SynologyRadioItemResponseDto,
} from './dtos';
import { SynologyRadioService } from './radio.service';
import { SynologySuccessResponseDto } from './dtos/synology.dto';
import { User } from '../user.decorator';
import { plainToInstance } from 'class-transformer';

@Controller()
@ApiTags(SYNOLOGY_AUDIOSTATION_APIS)
@UseGuards(SynologyGuard)
export class SynologyRadioController {
  private readonly logger: Logger = new Logger(SynologyRadioController.name);

  constructor(private readonly radioService: SynologyRadioService) {}

  /**
   * SHOUTcast radio integration is a feature of Synology AudioStation that allows users
   * to listen to SHOUTcast radio stations directly from the AudioStation interface. This
   * endpoint provides information about available SHOUTcast genres and stations.
   * @returns The JSON response containing the API information.
   */
  @Post('/webapi/AudioStation/radio.cgi')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Manages SHOUTcast radio integration',
    description: [
      // eslint-disable-next-line max-len
      `SHOUTcast radio integration is a feature of Synology AudioStation that allows users to listen to SHOUTcast radio stations directly from the AudioStation interface. This endpoint provides information about available SHOUTcast genres and stations`,
      `The genres are a hard-coded list.  The stations are retrieved from the SHOUTcast API and briefly cached.`,
      `The integration does not require a SHOUTcast account, but it does require an active internet connection.`,
      AUTHENTICATED_REQUEST_DESCRIPTION,
    ].join('\n\n'),
  })
  @ApiHeader({
    name: 'cookie',
    description: 'The session ID and device ID cookies for the user `id={sessionId}; did={deviceId}`',
  })
  @ApiOkResponse({
    description: 'Returns a list of genres found in the music library, or a hard-coded list of default genres',
    schema: {
      oneOf: [
        {
          $ref: getSchemaPath(SynologyRadioItemResponseDto),
        },
        {
          $ref: getSchemaPath(SynologySuccessResponseDto),
        },
      ],
    },
  })
  @ApiBody({
    schema: {
      oneOf: [
        {
          $ref: getSchemaPath(SynologyRadioContainerListBodyDto),
        },
        {
          $ref: getSchemaPath(SynologyRadioItemListBodyDto),
        },
        {
          $ref: getSchemaPath(SynologyRadioAddOrUpdateItemBodyDto),
        },
        {
          $ref: getSchemaPath(SynologyRadioAddUserStationBodyDto),
        },
      ],
    },
  })
  @ApiExtraModels(
    SynologyRadioContainerListBodyDto,
    SynologyRadioItemListBodyDto,
    SynologyRadioAddOrUpdateItemBodyDto,
    SynologyRadioAddUserStationBodyDto,
    SynologyRadioItemResponseDto,
    SynologySuccessResponseDto,
  )
  async routeRequests(
    @User() user: AccountEntity,
    @Body()
    variousBodies:
      | SynologyRadioContainerListBodyDto
      | SynologyRadioItemListBodyDto
      | SynologyRadioAddOrUpdateItemBodyDto
      | SynologyRadioAddUserStationBodyDto,
  ): Promise<SynologyRadioItemResponseDto | SynologySuccessResponseDto> {
    if (variousBodies.method === 'list' && (variousBodies as SynologyRadioItemListBodyDto).container) {
      // Route #1:  Requesting the stations for a genre, which bundles the genre name
      // in the container field (e.g., `SHOUTcast_genre_Rock`).
      if ((variousBodies as SynologyRadioItemListBodyDto).container.indexOf('_genre_') > -1) {
        const body = plainToInstance(SynologyRadioItemListBodyDto, variousBodies);
        return this.listStations(user, body);
      }
      // Route #2:  Requesting the contents of a container (e.g., SHOUTcast genres)
      const body = plainToInstance(SynologyRadioItemListBodyDto, variousBodies);
      return this.listItems(user, body);
    }
    if (variousBodies.method === 'updateradios' && 'radios_json' in variousBodies) {
      const body = plainToInstance(SynologyRadioAddOrUpdateItemBodyDto, variousBodies);
      // Route #3:  Adding a favorite or user-defined station
      if (variousBodies.offset === -1) {
        return this.addOrUpdateItem(user, body);
      }
      // Route #4:  Updating a favorite or user-defined station
      if (body.radios_json[0]?.url) {
        return this.addOrUpdateItem(user, body);
      }
      // Route #5:  Deleting a favorite or user-defined station
      return this.deleteItem(user, body);
    }
    // Route #6:  Adding a user-defined station
    if (variousBodies.method === 'add' && 'container' in variousBodies) {
      const body = plainToInstance(SynologyRadioAddUserStationBodyDto, variousBodies);
      return this.addOrUpdateItem(user, {
        ...body,
        radios_json: [
          {
            title: body.title,
            url: body.url,
            desc: body.desc,
          },
        ],
        offset: -1,
      });
    }
    // Route #7:  Requesting the container list
    return this.listContainers(user);
  }

  async listContainers(user: AccountEntity): Promise<SynologyRadioItemResponseDto> {
    const data = await this.radioService.listContainers(user.id);
    return {
      data,
      success: true,
    };
  }

  async listItems(user: AccountEntity, body: SynologyRadioItemListBodyDto): Promise<SynologyRadioItemResponseDto> {
    const data = await this.radioService.listItems(user.id, body);
    return {
      data,
      success: true,
    };
  }

  async listStations(user: AccountEntity, body: SynologyRadioItemListBodyDto): Promise<SynologyRadioItemResponseDto> {
    const data = await this.radioService.listStations(user.id, body);
    return {
      data,
      success: true,
    };
  }

  async addOrUpdateItem(
    user: AccountEntity,
    body: SynologyRadioAddOrUpdateItemBodyDto,
  ): Promise<SynologySuccessResponseDto> {
    await this.radioService.addOrUpdateItem(user.id, body);
    return {
      success: true,
    };
  }

  async deleteItem(
    user: AccountEntity,
    body: SynologyRadioAddOrUpdateItemBodyDto,
  ): Promise<SynologySuccessResponseDto> {
    await this.radioService.deleteItem(user.id, body);
    return {
      success: true,
    };
  }
}
