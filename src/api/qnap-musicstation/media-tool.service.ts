import { ConfigService } from 'src/config/config.service';
import { Injectable } from '@nestjs/common';
import { QnapMediaToolDto } from './dtos/media-tool.dto';

@Injectable()
export class QnapMediaToolService {
  constructor(private readonly configService: ConfigService) {}

  getIpList(): QnapMediaToolDto {
    return {
      LANIP: this.configService.get('LAN_SERVER_ADDRESS') || this.configService.get('SERVER_ADDRESS') || 'localhost',
      LANIP_LIST:
        this.configService.get('LAN_SERVER_ADDRESS') || this.configService.get('SERVER_ADDRESS') || 'localhost',
      INNERPORT: this.configService.get('LAN_SERVER_PORT') || this.configService.get('SERVER_PORT') || 8080,
      // INNERPORT_SSL: '443',
      EXTIP:
        this.configService.get('WAN_SERVER_ADDRESS') ||
        this.configService.get('LAN_SERVER_ADDRESS') ||
        this.configService.get('SERVER_ADDRESS'),
      EXTPORT:
        this.configService.get('WAN_SERVER_PORT') ||
        this.configService.get('LAN_SERVER_PORT') ||
        this.configService.get('SERVER_PORT') ||
        8080,
      // EXTPORT_SSL: '443',
    };
  }
}
