import { Controller, Get, UseGuards, UseInterceptors } from '@nestjs/common';

import { ActivitiesService } from './activities.service';
import { GetCurrentUser } from '../../common/decorators/current-user.decorator';
import { CustomSerializerInterceptor } from '../../common/interceptors/transform.interceptor';
import { ActivityDto } from './dtos/activity.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { Profile } from '../profiles/entities/profile.entity';

@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new CustomSerializerInterceptor(ActivityDto))
  async getUserActivities(@GetCurrentUser('profile') profile: Profile) {
    return await this.activitiesService.getUserActivities(profile.uuid);
  }
}
