import { AuthenticationService } from 'src/authentication/authentication.service';
import { ConfigService } from 'src/config/config.service';
import { ErrorCodes } from 'src/constants/error-codes';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { QnapSysRequestDto } from './dtos/sys-request.dto';

function getTimezoneLabel(timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone) {
  const offset = new Intl.DateTimeFormat('en-US', {
    timeZone,
    timeZoneName: 'longOffset',
  })
    .formatToParts()
    .find((part) => part.type === 'timeZoneName')!
    .value.replace('GMT', 'GMT');
  const city = timeZone.split('/').pop()!.replace(/_/g, ' ');
  return `(${offset}) ${city}`;
}
@Injectable()
export class QnapSysRequestService {
  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async getSystem(jwtToken: string): Promise<QnapSysRequestDto> {
    const now = new Date();
    try {
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
    } catch (error) {
      return {
        authPassed: 0,
        model: {
          modelName: 'TS-KVM-CLD',
          internalModelName: 'TS-KVM',
          platform: 'TS-NASX86',
          platform_ex: 'X86_KVM',
          customModelName: '',
          displayModelName: 'QuTScloud',
          sas_model: 0,
          storage_v2: 1,
          encryptfsSupported: 1,
          is_zfs: 0,
          vqts: 'cloud_host',
          node: '',
          dual_node: '',
        },
        firmware: {
          name: 'QuTScloud',
          version: 'c5.2.9',
          number: 3468,
          build: 20260413,
          patch: 0,
          buildTime: '2026/04/13',
        },
        rfs_bits: 64,
        specVersion: '1.0',
        hostname: 'music-server',
        DemoSiteSuppurt: 'no',
        customLogo: {
          customFrontLogo: '',
          customLoginLogo: '',
        },
        func: {
          name: 'V3_MENU_STR02',
          ownContent: {
            system: {
              serverName: 'music-server',
              port: this.configService.get('LAN_SERVER_PORT') || this.configService.get('SERVER_PORT'),
              optionHF: 1,
              hideHF: 0,
              SSL: 0,
              SSLPort: 443,
              SSLForce: 0,
              HSTS: 0,
              iframe: 1,
              iframeurl: '',
              HTTPCompress: 1,
              XContentType: 1,
              SSLProtocol: 1.2,
              MaxSSLProtocol: 1.3,
              ServerHeaderEnable: 0,
              ServerHeader: '',
              SSLHighCipherEnable: 0,
              CSPEnable: 1,
              RedirectSystem: 0,
            },
            dateandtime: {
              timezone: getTimezoneLabel(),
              day: now.getDate(),
              year: now.getFullYear(),
              hour: now.getHours(),
              minute: now.getMinutes(),
              second: now.getSeconds(),
              dn: 0,
              month: now.getMonth() + 1,
              dateformatindex: 1,
              timeformat: 24,
              NTP: {
                enable: 1,
                ntpServer: 'pool.ntp.org',
                timeInterval: 6,
                type: 'hour',
                enableAdjDST: 'TRUE',
                enableDSTtable: 'FALSE',
                DSTfrom: '--',
                DSTto: '--',
                DSToffset: '--',
              },
              codepage: 437,
            },
            Popup: {
              raid_scrubbing_enabled: 0,
            },
            Region: {
              sys_region: 'GLB',
              www_myqnapcloud: 'www.myqnapcloud.com',
              license_myqnapcloud: 'license.qnap.com',
              account_myqnapcloud: 'account.qnap.com',
              download_qnap: 'download.qnap.com',
              update_qnap: 'update.qnap.com',
            },
            console_mgmt: {
              auto_launch: 1,
            },
          },
        },
        sleepSupport: 0,
      };
    }
    return {
      authPassed: 1,
      model: {
        modelName: 'TS-KVM-CLD',
        internalModelName: 'TS-KVM',
        platform: 'TS-NASX86',
        platform_ex: 'X86_KVM',
        customModelName: '',
        displayModelName: 'QuTScloud',
        sas_model: 0,
        storage_v2: 1,
        encryptfsSupported: 1,
        is_zfs: 0,
        vqts: 'cloud_host',
        node: '',
        dual_node: '',
      },
      firmware: {
        name: 'QuTScloud',
        version: 'c5.2.9',
        number: 3468,
        build: 20260413,
        patch: 0,
        buildTime: '2026/04/13',
      },
      rfs_bits: 64,
      specVersion: '1.0',
      hostname: 'music-server',
      DemoSiteSuppurt: 'no',
      customLogo: {
        customFrontLogo: '',
        customLoginLogo: '',
      },
      func: {
        name: 'V3_MENU_STR02',
        ownContent: {
          system: {
            serverName: 'music-server',
            port: this.configService.get('LAN_SERVER_PORT') || this.configService.get('SERVER_PORT'),
            optionHF: 1,
            hideHF: 0,
            SSL: 1,
            SSLPort: 443,
            SSLForce: 0,
            HSTS: 0,
            iframe: 1,
            iframeurl: '',
            HTTPCompress: 1,
            XContentType: 1,
            SSLProtocol: 1.2,
            MaxSSLProtocol: 1.3,
            ServerHeaderEnable: 0,
            ServerHeader: '',
            SSLHighCipherEnable: 0,
            CSPEnable: 1,
            RedirectSystem: 0,
          },
          dateandtime: {
            timezone: getTimezoneLabel(),
            day: now.getDate(),
            year: now.getFullYear(),
            hour: now.getHours(),
            minute: now.getMinutes(),
            second: now.getSeconds(),
            dn: 0,
            month: now.getMonth() + 1,
            dateformatindex: 1,
            timeformat: 24,
            NTP: {
              enable: 1,
              ntpServer: 'pool.ntp.org',
              timeInterval: 6,
              type: 'hour',
              enableAdjDST: 'TRUE',
              enableDSTtable: 'FALSE',
              DSTfrom: '--',
              DSTto: '--',
              DSToffset: '--',
            },
            codepage: 437,
          },
          Popup: {
            raid_scrubbing_enabled: 0,
          },
          Region: {
            sys_region: 'GLB',
            www_myqnapcloud: 'www.myqnapcloud.com',
            license_myqnapcloud: 'license.qnap.com',
            account_myqnapcloud: 'account.qnap.com',
            download_qnap: 'download.qnap.com',
            update_qnap: 'update.qnap.com',
          },
          console_mgmt: {
            auto_launch: 1,
          },
        },
      },
      sleepSupport: 0,
    };
  }
}
