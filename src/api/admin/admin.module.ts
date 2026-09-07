import { AdminCreateAccountModule } from './create-account/create-account.module';
import { AdminCreateRootPathModule } from './create-root-path/create-root-path.module';
import { AdminDeleteAccountModule } from './delete-account/delete-account.module';
import { AdminDeleteRootPathModule } from './delete-root-path/delete-root-path.module';
import { AdminIndexerConfigurationModule } from './indexer-configuration/indexer-configuration.module';
import { AdminListAccountsModule } from './list-accounts/list-accounts.module';
import { AdminListIndexerLogsModule } from './list-indexer-logs/list-indexer-logs.module';
import { AdminListRootPathsModule } from './list-root-paths/list-root-paths.module';
// eslint-disable-next-line max-len
import { AdminRegenerateMasterSessionKeyModule } from './regenerate-master-session-key/regenerate-master-session-key.module';
import { AdminRegenerateUserSessionKeyModule } from './regenerate-user-session-key/regenerate-user-session-key.module';
import { AdminResetUserPasswordModule } from './reset-user-password/reset-user-password.module';
import { AdminSetIndexerStatusModule } from './set-indexer-status/set-indexer-status.module';
import { AdminUpdateRootPathModule } from './update-root-path/update-root-path.module';
import { AdminUpdateUserRolesModule } from './update-user-roles/update-user-roles.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    AdminCreateAccountModule,
    AdminCreateRootPathModule,
    AdminDeleteAccountModule,
    AdminDeleteRootPathModule,
    AdminIndexerConfigurationModule,
    AdminListAccountsModule,
    AdminListIndexerLogsModule,
    AdminListRootPathsModule,
    AdminSetIndexerStatusModule,
    AdminUpdateRootPathModule,
    AdminUpdateUserRolesModule,
    AdminResetUserPasswordModule,
    AdminRegenerateUserSessionKeyModule,
    AdminRegenerateMasterSessionKeyModule,
  ],
})
export class AdminModule {}
