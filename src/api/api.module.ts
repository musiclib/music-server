import { AdminModule } from './admin/admin.module';
import { GuestModule } from './guest/guest.module';
import { Module } from '@nestjs/common';
import { QnapModule } from './qnap-musicstation/qnap.module';
import { SynologyModule } from './synology-audiostation/synology.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    GuestModule,
    UserModule,
    AdminModule,
    ...(process.env.QNAP_MUSICSTATION_ENABLED ? [QnapModule] : []),
    ...(process.env.SYNOLOGY_AUDIOSTATION_ENABLED ? [SynologyModule] : []),
  ],
})
export class ApiModule {}
