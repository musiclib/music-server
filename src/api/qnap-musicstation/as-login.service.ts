import { AuthenticationService } from 'src/authentication/authentication.service';
import { ConfigService } from 'src/config/config.service';
import { ErrorCodes } from 'src/constants/error-codes';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class QnapAsLoginApiService {
  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async getConfiguration(jwtToken: string) {
    const payload: {
      accountId: number;
      sessionId: number;
      tokenHash: string;
    } = await this.jwtService.verifyAsync(jwtToken);
    const user = await this.authenticationService.getAccount(payload.accountId);
    if (!user) {
      throw new UnauthorizedException(ErrorCodes.AUTHORIZATION_ERROR, 'session-error-1');
    }
    const session = await this.authenticationService.getSession(payload.sessionId);
    if (!session || session.expiresAt.getTime() < new Date().getTime() || session.endedAt !== null) {
      throw new UnauthorizedException(ErrorCodes.AUTHORIZATION_ERROR, 'session-error-2');
    }
    const validSessionToken = await this.authenticationService.verifySessionToken(user, session, payload.tokenHash);
    if (!validSessionToken) {
      throw new UnauthorizedException(ErrorCodes.AUTHORIZATION_ERROR, 'session-error-3');
    }
    return {
      datas: {
        data: [
          {
            status: 1,
            localplayback: 0,
            alarm: 0,
            internetradio: 0,
            id3tageditor: 0,
            bluetooth: 0,
            dlna: 0,
            dlnaclient: 0,
            account: user.username,
            usr_id: 1000,
            sid: jwtToken,
            is_admin: 0,
            email: '',
            personal_email: '',
            defaultUpload: '',
            defaultUpload_ID: '',
            defaultUpload_Full_Path: '',
            scanMode: 'realtime',
            writable: 'Multimedia/Music',
            qdms_enable: 0,
            medialib: 1,
            home_path: '',
            localplayback_enable: 0,
            bluetooth_enable: 0,
            ssid: 1,
            is_hero: 0,
            cuid: this.configService.get('QNAP_CUID'),
            builtinFirmwareVersion: '5.2.9',
            displayModelName: 'Music Server',
            systemModelName: 'TS-KVM-CLD',
            api_functions: {
              createsharefolder: 0,
            },
          },
          {
            MSVersion: '5.4.9',
            media_console_support: '4.4.1',
            mediafoder_counts: 1,
            appVersion: '5.4.9',
            auth: 1,
            homes: 0,
            recycle: 1,
            qsync: 0,
            api_version: '2.1',
            cayin_install: 0,
            cayin_license: 'none',
          },
        ],
      },
    };
  }
}
