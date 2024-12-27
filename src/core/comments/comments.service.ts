import {
  NotFoundException,
  Injectable,
  BadRequestException,
  UnprocessableEntityException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateCommentDto } from './dtos/create-comment.dto';
import { Comment } from './entities/comment.entity';
import { Profile } from '../profiles/entities/profile.entity';
import { Project } from '../projects/entities/project.entity';
import { User } from '../users/entities/user.entity';
import { ResourceTypes } from '../../common/constants/index.constants';
import { NotificationCategories } from '../notifications/notifications.constant';
import { NotificationTypes } from '../notifications/notifications.constant';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class CommentsService {
  private readonly logger = new Logger(CommentsService.name);

  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async createComment(
    user: User,
    resource: Profile | Project,
    resourceType: ResourceTypes,
    createCommentDto: CreateCommentDto,
  ) {
    if (!resource)
      throw new BadRequestException(
        'One of project or profile must be provided',
      );

    const comment = this.commentsRepository.create(createCommentDto);
    comment[resourceType] = resource;
    comment.owner = user.profile;

    const savedComment = await this.commentsRepository.save(comment);

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
            category: NotificationCategories.COMMENT,
            type: [NotificationTypes.PUSH],
            content: savedComment.text,
          },
          resource,
        );
      } catch (e) {
        this.logger.error('An error occurred creating notification');
      }
    }

    return savedComment;
  }

  async deleteComment(commentId: string, profileId: string) {
    const comment = await this.commentsRepository.findOne({
      where: {
        uuid: commentId,
      },
      relations: ['owner', 'profile'],
    });

    if (!comment) throw new NotFoundException('Comment not found');

    if (profileId !== comment.owner.uuid && profileId !== comment.profile.uuid)
      throw new UnprocessableEntityException(
        'You are not allowed to delete this comment',
      );

    return await this.commentsRepository.remove(comment);
  }
}
