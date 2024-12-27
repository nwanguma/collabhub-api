import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Profile } from '../profiles/entities/profile.entity';
import { Not, Repository } from 'typeorm';
import { Project } from '../projects/entities/project.entity';
import { User } from '../users/entities/user.entity';
import { Skill } from '../skills/entities/skill.entity';

@Injectable()
export class RecommendationsService {
  private readonly logger = new Logger(RecommendationsService.name);

  constructor(
    @InjectRepository(Profile)
    private readonly profilesRepository: Repository<Profile>,
    @InjectRepository(Project)
    private readonly projectsRepository: Repository<Project>,
  ) {}

  async getRecommendations(user: User) {
    const results = await Promise.all([
      this.handleProfileRecommendations(user),
      this.handleProjectRecommendations(user),
    ]);

    return {
      profiles: results[0].profileRecommendations,
      profilesToFollow: results[0].profilesToFollow,
      projects: results[1],
    };
  }

  async handleProfileRecommendations(currentUser: User) {
    const { profile: userProfile } = currentUser;

    const profiles = await this.profilesRepository.find({
      where: { uuid: Not(userProfile.uuid) },
      relations: ['skills', 'profile_comments', 'profile_reactions'],
    });

    const profileRecommendations = profiles
      .filter((profile) => profile.title)
      .map((profile) => {
        let score = 0;

        const skillMatches = profile.skills.filter((skill: Skill) =>
          userProfile.skills.map((skill) => skill.title).includes(skill.title),
        ).length;
        score += skillMatches * 5;

        if (profile.location === userProfile.location) {
          score += 3;
        }

        const activityScore = Math.min(profile.views as number, 100) / 10;
        score += activityScore;

        return { profile, score };
      })
      .sort((a, b) => b.score - a.score)
      .map((result) => result.profile);

    const profilesToFollow = profiles
      .filter((profile) => {
        const hasFollowed = userProfile.following
          .map((following: any) => following.user?.uuid)
          .includes(profile.uuid);

        return profile.title && !hasFollowed;
      })
      .map((profile) => {
        let score = 0;

        const skillMatches = profile.skills.filter((skill: Skill) =>
          userProfile.skills.map((skill) => skill.title).includes(skill.title),
        ).length;
        score += skillMatches * 5;

        if (profile.location === userProfile.location) {
          score += 3;
        }

        const activityScore = Math.min(profile.views as number, 100) / 10;
        score += activityScore;

        return { profile, score };
      })
      .sort((a, b) => b.score - a.score)
      .map((result) => result.profile);

    return {
      profileRecommendations: [...profileRecommendations].splice(0, 7),
      profilesToFollow: [...profilesToFollow].splice(0, 7),
    };
  }

  async handleProjectRecommendations(currentUser: User) {
    const { profile: userProfile } = currentUser;

    const projects = await this.projectsRepository.find({
      where: { owner: { uuid: Not(userProfile.uuid) } },
      relations: ['skills', 'comments', 'reactions'],
    });

    const projectRecommendations = projects
      .map((project) => {
        let score = 0;

        const skillMatches = project.description
          .split(' ')
          .filter((word) =>
            userProfile.skills
              .map((skill: Skill) => skill.title)
              .includes(word),
          ).length;
        score += skillMatches * 5;

        if (project.location === userProfile.location) {
          score += 3;
        }

        //Todo: more work on this
        // const similarCollaborations = project.collaborators.filter(
        //   (collaborator) =>
        //     currentUser.collaborators.some(
        //       (currentCollaborator) => currentCollaborator.id === collaborator.id
        //     )
        // ).length;
        // score += similarCollaborations * 4;

        const recentUpdate =
          (new Date(project.updated_at).getTime() - Date.now()) /
          (1000 * 3600 * 24);
        if (recentUpdate < 30) {
          score += 2;
        }

        const popularityScore =
          Math.min(project?.collaborators?.length || 0, 50) / 5;
        score += popularityScore;

        return { project, score };
      })
      .sort((a, b) => b.score - a.score)
      .map((result) => result.project);

    return [...projectRecommendations].splice(0, 5);
  }
}
