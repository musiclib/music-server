import { AllowGuest } from 'src/api/role.guard';
import { ApiExtraModels, ApiOkResponse, ApiProduces, ApiTags, getSchemaPath } from '@nestjs/swagger';
import { Controller, Header, HttpCode, HttpStatus, Post, Query, UseGuards } from '@nestjs/common';
import { QNAP_MUSICSTATION_APIS } from 'src/constants/swagger';
import { QnapAsLoginQueryDto, QnapUserAsLoginDto } from './dtos/as-login.dto';
import { QnapAsLoginService } from './as-login.service';
import { QnapGuard } from './qnap.guard';
import { objectToXml } from 'src/utils/xml';

@Controller({
  path: '/musicstation/api',
})
@ApiTags(QNAP_MUSICSTATION_APIS)
@UseGuards(QnapGuard)
export class QnapAsLoginController {
  constructor(private readonly qnapAsLoginApiService: QnapAsLoginService) {}

  @Post('as_login_api.php')
  @HttpCode(HttpStatus.OK)
  @AllowGuest()
  @ApiProduces('text/xml; charset=utf-8')
  @ApiExtraModels(QnapUserAsLoginDto)
  @ApiOkResponse({
    description: 'QNAP user login information',
    content: {
      'application/xml': {
        schema: {
          allOf: [
            {
              $ref: getSchemaPath(QnapUserAsLoginDto),
            },
          ],
          xml: {
            name: 'QDocRoot',
          },
        },
      },
    },
  })
  @Header('Content-Type', 'application/xml')
  async post(@Query() query: QnapAsLoginQueryDto) {
    const configuration = await this.qnapAsLoginApiService.getConfiguration(query.ssid);
    return objectToXml({ ...configuration }, 'QDocRoot version="1.0"', 'QDocRoot');
  }
}
