import { AllowedRoles } from 'src/api/role.guard';
import { ApiExtraModels, ApiOkResponse, ApiProduces, ApiTags, getSchemaPath } from '@nestjs/swagger';
import { Controller, Header, HttpCode, HttpStatus, Post, Query, UseGuards } from '@nestjs/common';
import { QNAP_MUSICSTATION_APIS } from 'src/constants/swagger';
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
  @ApiProduces('text/xml;charset=utf-8')
  @Header('Content-Type', 'text/xml; charset=utf-8')
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
