import { AllowedRoles } from 'src/api/role.guard';
import { ApiExtraModels, ApiOkResponse, ApiOperation, ApiProduces, ApiTags, getSchemaPath } from '@nestjs/swagger';
import { Controller, Header, HttpCode, HttpStatus, Post, Query, UseGuards } from '@nestjs/common';
import { QNAP_AUTHENTICATED_REQUEST_DESCRIPTION, QNAP_MUSICSTATION_APIS, XML_MIME_TYPE } from 'src/constants/swagger';
import { QnapGuard } from './qnap.guard';
import { QnapMediaToolQueryDto, QnapMediaToolResponseDto } from './dtos/media-tool.dto';
import { QnapMediaToolService } from './media-tool.service';
import { UserRoleEnum } from 'src/types/enums';
import { objectToXml } from 'src/utils/xml';

@Controller({
  path: '/musicstation/api',
})
@ApiTags(QNAP_MUSICSTATION_APIS)
@UseGuards(QnapGuard)
export class QnapMediaToolController {
  constructor(private readonly mediaToolApiService: QnapMediaToolService) {}

  @Post('mediatool_api.php')
  @AllowedRoles([UserRoleEnum.USER, UserRoleEnum.ADMIN])
  @HttpCode(HttpStatus.OK)
  @Header('Content-Type', XML_MIME_TYPE)
  @ApiProduces(XML_MIME_TYPE)
  @ApiOkResponse({
    description: 'QNAP authentication response',
    content: {
      'application/xml': {
        schema: {
          allOf: [
            {
              $ref: getSchemaPath(QnapMediaToolResponseDto),
            },
          ],
          xml: {
            name: 'QDocRoot',
          },
        },
      },
    },
  })
  @ApiExtraModels(QnapMediaToolResponseDto)
  @ApiOperation({
    summary: 'Reports IP addresses to mobile apps',
    description: [
      'This endpoint reports the LAN and WAN IP addresses and ports to mobile clients.',
      QNAP_AUTHENTICATED_REQUEST_DESCRIPTION,
    ].join('\n'),
  })
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async get(@Query() query: QnapMediaToolQueryDto | unknown) {
    const info = await this.mediaToolApiService.getIpList();
    return objectToXml(
      {
        status: 1,
        ...info,
      },
      'QDocRoot version="1.0"',
      'QDocRoot',
    );
  }
}
