import { AllowGuest } from 'src/api/role.guard';
import { ApiExtraModels, ApiOkResponse, ApiProduces, ApiTags, getSchemaPath } from '@nestjs/swagger';
import { Body, Controller, Header, HttpCode, HttpStatus, Post, Query, Scope, UseGuards } from '@nestjs/common';
import { QNAP_MUSICSTATION_APIS } from 'src/constants/swagger';
import { QnapAsLoginBodyDto, QnapAsLoginQueryDto, QnapUserAsLoginDto } from './dtos/as-login.dto';
import { QnapAsLoginService } from './as-login.service';
import { QnapGuard } from './qnap.guard';
import { objectToXml } from 'src/utils/xml';

@Controller({
  path: '/musicstation/api',
  scope: Scope.REQUEST,
})
@ApiTags(QNAP_MUSICSTATION_APIS)
@UseGuards(QnapGuard)
export class QnapAsLoginController {
  constructor(private readonly qnapAsLoginApiService: QnapAsLoginService) {}

  @Post('as_login_api.php')
  @HttpCode(HttpStatus.OK)
  @AllowGuest()
  @ApiProduces('text/xml')
  @ApiExtraModels(QnapUserAsLoginDto, QnapAsLoginBodyDto)
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
  @Header('Content-Type', 'text/xml')
  async post(@Query() query?: QnapAsLoginQueryDto, @Body() body?: QnapAsLoginBodyDto) {
    const sessionToken = query?.ssid || body?.ssid || '';
    if (sessionToken) {
      const configuration = await this.qnapAsLoginApiService.getConfiguration(sessionToken);
      return objectToXml({ ...configuration }, 'QDocRoot version="1.0"', 'QDocRoot');
    }
    return objectToXml({ status: 1 }, 'QDocRoot version="1.0"', 'QDocRoot');
  }
}
