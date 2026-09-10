/* eslint-disable max-classes-per-file */
import { AllowGuest } from 'src/api/role.guard';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiProduces,
  ApiTags,
  IntersectionType,
  PartialType,
  getSchemaPath,
} from '@nestjs/swagger';
import { Controller, Get, Header, HttpCode, HttpStatus, Ip, Query, Req, Scope, UseGuards } from '@nestjs/common';
import { QNAP_MUSICSTATION_APIS } from 'src/constants/swagger';
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

class QnapAuthLoginQueryDto extends IntersectionType(
  PartialType(QnapAuthLoginAuthenticateQueryDto),
  PartialType(QnapAuthLoginResumeSessionQueryDto),
  PartialType(QnapAuthLoginExistingLoginQueryDto),
) {}

@Controller({
  path: '/cgi-bin',
  scope: Scope.REQUEST,
})
@ApiTags(QNAP_MUSICSTATION_APIS)
@UseGuards(QnapGuard)
export class QnapAuthLoginController {
  constructor(private readonly authLoginService: QnapAuthLoginService) {}

  @Get('authLogin.cgi')
  @AllowGuest()
  @HttpCode(HttpStatus.OK)
  @ApiProduces('text/xml; charset=utf-8')
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
    QnapAuthResumeSessionDto,
    QnapPreauthenticateDto,
    QnapAuthLoginDto,
    QnapAuthLoginFailedDto,
  )
  @Header('Content-Type', 'application/xml')
  async routeRequest(@Req() req: Request, @Ip() ipAddress: string, @Query() variousQueries: QnapAuthLoginQueryDto) {
    const userAgent = req.headers['user-agent'] || '';
    // Route #1:  resuming session
    if (variousQueries.sid) {
      const query = variousQueries as QnapAuthLoginResumeSessionQueryDto;
      const data = await this.authLoginService.resumeSession(query.sid, ipAddress);
      return objectToXml({ ...data }, 'QDocRoot version="1.0"', 'QDocRoot');
    }
    // Route #2:  authentication
    if (variousQueries.user && variousQueries.pwd) {
      const query = variousQueries as QnapAuthLoginAuthenticateQueryDto;
      const data = await this.authLoginService.authenticate(userAgent, query);
      return objectToXml({ ...data }, 'QDocRoot version="1.0"', 'QDocRoot');
    }
    // Route #3:  existing login
    if (variousQueries.qtoken) {
      const query = variousQueries as QnapAuthLoginExistingLoginQueryDto;
      const data = await this.authLoginService.validateExistingSession(query.qtoken);
      return objectToXml({ ...data }, 'QDocRoot version="1.0"', 'QDocRoot');
    }
    // Route #4:  pre-authentication
    const data = this.authLoginService.preauthenticate();
    return objectToXml({ ...data }, 'QDocRoot version="1.0"', 'QDocRoot');
  }
}
