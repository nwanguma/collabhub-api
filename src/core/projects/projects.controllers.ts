import {
  Body,
  Controller,
  Param,
  Post,
  Get,
  Put,
  UseGuards,
  UseInterceptors,
  Delete,
  Query,
} from '@nestjs/common';

import { CreateOrUpdateProjectDto } from './dtos/create-update-project.dto';
import { ProjectsService } from './projects.service';
import { GetCurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { CustomSerializerInterceptor } from '../../common/interceptors/transform.interceptor';
import { ProjectDto, PaginatedLimitedProjectDto } from './dtos/project.dto';
import { Profile } from '../profiles/entities/profile.entity';
import { User } from '../users/entities/user.entity';
import { CreateCommentDto } from '../comments/dtos/create-comment.dto';
import { CreateReactionDto } from '../reactions/dtos/create-reaction.dto';
import { ProjectStatus } from './projects.constants';
import { CreateOrUpdateFeedbackDto } from '../feedback/dtos/create-update-feedback.dto';
import { FeedbackDto } from '../feedback/dtos/feedback.dto';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new CustomSerializerInterceptor(PaginatedLimitedProjectDto))
  async getProjects(
    @GetCurrentUser('profile') profile: Profile,
    @Query('limit') limit: number,
    @Query('page') page: number,
    @Query('contentType') contentType: 'all' | 'following',
    @Query('skills') skills?: string[],
    @Query('location') location?: string,
    @Query('status') status?: ProjectStatus,
    @Query('keyword') keyword?: string,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
    @Query('orderBy') orderBy?: 'ASC' | 'DESC',
    @Query('sortBy') sortBy?: string,
  ) {
    return await this.projectsService.getProjects(
      page,
      limit,
      contentType,
      profile,
      skills,
      location,
      status,
      keyword,
      startDate,
      endDate,
      orderBy,
      sortBy,
    );
  }

  @Get('me/:id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new CustomSerializerInterceptor(ProjectDto))
  async getOneUserProject(
    @GetCurrentUser('profile') profile: Profile,
    @Param('id') id: string,
  ) {
    return await this.projectsService.getCurrentUserProject(id, profile.uuid);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new CustomSerializerInterceptor(ProjectDto))
  async getOneProject(
    @GetCurrentUser('profile') profile: Profile,
    @Param('id') id: string,
  ) {
    return await this.projectsService.getOneProject(profile.uuid, id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new CustomSerializerInterceptor(ProjectDto))
  async createProject(
    @GetCurrentUser('profile') profile: Profile,
    @Body() body: CreateOrUpdateProjectDto,
  ) {
    return await this.projectsService.createProject(body, profile);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new CustomSerializerInterceptor(ProjectDto))
  async updateProject(
    @GetCurrentUser() { profile }: User,
    @Param('id') id: string,
    @Body() body: CreateOrUpdateProjectDto,
  ) {
    return await this.projectsService.udpateProject(id, body, profile);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteProject(
    @GetCurrentUser('profile') profile: Profile,
    @Param('id') projectId: string,
  ) {
    return await this.projectsService.deleteProject(projectId, profile.uuid);
  }

  @Post(':projectId/comments')
  @UseGuards(JwtAuthGuard)
  async addComment(
    @GetCurrentUser() user: User,
    @Param('projectId')
    projectId: string,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return await this.projectsService.addComment(
      user,
      projectId,
      createCommentDto,
    );
  }

  @Delete(':projectId/:commentId/comments')
  @UseGuards(JwtAuthGuard)
  async deleteComment(
    @GetCurrentUser('profile') profile: Profile,
    @Param('commentId') commentId: string,
  ) {
    return await this.projectsService.deleteComment(commentId, profile.uuid);
  }

  @Post(':projectId/reactions')
  @UseGuards(JwtAuthGuard)
  async addOrRemoveReaction(
    @GetCurrentUser() user: User,
    @Param('projectId')
    projectId: string,
    @Body() createReactionDto: CreateReactionDto,
  ) {
    return await this.projectsService.addOrRemoveReaction(
      user,
      projectId,
      createReactionDto,
    );
  }

  @Post(':projectId/feedbacks')
  @UseInterceptors(new CustomSerializerInterceptor(FeedbackDto))
  @UseGuards(JwtAuthGuard)
  async addFeedback(
    @GetCurrentUser() user: User,
    @Param('projectId')
    projectId: string,
    @Body() createFeedbackDto: CreateOrUpdateFeedbackDto,
  ) {
    return await this.projectsService.addFeedback(
      user,
      projectId,
      createFeedbackDto,
    );
  }

  @Put(':projectId/:feedbackId/feedbacks')
  @UseGuards(JwtAuthGuard)
  async updateFeedback(
    @GetCurrentUser('profile') profile: Profile,
    @Param('projectId') projectId: string,
    @Param('feedbackId') feedbackId: string,
    @Body() updateFeedbackDto: CreateOrUpdateFeedbackDto,
  ) {
    return await this.projectsService.updateFeedback(
      projectId,
      feedbackId,
      profile.uuid,
      updateFeedbackDto,
    );
  }

  @Delete(':projectId/:feedbackId/feedbacks')
  @UseGuards(JwtAuthGuard)
  async deleteFeedback(
    @GetCurrentUser('profile') profile: Profile,
    @Param('feedbackId') feedbackId: string,
  ) {
    return await this.projectsService.deleteFeedback(feedbackId, profile.uuid);
  }
}
