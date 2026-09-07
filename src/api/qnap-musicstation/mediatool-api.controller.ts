import { AllowGuest } from 'src/api/role.guard';
import { ApiProduces, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Header, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { QNAP_MUSICSTATION_APIS } from 'src/constants/swagger';
import { QnapMediaToolApiQueryDto } from './dtos/mediatool-api.dto';
import { QnapMediaToolApiService } from './mediatool-api.service';
import { objectToXml } from 'src/utils/xml';

@Controller({
  path: '/musicstation/api',
})
@ApiTags(QNAP_MUSICSTATION_APIS)
export class QnapMediaToolApiController {
  constructor(private readonly mediaToolApiService: QnapMediaToolApiService) {}

  @Get('mediatool-api')
  @AllowGuest()
  @HttpCode(HttpStatus.OK)
  @ApiProduces('text/xml;charset=utf-8')
  @Header('Content-Type', 'text/xml; charset=utf-8')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async get(@Query() query: QnapMediaToolApiQueryDto | unknown) {
    const ipList = await this.mediaToolApiService.getIpList();
    return objectToXml(ipList, 'QDocRoot version="1.0"', 'QDocRoot');
  }
}
