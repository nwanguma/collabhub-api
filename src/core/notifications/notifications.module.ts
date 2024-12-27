import { Module } from '@nestjs/common';

import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './notifications.entity';
import { MailjetModule } from '../../integrations/mailjet/mailjet.module';
import { CacheServiceModule } from '../../utilities/caching/cache.module';
import { User } from '../users/entities/user.entity';
import { PusherModule } from '../../integrations/pusher/pusher.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, User]),
    MailjetModule,
    CacheServiceModule,
    PusherModule,
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
