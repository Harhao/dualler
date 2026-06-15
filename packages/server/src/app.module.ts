import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { AppModule as AppManagementModule } from './app/app.module';
import { PackageModule } from './package/package.module';
import { ReleaseModule } from './release/release.module';
import { DistributionModule } from './distribution/distribution.module';
import { StorageModule } from './storage/storage.module';
import { CdnModule } from './cdn/cdn.module';
import { StatisticsModule } from './statistics/statistics.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    AppManagementModule,
    PackageModule,
    ReleaseModule,
    DistributionModule,
    StorageModule,
    CdnModule,
    StatisticsModule,
  ],
})
export class AppModule {}
