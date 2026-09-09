import { LibraryModule } from 'src/library/library.module';
import { Module } from '@nestjs/common';
import { QnapAsGetFileController } from './as-get-file.controller';
import { QnapAsGetFileService } from './as-get-file.service';
import { QnapAsLocalPlaybackApiController } from './as-localplayback.controller';
import { QnapAsLocalPlaybackApiService } from './as-localplayback.service';
import { QnapAsLoginApiController } from './as-login.controller';
import { QnapAsLoginApiService } from './as-login.service';
import { QnapAuthLoginController } from './auth-login.controller';
import { QnapAuthLoginService } from './auth-login.service';
import { QnapMediaCoverApiController } from './mediacover.controller';
import { QnapMediaCoverApiService } from './mediacover.service';
import { QnapMediaListApiController } from './medialist.controller';
import { QnapMediaListApiService } from './medialist.service';
import { QnapMediaToolApiController } from './mediatool.controller';
import { QnapMediaToolApiService } from './mediatool.service';
import { SequelizeModule } from '@nestjs/sequelize/dist/sequelize.module';
import { entitiesList } from 'src/database/entities';

@Module({
  imports: [LibraryModule, SequelizeModule.forFeature(entitiesList)],
  controllers: [
    QnapAsGetFileController,
    QnapAsLocalPlaybackApiController,
    QnapAsLoginApiController,
    QnapAuthLoginController,
    QnapMediaCoverApiController,
    QnapMediaListApiController,
    QnapMediaToolApiController,
  ],
  providers: [
    QnapAsGetFileService,
    QnapAsLocalPlaybackApiService,
    QnapAsLoginApiService,
    QnapAuthLoginService,
    QnapMediaCoverApiService,
    QnapMediaListApiService,
    QnapMediaToolApiService,
  ],
})
export class QnapModule {}
