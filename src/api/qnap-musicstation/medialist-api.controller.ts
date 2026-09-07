import { AllowGuest } from 'src/api/role.guard';
import { ApiProduces, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Header, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { QNAP_MUSICSTATION_APIS } from 'src/constants/swagger';
import { QnapMediaListApiRandomQueryDto } from './dtos/medialist-api.dto';
import { QnapMediaListApiService } from './medialist-api.service';
import { objectToXml } from 'src/utils/xml';

@Controller({
  path: '/musicstation/api',
})
@ApiTags(QNAP_MUSICSTATION_APIS)
export class QnapMediaListApiController {
  constructor(private readonly mediaListApiService: QnapMediaListApiService) {}

  @Get('mediaList-api')
  @AllowGuest()
  @HttpCode(HttpStatus.OK)
  @ApiProduces('text/xml;charset=utf-8')
  @Header('Content-Type', 'text/xml; charset=utf-8')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async get(@Query() query: QnapMediaListApiRandomQueryDto) {
    const randomList = await this.mediaListApiService.getRandomList();
    return objectToXml(randomList, 'QDocRoot version="1.0"', 'QDocRoot');
  }
}
