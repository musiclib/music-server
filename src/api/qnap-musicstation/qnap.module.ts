import { LibraryModule } from 'src/library/library.module';
import { Module } from '@nestjs/common';
import { QnapAsGetFileController } from './as-get-file.controller';
import { QnapAsGetFileService } from './as-get-file.service';
import { QnapAsLocalPlaybackController } from './as-localplayback.controller';
import { QnapAsLocalPlaybackService } from './as-localplayback.service';
import { QnapAsLoginController } from './as-login.controller';
import { QnapAsLoginService } from './as-login.service';
import { QnapAuthLoginController } from './auth-login.controller';
import { QnapAuthLoginService } from './auth-login.service';
import { QnapMediaCoverController } from './mediacover.controller';
import { QnapMediaCoverService } from './mediacover.service';
import { QnapMediaListController } from './medialist.controller';
import { QnapMediaListService } from './medialist.service';
import { QnapMediaToolController } from './mediatool.controller';
import { QnapMediaToolService } from './mediatool.service';
import { SequelizeModule } from '@nestjs/sequelize/dist/sequelize.module';
import { entitiesList } from 'src/database/entities';

@Module({
  imports: [LibraryModule, SequelizeModule.forFeature(entitiesList)],
  controllers: [
    QnapAsGetFileController,
    QnapAsLocalPlaybackController,
    QnapAsLoginController,
    QnapAuthLoginController,
    QnapMediaCoverController,
    QnapMediaListController,
    QnapMediaToolController,
  ],
  providers: [
    QnapAsGetFileService,
    QnapAsLocalPlaybackService,
    QnapAsLoginService,
    QnapAuthLoginService,
    QnapMediaCoverService,
    QnapMediaListService,
    QnapMediaToolService,
  ],
})
export class QnapModule {}
