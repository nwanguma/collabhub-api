import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Reaction } from './entities/reaction.entity';
import { Profile } from '../profiles/entities/profile.entity';
import { Project } from '../projects/entities/project.entity';
import { CreateReactionDto } from './dtos/create-reaction.dto';
import {
  NotificationCategories,
  NotificationTypes,
} from '../notifications/notifications.constant';
import { ResourceTypes } from '../../common/constants/index.constants';
import { User } from '../users/entities/user.entity';
import { NotificationsService } from './../notifications/notifications.service';

@Injectable()
export class ReactionsService {
  private readonly logger = new Logger(ReactionsService.name);

  constructor(
    @InjectRepository(Reaction)
    private readonly reactionsRepository: Repository<Reaction>,
    @InjectRepository(Profile)
    private readonly notificationsService: NotificationsService,
  ) {}

  async handleReaction(
    user: User,
    resource: Profile | Project,
    resourceType: ResourceTypes,
    createReactionDto: CreateReactionDto,
  ) {
    if (!resource)
      throw new BadRequestException(
        'One of profile or project must be provided',
      );

    const reaction = await this.reactionsRepository.findOne({
      where: {
        [resourceType]: { uuid: resource['uuid'] },
        owner: { uuid: user.profile.uuid },
      },
      relations: ['owner', 'profile'],
    });

    if (reaction) {
      const result = await this.reactionsRepository.remove(reaction);

      return { data: result, status: 'removed' };
    }

    const newReaction = this.reactionsRepository.create({
      type: createReactionDto.type,
    });

    newReaction[resourceType] = resource;
    newReaction.owner = user.profile;

    const savedReaction = await this.reactionsRepository.save(newReaction);

    if (
      (resourceType === ResourceTypes.PROFILE &&
        user.profile.uuid !== resource.uuid) ||
      (resourceType !== ResourceTypes.PROFILE &&
        user.profile.uuid !== (resource as Project).owner.uuid)
    ) {
      try {
        this.notificationsService.createAndSendNotification(
          user,
          {
            resource_type: resourceType,
            category: NotificationCategories.REACTION,
            type: [NotificationTypes.PUSH],
          },
          resource,
        );
      } catch (e) {
        this.logger.error('An error occurred creating notification');
      }
    }

    return { data: savedReaction };
  }
}
