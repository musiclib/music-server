import { AllowedRoles } from 'src/api/role.guard';
import { ApiExcludeController, ApiProduces, ApiTags } from '@nestjs/swagger';
import { Controller, Header, HttpCode, HttpStatus, Post, Query, UseGuards } from '@nestjs/common';
import { QNAP_MUSICSTATION_APIS, XML_MIME_TYPE } from 'src/constants/swagger';
import { QnapAsLocalPlaybackQueryDto } from './dtos/as-local-playback.dto';
import { QnapAsLocalPlaybackService } from './as-local-playback.service';
import { QnapGuard } from './qnap.guard';
import { UserRoleEnum } from 'src/types/enums';
import { objectToXml } from 'src/utils/xml';

@Controller({
  path: '/musicstation/api',
})
@ApiTags(QNAP_MUSICSTATION_APIS)
@ApiExcludeController()
@UseGuards(QnapGuard)
export class QnapAsLocalPlaybackController {
  constructor(private readonly qnapAsLocalPlaybackApiService: QnapAsLocalPlaybackService) {}

  @Post('as_localplayback.php')
  @HttpCode(HttpStatus.OK)
  @AllowedRoles([UserRoleEnum.USER, UserRoleEnum.ADMIN])
  @Header('Content-Type', XML_MIME_TYPE)
  @ApiProduces(XML_MIME_TYPE)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async post(@Query() query: QnapAsLocalPlaybackQueryDto) {
    const status = await this.qnapAsLocalPlaybackApiService.getStatus();
    return objectToXml(status, 'QDocRoot version="1.0"', 'QDocRoot');
  }
}
