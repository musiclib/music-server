import { LibraryModule } from 'src/library/library.module';
import { Module } from '@nestjs/common';
import { QnapAsLoginApiController } from './as-login-api.controller';
import { QnapAsLoginApiService } from './as-login-api.service';
import { QnapAuthLoginController } from './auth-login.controller';
import { QnapAuthLoginService } from './auth-login.service';
import { QnapMediaCoverApiController } from './mediacover-api.controller';
import { QnapMediaCoverApiService } from './mediacover-api.service';
import { QnapMediaListApiController } from './medialist-api.controller';
import { QnapMediaListApiService } from './medialist-api.service';
import { QnapMediaToolApiController } from './mediatool-api.controller';
import { QnapMediaToolApiService } from './mediatool-api.service';
import { SequelizeModule } from '@nestjs/sequelize/dist/sequelize.module';
import { entitiesList } from 'src/database/entities';

@Module({
  imports: [LibraryModule, SequelizeModule.forFeature(entitiesList)],
  controllers: [
    QnapAuthLoginController,
    QnapAsLoginApiController,
    QnapMediaCoverApiController,
    QnapMediaToolApiController,
    QnapMediaListApiController,
  ],
  providers: [
    QnapAsLoginApiService,
    QnapAuthLoginService,
    QnapMediaCoverApiService,
    QnapMediaListApiService,
    QnapMediaToolApiService,
  ],
})
export class QnapModule {}
