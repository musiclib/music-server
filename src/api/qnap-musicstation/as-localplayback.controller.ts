import { AllowedRoles } from 'src/api/role.guard';
import { ApiProduces, ApiTags } from '@nestjs/swagger';
import { Controller, Header, HttpCode, HttpStatus, Post, Query, UseGuards } from '@nestjs/common';
import { QNAP_MUSICSTATION_APIS } from 'src/constants/swagger';
import { QnapAsLocalPlaybackApiService } from './as-localplayback.service';
import { QnapAsLocalPlaybackQueryDto } from './dtos/as-localplayback.dto';
import { QnapGuard } from './qnap.guard';
import { UserRoleEnum } from 'src/types/enums';
import { objectToXml } from 'src/utils/xml';

@Controller({
  path: '/musicstation/api',
})
@ApiTags(QNAP_MUSICSTATION_APIS)
@UseGuards(QnapGuard)
export class QnapAsLocalPlaybackApiController {
  constructor(private readonly qnapAsLocalPlaybackApiService: QnapAsLocalPlaybackApiService) {}

  @Post('as_localplayback.php')
  @HttpCode(HttpStatus.OK)
  @AllowedRoles([UserRoleEnum.USER, UserRoleEnum.ADMIN])
  @ApiProduces('text/xml; charset=utf-8')
  @Header('Content-Type', 'text/xml; charset=utf-8')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async post(@Query() query: QnapAsLocalPlaybackQueryDto) {
    const status = await this.qnapAsLocalPlaybackApiService.getStatus();
    return objectToXml(status, 'QDocRoot version="1.0"', 'QDocRoot');
  }
}
