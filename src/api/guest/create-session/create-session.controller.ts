import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Body, Controller, Post, Req } from '@nestjs/common';
import { GUEST_APIS } from 'src/constants/swagger';
import {
  GuestCreateSessionBadRequestResponseDto,
  GuestCreateSessionBodyDto,
  GuestCreateSessionResponseDto,
} from './create-session.dto';
import { GuestCreateSessionService } from './create-session.service';
import { InternalServerErrorResponseDto } from 'src/api/response.dto';

@Controller({
  path: '/api/guest',
})
@ApiTags(GUEST_APIS)
export class GuestCreateSessionController {
  constructor(private readonly createSessionService: GuestCreateSessionService) {}

  @Post('create-session')
  @ApiOperation({
    summary: 'Sign in',
    description: [
      'Creates a user session and returns a JWT token used for authenticated API requests.',
      'The session can be lasting or temporary.',
      'Sessions are locked to the APIs that created them, these tokens cannot access QNAP or Synology APIs.',
    ].join('\n'),
  })
  @ApiCreatedResponse({
    type: GuestCreateSessionResponseDto,
  })
  @ApiBadRequestResponse({
    type: GuestCreateSessionBadRequestResponseDto,
  })
  @ApiInternalServerErrorResponse({
    type: InternalServerErrorResponseDto,
  })
  async post(@Req() req: Request, @Body() body: GuestCreateSessionBodyDto): Promise<GuestCreateSessionResponseDto> {
    const userAgent = req.headers['user-agent'] || '';
    const jwtToken = await this.createSessionService.post(userAgent, body);
    return {
      success: true,
      jwtToken,
    };
  }
}
