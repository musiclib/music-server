import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class QnapMediaToolApiService {
  constructor(private readonly configService: ConfigService) {}

  async getIpList() {
    return {
      status: 1,
      info: {
        LANIP: this.configService.get('PINNED_SERVER_ADDRESS'),
        LANIP_LIST: this.configService.get('PINNED_SERVER_ADDRESS'),
        INNERPORT: this.configService.get('SERVER_PORT'),
        INNERPORT_SSL: '443',
        EXTIP: this.configService.get('PINNED_SERVER_ADDRESS'),
        EXTPORT: this.configService.get('SERVER_PORT'),
        EXTPORT_SSL: '443',
      },
    };
  }
}
