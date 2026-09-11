import {
  AUDIO_MIME_TYPES,
  BINARY_RESPONSE,
  QNAP_AUTHENTICATED_REQUEST_DESCRIPTION,
  QNAP_MUSICSTATION_APIS,
} from 'src/constants/swagger';
import { AccountEntity } from 'src/database/entities';
import { AllowedRoles } from 'src/api/role.guard';
import { ApiOkResponse, ApiOperation, ApiProduces, ApiTags } from '@nestjs/swagger';
import { Controller, Get, HttpCode, HttpStatus, Query, Res, UseGuards } from '@nestjs/common';
import { QnapAsGetFileQueryDto } from './dtos/as-get-file.dto';
import { QnapAsGetFileService } from './as-get-file.service';
import { QnapGuard } from './qnap.guard';
import { User } from '../user.decorator';
import { UserRoleEnum } from 'src/types/enums';
import { getAudioContentType } from 'src/utils/strings';
import type { Response } from 'express';

@Controller({
  path: '/musicstation/api',
})
@ApiTags(QNAP_MUSICSTATION_APIS)
@UseGuards(QnapGuard)
export class QnapAsGetFileController {
  constructor(private readonly qnapAsGetFileApiService: QnapAsGetFileService) {}

  @Get('as_get_file_api.php')
  @HttpCode(HttpStatus.OK)
  @AllowedRoles([UserRoleEnum.USER, UserRoleEnum.ADMIN])
  @ApiOkResponse(BINARY_RESPONSE)
  @ApiProduces(...AUDIO_MIME_TYPES)
  @ApiOperation({
    summary: 'Streams a music file to QMusic clients',
    description: ['Streams a music file for playback.', QNAP_AUTHENTICATED_REQUEST_DESCRIPTION].join('\n'),
  })
  async get(@User() user: AccountEntity, @Res() response: Response, @Query() query: QnapAsGetFileQueryDto) {
    const file = await this.qnapAsGetFileApiService.getFile(user.id, query.f);
    const eTag = `file-${query.f}-${file.updatedAt?.getTime() || ''}`;
    response.sendFile(file.fullPath, {
      headers: {
        'Content-Type': getAudioContentType(file.fileType),
        'Content-Length': file.fileSize,
        ETag: eTag,
      },
    });
  }
}
