import { AllowGuest } from 'src/api/role.guard';
import { ApiProduces, ApiTags } from '@nestjs/swagger';
import { Controller, Header, HttpCode, HttpStatus, Post, Query, UseGuards } from '@nestjs/common';
import { QNAP_MUSICSTATION_APIS } from 'src/constants/swagger';
import { QnapAsLoginApiService } from './as-login.service';
import { QnapAsLoginQueryDto } from './dtos/as-login.dto';
import { QnapGuard } from './qnap.guard';
import { objectToXml } from 'src/utils/xml';

@Controller({
  path: '/musicstation/api',
})
@ApiTags(QNAP_MUSICSTATION_APIS)
@UseGuards(QnapGuard)
export class QnapAsLoginApiController {
  constructor(private readonly qnapAsLoginApiService: QnapAsLoginApiService) {}

  @Post('as_login_api.php')
  @HttpCode(HttpStatus.OK)
  @AllowGuest()
  @ApiProduces('text/xml; charset=utf-8')
  @Header('Content-Type', 'application/xml')
  async post(@Query() query: QnapAsLoginQueryDto) {
    const configuration = await this.qnapAsLoginApiService.getConfiguration(query.ssid);
    return objectToXml(configuration, 'QDocRoot version="1.0"', 'QDocRoot');
  }
}
