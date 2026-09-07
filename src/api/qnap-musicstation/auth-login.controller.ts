import { AllowGuest } from 'src/api/role.guard';
import { ApiProduces, ApiTags } from '@nestjs/swagger';
import { Controller, Get, Header, HttpCode, HttpStatus, NotFoundException, Query, Req } from '@nestjs/common';
import { QNAP_MUSICSTATION_APIS } from 'src/constants/swagger';
import {
  QnapAuthExistingLoginQueryDto,
  QnapAuthLoginPreAuthQueryDto,
  QnapAuthLoginQueryDto,
} from './dtos/auth-login.dto';
import { QnapAuthLoginService } from './auth-login.service';
import { objectToXml } from 'src/utils/xml';
import { plainToInstance } from 'class-transformer';
import type { Request } from 'express';

@Controller({
  path: '/cgi-bin',
})
@ApiTags(QNAP_MUSICSTATION_APIS)
export class QnapAuthLoginController {
  constructor(private readonly authLoginService: QnapAuthLoginService) {}

  @Get('authLogin.cgi')
  @AllowGuest()
  @HttpCode(HttpStatus.OK)
  @ApiProduces('text/xml; charset=utf-8')
  @Header('Content-Type', 'application/xml')
  async routeRequest(
    @Req() req: Request,
    @Query() variousQueries: QnapAuthLoginQueryDto | QnapAuthLoginPreAuthQueryDto | QnapAuthExistingLoginQueryDto,
  ) {
    const userAgent = req.headers['user-agent'] || '';
    // Route #1:  pre-authentication
    if (!('user' in variousQueries)) {
      const data = await this.authLoginService.preauthenticate(userAgent);
      return objectToXml(data, 'QDocRoot version="1.0"', 'QDocRoot');
    }
    // Route #2:  authentication
    if ('user' in variousQueries && 'pwd' in variousQueries) {
      const query = plainToInstance(QnapAuthLoginQueryDto, variousQueries);
      const data = await this.authLoginService.authenticate(userAgent, query);
      return objectToXml(data, 'QDocRoot version="1.0"', 'QDocRoot');
    }
    // Route #3:  already signed in
    if ('qtoken' in variousQueries) {
      const query = plainToInstance(QnapAuthExistingLoginQueryDto, variousQueries);
      const data = await this.authLoginService.validateExistingSession(userAgent, query);
      return objectToXml(data, 'QDocRoot version="1.0"', 'QDocRoot');
    }
    throw new NotFoundException('Invalid request');
  }
}
