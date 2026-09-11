/* eslint-disable max-classes-per-file */
import { AllowGuest } from 'src/api/role.guard';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiProduces,
  ApiTags,
  IntersectionType,
  PartialType,
  getSchemaPath,
} from '@nestjs/swagger';
import {
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Ip,
  Post,
  Query,
  Req,
  Scope,
  UseGuards,
} from '@nestjs/common';
import { QNAP_MUSICSTATION_APIS, QNAP_POST_TO_GET, XML_MIME_TYPE } from 'src/constants/swagger';
import {
  QnapAuthLoginAuthenticateQueryDto,
  QnapAuthLoginDto,
  QnapAuthLoginExistingLoginQueryDto,
  QnapAuthLoginFailedDto,
  QnapAuthLoginResumeSessionQueryDto,
  QnapAuthResumeSessionDto,
  QnapPreauthenticateDto,
} from './dtos/auth-login.dto';
import { QnapAuthLoginService } from './auth-login.service';
import { QnapGuard } from './qnap.guard';
import { objectToXml } from 'src/utils/xml';
import type { Request } from 'express';

class QnapAuthLoginQueryDto extends PartialType(
  IntersectionType(
    QnapAuthLoginAuthenticateQueryDto,
    QnapAuthLoginResumeSessionQueryDto,
    QnapAuthLoginExistingLoginQueryDto,
  ),
) {}

@Controller({
  path: '/cgi-bin',
  scope: Scope.REQUEST,
})
@ApiTags(QNAP_MUSICSTATION_APIS)
@UseGuards(QnapGuard)
export class QnapAuthLoginController {
  constructor(private readonly authLoginService: QnapAuthLoginService) {}

  // Android does a GET request
  @Get('authLogin.cgi')
  @AllowGuest()
  @HttpCode(HttpStatus.OK)
  @Header('Content-Type', XML_MIME_TYPE)
  @ApiProduces(XML_MIME_TYPE)
  @ApiOperation({
    summary: 'QNAP authentication (Android)',
    description: [
      [
        'Handles QNAP Music Station authentication requests.',
        'This includes preauthentication reporting system capabilities, authenticating users and creating sessions.',
        'The Android QMusic app uses the GET request.',
      ].join('\n'),
    ].join('\n'),
  })
  @ApiOkResponse({
    description: 'QNAP authentication response',
    content: {
      'application/xml': {
        schema: {
          oneOf: [
            {
              $ref: getSchemaPath(QnapPreauthenticateDto),
            },
            {
              $ref: getSchemaPath(QnapAuthLoginDto),
            },
            {
              $ref: getSchemaPath(QnapAuthLoginFailedDto),
            },
            {
              $ref: getSchemaPath(QnapAuthResumeSessionDto),
            },
          ],
          xml: {
            name: 'QDocRoot',
          },
        },
      },
    },
  })
  @ApiExtraModels(
    QnapAuthLoginAuthenticateQueryDto,
    QnapAuthLoginResumeSessionQueryDto,
    QnapAuthLoginExistingLoginQueryDto,
    QnapAuthResumeSessionDto,
    QnapPreauthenticateDto,
    QnapAuthLoginDto,
    QnapAuthLoginFailedDto,
  )
  async routeRequest(@Req() req: Request, @Ip() ipAddress: string, @Query() variousQueries: QnapAuthLoginQueryDto) {
    // console.log('authLogin.cgi', { query: variousQueries });
    const userAgent = req.headers['user-agent'] || '';
    // Route #1:  resuming session
    if (variousQueries.sid) {
      const query = variousQueries as QnapAuthLoginResumeSessionQueryDto;
      const data = await this.authLoginService.resumeSession(query.sid, ipAddress);
      // console.log('xml #1', objectToXml({ ...data }, 'QDocRoot version="1.0"', 'QDocRoot'));
      return objectToXml({ ...data }, 'QDocRoot version="1.0"', 'QDocRoot');
    }
    // Route #2:  authentication
    if (variousQueries.user && variousQueries.pwd) {
      const query = variousQueries as QnapAuthLoginAuthenticateQueryDto;
      const data = await this.authLoginService.authenticate(userAgent, query);
      // console.log('xml #2', objectToXml({ ...data }, 'QDocRoot version="1.0"', 'QDocRoot'));
      return objectToXml({ ...data }, 'QDocRoot version="1.0"', 'QDocRoot');
    }
    // Route #3:  existing login
    if (variousQueries.qtoken) {
      const query = variousQueries as QnapAuthLoginExistingLoginQueryDto;
      const data = await this.authLoginService.validateExistingSession(query.qtoken);
      // console.log('xml #3', objectToXml({ ...data }, 'QDocRoot version="1.0"', 'QDocRoot'));
      return objectToXml({ ...data }, 'QDocRoot version="1.0"', 'QDocRoot');
    }
    // Route #4:  pre-authentication
    const data = this.authLoginService.preauthenticate();
    // console.log('xml #4', objectToXml({ ...data }, 'QDocRoot version="1.0"', 'QDocRoot'));
    return objectToXml({ ...data }, 'QDocRoot version="1.0"', 'QDocRoot');
  }

  // iOS posts to this endpoint
  @Post('authLogin.cgi')
  @AllowGuest()
  @HttpCode(HttpStatus.OK)
  @Header('Content-Type', XML_MIME_TYPE)
  @ApiProduces(XML_MIME_TYPE)
  @ApiOperation({
    summary: 'QNAP authentication handler (iPhone)',
    description: [
      [
        'Handles QNAP Music Station authentication requests.',
        'This includes preauthentication reporting system capabilities, authenticating users and creating sessions.',
        QNAP_POST_TO_GET,
      ].join('\n'),
    ].join('\n'),
  })
  async postRequest(@Req() req: Request, @Ip() ipAddress: string, @Body() body: QnapAuthLoginQueryDto) {
    return this.routeRequest(req, ipAddress, body);
  }
}
