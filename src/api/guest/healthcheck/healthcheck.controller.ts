import { ApiTags } from '@nestjs/swagger';
import { Controller, Get } from '@nestjs/common';
import { GUEST_APIS } from 'src/constants/swagger';

@Controller({
  path: '/api/guest',
})
@ApiTags(GUEST_APIS)
export class GuestHealthcheckController {
  // eslint-disable-next-line class-methods-use-this
  @Get('healthcheck')
  healthcheck() {
    return { status: 'ok' };
  }
}
