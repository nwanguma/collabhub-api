import { CreateOrUpdateFeedbackDto } from '../feedback/dtos/create-update-feedback.dto';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Brackets } from 'typeorm';

import { Project } from './entities/project.entity';
import { CreateOrUpdateProjectDto } from './dtos/create-update-project.dto';
import { Profile } from '../profiles/entities/profile.entity';
import { SkillsService } from './../skills/skills.service';
import { SkillType } from '../skills/skills.constants';
import { ResourceTypes } from '../../common/constants/index.constants';
import { ReactionsService } from '../reactions/reactions.service';
import { CommentsService } from '../comments/comments.service';
import { CreateCommentDto } from '../comments/dtos/create-comment.dto';
import { CreateReactionDto } from '../reactions/dtos/create-reaction.dto';
import { User } from '../users/entities/user.entity';
import { Reaction } from '../reactions/entities/reaction.entity';
import { ProjectStatus } from './projects.constants';
import { FeedbacksService } from '../feedback/feedbacks.service';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectsRepository: Repository<Project>,
    @InjectRepository(Profile)
    private readonly profilesRepository: Repository<Profile>,
    private readonly skillsService: SkillsService,
    private readonly commentsService: CommentsService,
    private readonly reactionsService: ReactionsService,
    private readonly feedbacksService: FeedbacksService,
  ) {}

  async getProjects(
    page: number = 1,
    limit: number = 10,
    contentType: 'following' | 'all' | 'user' = 'following',
    profile: Profile,
    skills?: string[],
    location?: string,
    status?: ProjectStatus,
    keyword?: string,
    startDate?: Date,
    endDate?: Date,
    orderBy: 'ASC' | 'DESC' = 'DESC',
    sortBy: string = 'start_date',
  ) {
    const followingUuids =
      profile.following?.map((follow) => follow.user.uuid) || [];

    const queryBuilder = this.projectsRepository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.collaborators', 'collaborators')
      .leftJoinAndSelect('project.comments', 'comments')
      .leftJoinAndSelect('project.owner', 'owner')
      .leftJoinAndSelect('project.reactions', 'reactions')
      .leftJoinAndSelect('project.skills', 'skills')
      .leftJoinAndSelect('project.feedbacks', 'feedbacks');

    if (contentType === 'following' && followingUuids.length > 0) {
      queryBuilder.andWhere('owner.uuid IN (:...followingUuids)', {
        followingUuids,
      });
    } else if (contentType === 'following' && followingUuids.length === 0) {
      return {
        data: [],
        total: 0,
        page,
        totalPages: 0,
        perPage: limit,
      };
    } else if (contentType === 'user') {
      queryBuilder.andWhere('owner.uuid = :uuid', { uuid: profile.uuid });
    }

    if (skills && skills.length > 0) {
      queryBuilder.andWhere((qb) => {
        const subQuery = qb
          .subQuery()
          .select('skillProject.project_id')
          .from('projects_skills', 'skillProject')
          .innerJoin('skills', 's', 'skillProject.skill_id = s.id')
          .where('s.title IN (:...skills)', {
            skills: skills.map((s) => s.toLowerCase()),
          })
          .groupBy('skillProject.project_id')
          .having('COUNT(skillProject.skill_id) >= :skillCount', {
            skillCount: skills.length,
          })
          .getQuery();
        return `project.id IN (${subQuery})`;
      });
    }

    if (location) {
      queryBuilder.andWhere('project.location LIKE :location', {
        location: `%${location}%`,
      });
    }

    if (status) {
      queryBuilder.andWhere('project.status = :status', { status });
    }

    if (keyword) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where('project.title LIKE :keyword', {
            keyword: `%${keyword}%`,
          }).orWhere('project.description LIKE :keyword', {
            keyword: `%${keyword}%`,
          });
        }),
      );
    }

    if (startDate && endDate) {
      queryBuilder.andWhere(
        'project.start_date BETWEEN :startDate AND :endDate',
        {
          startDate,
          endDate,
        },
      );
    } else if (startDate) {
      queryBuilder.andWhere('project.start_date >= :startDate', { startDate });
    } else if (endDate) {
      queryBuilder.andWhere('project.start_date <= :endDate', { endDate });
    }

    queryBuilder.orderBy(
      `project.${sortBy || 'start_date'}`,
      orderBy || 'DESC',
    );
    queryBuilder.skip((page - 1) * limit).take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      perPage: limit,
    };
  }

  async getOneProject(profileId: string, id: string) {
    const project = await this.projectsRepository.findOne({
      where: { uuid: id },
      relations: [
        'collaborators',
        'owner',
        'comments',
        'reactions',
        'skills',
        'feedbacks',
      ],
    });

    if (!project) throw new NotFoundException('Project not found');

    profileId !== project.owner?.uuid && this.updateProjectViews(id);

    return project;
  }

  async getCurrentUserProject(id: string, profileId: string) {
    const project = await this.projectsRepository.findOne({
      where: { uuid: id, owner: { uuid: profileId } },
      relations: [
        'collaborators',
        'owner',
        'comments',
        'reactions',
        'skills',
        'feedbacks',
      ],
    });

    if (!project) throw new NotFoundException('Project not found');

    profileId !== project.owner?.uuid && this.updateProjectViews(id);

    return project;
  }

  async updateProjectViews(projectId: string) {
    const project = await this.projectsRepository.findOne({
      where: { uuid: projectId },
    });

    if (!project) throw new NotFoundException('Project does not exist');
    Object.assign(project, { ...project, views: ++project.views });

    return await this.projectsRepository.save(project);
  }

  async createProject(projectDto: CreateOrUpdateProjectDto, profile: Profile) {
    const project = await this.findOrCreateProject({ projectDto, profile });

    return project;
  }

  async udpateProject(
    projectId: string,
    projectDto: CreateOrUpdateProjectDto,
    profile: Profile,
  ) {
    const project = await this.findOrCreateProject({
      projectDto,
      profile,
      projectId,
    });

    return project;
  }

  async findOrCreateProject({
    projectId,
    profile,
    projectDto,
  }: {
    projectDto: CreateOrUpdateProjectDto;
    profile: Profile;
    projectId?: string;
  }) {
    let collaborators = [];
    let project;

    if (projectId) {
      project = await this.projectsRepository.findOne({
        where: { uuid: projectId, owner: { uuid: profile.uuid } },
        relations: ['owner'],
      });

      if (!project) throw new BadRequestException('Project does not exist');
      if (project.owner.uuid !== profile.uuid)
        throw new ForbiddenException(
          'You are not allowed to update this project',
        );
    }

    if (projectDto.collaborators?.length) {
      collaborators = await this.profilesRepository.find({
        where: {
          email: In(projectDto.collaborators),
        },
      });
    }

    if (!project) {
      project = this.projectsRepository.create({
        title: projectDto.title,
        description: projectDto.description,
        website: projectDto.website,
        owner: profile,
        github_url: projectDto.github_url,
        start_date: projectDto.start_date,
        status: projectDto.status,
        location: projectDto.location,
        requires_feedback: projectDto.requires_feedback,
        feedback_guide: projectDto.feedback_guide,
        attachment: projectDto.attachment,
        collaborators,
        views: 0,
      });

      if (projectDto.skills?.length) {
        project.skills = [];

        for await (const skill of projectDto.skills) {
          if (skill.title) {
            const savedSkill = await this.skillsService.findOrCreateSkill(
              skill,
              profile,
              SkillType.PROJECT,
            );

            project.skills.push(savedSkill);
          }
        }
      }

      project = await this.projectsRepository.save(project);
    } else {
      Object.assign(project, { ...projectDto, owner: profile });

      if (projectDto.skills?.length) {
        project.skills = [];
        for await (const skill of projectDto.skills) {
          if (skill.title) {
            const savedSkill = await this.skillsService.findOrCreateSkill(
              skill,
              profile,
              SkillType.PROJECT,
            );

            project.skills.push(savedSkill);
          }
        }
      }

      for await (const collaborator of collaborators) {
        if (!project.collaborators.some((c) => c.id === collaborator.id)) {
          project.collaborators.push(collaborator);
        }
      }

      await this.projectsRepository.save(project);
    }

    return project;
  }

  async deleteProject(projectId: string, profileId: string) {
    const project = await this.projectsRepository.findOne({
      where: { uuid: projectId },
      relations: ['owner'],
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.owner.uuid !== profileId) {
      throw new ForbiddenException(
        'You are not allowed to delete this project',
      );
    }

    return await this.projectsRepository.remove(project);
  }

  async addComment(
    user: User,
    projectId: string,
    createCommentDto: CreateCommentDto,
  ) {
    const project = await this.projectsRepository.findOne({
      where: { uuid: projectId },
      relations: ['owner'],
    });

    if (!project) throw new NotFoundException('Project does not exist');

    const comment = await this.commentsService.createComment(
      user,
      project,
      ResourceTypes.PROJECT,
      createCommentDto,
    );

    // const activityData = { type: ActivityTypes.COMMENT };
    // this.activitiesService.createActivity(
    //   user.profile,
    //   project,
    //   ResourceTypes.PROJECT,
    //   activityData,
    // );

    return comment;
  }

  async deleteComment(commentId: string, profileId: string) {
    return await this.commentsService.deleteComment(commentId, profileId);
  }

  async addOrRemoveReaction(
    user: User,
    projectId: string,
    createReactionDto: CreateReactionDto,
  ) {
    const project = await this.projectsRepository.findOne({
      where: { uuid: projectId },
      relations: ['owner'],
    });

    if (!project) throw new NotFoundException('Project does not exist');

    const result = await this.reactionsService.handleReaction(
      user,
      project,
      ResourceTypes.PROJECT,
      createReactionDto,
    );

    // if (result.status) {
    //   const activityData = { type: ActivityTypes.LIKE };
    //   this.activitiesService.createActivity(
    //     user.profile,
    //     project,
    //     ResourceTypes.PROJECT,
    //     activityData,
    //   );
    // }

    return result.data as Reaction;
  }

  async addFeedback(
    user: User,
    projectId: string,
    createFeedbackDto: CreateOrUpdateFeedbackDto,
  ) {
    const feedbackOwnerProfileId = user.profile.uuid;
    const project = await this.projectsRepository.findOne({
      where: { uuid: projectId },
      relations: ['owner'],
    });

    if (!project) throw new NotFoundException('Project does not exist');

    const feedback = await this.feedbacksService.createFeedback(
      user,
      project,
      ResourceTypes.PROJECT,
      feedbackOwnerProfileId,
      project.feedback_guide,
      createFeedbackDto,
    );

    return feedback;
  }

  async updateFeedback(
    projectId: string,
    feedbackId: string,
    profileId: string,
    updateFeedbackDto: CreateOrUpdateFeedbackDto,
  ) {
    const project = await this.projectsRepository.findOne({
      where: { uuid: projectId },
    });

    if (!project) throw new NotFoundException('Project does not exist');

    const feedback = await this.feedbacksService.updateFeedback(
      profileId,
      feedbackId,
      updateFeedbackDto,
    );

    return feedback;
  }

  async deleteFeedback(feedbackId: string, profileId: string) {
    return await this.feedbacksService.deleteFeedback(
      feedbackId,
      'project',
      profileId,
    );
  }
}
