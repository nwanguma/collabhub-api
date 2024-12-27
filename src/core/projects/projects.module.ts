import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Project } from './entities/project.entity';
import { ProjectsController } from './projects.controllers';
import { ProjectsService } from './projects.service';
import { SkillsModule } from '../skills/skills.module';
import { Profile } from '../profiles/entities/profile.entity';
import { UsersModule } from '../users/users.module';
import { CommentsModule } from '../comments/comments.module';
import { ReactionsModule } from '../reactions/reactions.module';
import { ActivitiesModule } from '../activities/activities.module';
import { FeedbacksModule } from '../feedback/feedbacks.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Project, Profile]),
    UsersModule,
    SkillsModule,
    CommentsModule,
    ReactionsModule,
    ActivitiesModule,
    FeedbacksModule,
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
