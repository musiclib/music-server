import { ConfigService } from 'src/config/config.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class QnapMediaToolApiService {
  constructor(private readonly configService: ConfigService) {}

  async getIpList() {
    return {
      status: 1,
      info: {
        LANIP: this.configService.get('LAN_SERVER_ADDRESS') || this.configService.get('SERVER_ADDRESS'),
        LANIP_LIST: this.configService.get('LAN_SERVER_ADDRESS') || this.configService.get('SERVER_ADDRESS'),
        INNERPORT: this.configService.get('LAN_SERVER_PORT') || this.configService.get('SERVER_PORT'),
        // INNERPORT_SSL: '443',
        EXTIP:
          this.configService.get('WAN_SERVER_ADDRESS') ||
          this.configService.get('LAN_SERVER_ADDRESS') ||
          this.configService.get('SERVER_ADDRESS'),
        EXTPORT:
          this.configService.get('WAN_SERVER_PORT') ||
          this.configService.get('LAN_SERVER_PORT') ||
          this.configService.get('SERVER_PORT'),
        // EXTPORT_SSL: '443',
      },
    };
  }
}
