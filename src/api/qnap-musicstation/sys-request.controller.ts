import { AllowGuest } from '../role.guard';
import { ApiExtraModels, ApiOkResponse, ApiOperation, ApiProduces, ApiTags, getSchemaPath } from '@nestjs/swagger';
import { Controller, Get, Header, HttpCode, HttpStatus, Query, Scope, UseGuards } from '@nestjs/common';
import { QNAP_MUSICSTATION_APIS, XML_MIME_TYPE } from 'src/constants/swagger';
import { QnapGuard } from './qnap.guard';
import { QnapSysRequestDto, QnapSysRequestQueryDto } from './dtos/sys-request.dto';
import { QnapSysRequestService } from './sys-request.service';
import { objectToXml } from 'src/utils/xml';

@Controller({
  path: '/cgi-bin',
  scope: Scope.REQUEST,
})
@ApiTags(QNAP_MUSICSTATION_APIS)
@UseGuards(QnapGuard)
export class QnapSysRequestController {
  constructor(private readonly sysRequestApiService: QnapSysRequestService) {}

  // eslint-disable-next-line class-methods-use-this
  @Get('/sys/sysRequest.cgi')
  @HttpCode(HttpStatus.OK)
  @AllowGuest()
  @Header('Content-Type', XML_MIME_TYPE)
  @ApiProduces(XML_MIME_TYPE)
  @ApiExtraModels(QnapSysRequestDto)
  @ApiOkResponse({
    description: 'QNAP user login information',
    content: {
      'application/xml': {
        schema: {
          allOf: [
            {
              $ref: getSchemaPath(QnapSysRequestDto),
            },
          ],
          xml: {
            name: 'QDocRoot',
          },
        },
      },
    },
  })
  @ApiOperation({
    summary: 'System configuration for iPhone',
    description: [
      [
        'Part of the QNAP authentication chain',
        'This endpoint returns information to the QMusic iPhone app as part of the authentication process.',
      ].join('\n'),
    ].join('\n'),
  })
  async routeRequest(@Query() query: QnapSysRequestQueryDto) {
    const system = await this.sysRequestApiService.getSystem(query.sid);
    return objectToXml({ ...system }, 'QDocRoot version="1.0"', 'QDocRoot');
  }
}
