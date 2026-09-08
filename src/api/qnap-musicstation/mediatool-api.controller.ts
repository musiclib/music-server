import { AllowedRoles } from 'src/api/role.guard';
import { ApiProduces, ApiTags } from '@nestjs/swagger';
import { Controller, Header, HttpCode, HttpStatus, Post, Query, UseGuards } from '@nestjs/common';
import { QNAP_MUSICSTATION_APIS } from 'src/constants/swagger';
import { QnapGuard } from './qnap.guard';
import { QnapMediaToolApiQueryDto } from './dtos/mediatool-api.dto';
import { QnapMediaToolApiService } from './mediatool-api.service';
import { UserRoleEnum } from 'src/types/enums';
import { objectToXml } from 'src/utils/xml';

@Controller({
  path: '/musicstation/api',
})
@ApiTags(QNAP_MUSICSTATION_APIS)
@UseGuards(QnapGuard)
export class QnapMediaToolApiController {
  constructor(private readonly mediaToolApiService: QnapMediaToolApiService) {}

  @Post('mediatool_api.php')
  @AllowedRoles([UserRoleEnum.USER, UserRoleEnum.ADMIN])
  @HttpCode(HttpStatus.OK)
  @ApiProduces('text/xml;charset=utf-8')
  @Header('Content-Type', 'text/xml; charset=utf-8')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async get(@Query() query: QnapMediaToolApiQueryDto | unknown) {
    const ipList = await this.mediaToolApiService.getIpList();
    return objectToXml(ipList, 'QDocRoot version="1.0"', 'QDocRoot');
  }
}
