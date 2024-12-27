import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Activity } from './entitites/activity.entity';
import { Profile } from '../profiles/entities/profile.entity';
import { Project } from '../projects/entities/project.entity';
import { CreateActivityDto } from './dtos/create-activity.dto';

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectRepository(Activity)
    private readonly activitiesRepository: Repository<Activity>,
  ) {}

  async createActivity(
    userProfile: Profile,
    resource: Profile | Project,
    resourceType: string,
    createActivityDto: CreateActivityDto,
  ) {
    if (!resource)
      throw new BadRequestException(
        'One of project or profile must be provided',
      );

    const activity = this.activitiesRepository.create(createActivityDto);
    activity[resourceType] = resource;
    activity.owner = userProfile;
    activity.participant =
      resourceType == 'profile'
        ? (resource as Profile)
        : (resource as Project).owner;

    return await this.activitiesRepository.save(activity);
  }

  async getUserActivities(userProfileId: string) {
    return await this.activitiesRepository.find({
      where: { owner: { uuid: userProfileId } },
      relations: ['profile', 'project', 'owner', 'participant'],
    });
  }
}
