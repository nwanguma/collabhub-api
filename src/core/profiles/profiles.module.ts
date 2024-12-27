import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Profile } from './entities/profile.entity';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';
import { SkillsModule } from '../skills/skills.module';
import { ProjectsModule } from '../projects/projects.module';
import { CommentsModule } from '../comments/comments.module';
import { ReactionsModule } from '../reactions/reactions.module';
import { ActivitiesModule } from '../activities/activities.module';
import { Follower } from '../followers/entities/follower.entity';
import { NotificationsModule } from '../notifications/notifications.module';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Profile, Follower, User]),
    SkillsModule,
    ProjectsModule,
    CommentsModule,
    ReactionsModule,
    ActivitiesModule,
    NotificationsModule,
  ],
  controllers: [ProfilesController],
  providers: [ProfilesService],
  exports: [ProfilesService],
})
export class ProfilesModule {}
