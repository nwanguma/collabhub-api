import { DataSource, QueryRunner } from 'typeorm';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';

import { User } from './core/users/entities/user.entity';
import { Profile } from './core/profiles/entities/profile.entity';
import { Project } from './core/projects/entities/project.entity';
import { Reaction } from './core/reactions/entities/reaction.entity';
import { Comment } from './core/comments/entities/comment.entity';
import { UserStatus } from './core/users/users.constants';
import { ProjectStatus } from './core/projects/projects.constants';
import { ReactionType } from './core/reactions/reaction.constants';
import { Location } from './core/locations/entities/location.entity';
import { Skill } from './core/skills/entities/skill.entity';
import { AppDataSource } from 'data-source';
import { SkillType } from './core/skills/skills.constants';

const softwareSkills = [
  'JavaScript',
  'TypeScript',
  'Python',
  'Java',
  'C#',
  'C++',
  'Ruby',
  'Go',
  'Kotlin',
  'Swift',
  'PHP',
  'SQL',
  'NoSQL',
  'HTML',
  'CSS',
  'React',
  'Angular',
  'Vue.js',
  'Node.js',
  'Django',
  'Spring Boot',
  'Flask',
  'Ruby on Rails',
  'Docker',
  'Kubernetes',
  'AWS',
  'Azure',
  'GCP',
  'Machine Learning',
  'Data Analysis',
  'Cybersecurity',
  'CI/CD',
  'Agile Methodologies',
];

function generateUniqueSkills(count: number): any[] {
  const shuffledSkills = faker.helpers.shuffle(softwareSkills);
  return shuffledSkills.slice(0, count);
}

async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash(password, salt);

  return hashedPassword;
}

async function seedDatabase() {
  const dataSource: DataSource = await AppDataSource.initialize();
  const queryRunner: QueryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();

  try {
    await queryRunner.startTransaction();

    const users: User[] = [];
    const profiles: Profile[] = [];

    for (let i = 0; i < 10; i++) {
      const user = new User();
      user.email = faker.internet.email();
      user.password = await hashPassword(faker.internet.password());
      user.status = UserStatus.ACTIVE;

      users.push(user);
      await queryRunner.manager.save(user);

      const profile = new Profile();
      profile.user = user;
      profile.user_uuid = user.uuid;
      profile.first_name = faker.person.firstName();
      profile.last_name = faker.person.lastName();
      profile.email = user.email;
      profile.avatar = faker.image.avatar();
      profile.bio = faker.lorem.paragraph();
      profile.title = faker.person.jobTitle();
      profile.location = faker.location.city();
      profile.github = faker.internet.url();
      profile.website = faker.internet.url();
      profile.updated_at = new Date();
      profile.skills = generateUniqueSkills(5);

      profiles.push(profile);
      await queryRunner.manager.save(profile);
    }

    const projects: Project[] = [];
    const reactions: Reaction[] = [];
    const comments: Comment[] = [];

    for (let i = 0; i < 5; i++) {
      const ownerProfile =
        profiles[Math.floor(Math.random() * profiles.length)];

      const project = new Project();
      project.title = faker.commerce.productName();
      project.description = faker.lorem.paragraphs(2);
      project.owner = ownerProfile;
      project.location = faker.location.city();
      project.website = faker.internet.url();
      project.github_url = faker.internet.url();
      project.status = ProjectStatus.IN_PROGRESS;
      project.collaborators = Array.from(
        new Set(
          Array.from(
            { length: 2 },
            () => profiles[Math.floor(Math.random() * profiles.length)],
          ),
        ),
      ).filter((profile) => profile.uuid !== project.owner.user_uuid);

      projects.push(project);
      await queryRunner.manager.save(project);

      for (let j = 0; j < 3; j++) {
        const reaction = new Reaction();
        reaction.owner = profiles[Math.floor(Math.random() * profiles.length)];
        reaction.project = project;
        reaction.type = ReactionType.LIKE;

        reactions.push(reaction);
        await queryRunner.manager.save(reaction);
      }

      for (let j = 0; j < 3; j++) {
        const comment = new Comment();
        comment.text = faker.lorem.sentence();
        comment.owner = profiles[Math.floor(Math.random() * profiles.length)];
        comment.project = project;

        comments.push(comment);
        await queryRunner.manager.save(comment);
      }

      const locations: Location[] = Array.from({ length: 100 }, () => {
        const location = new Location();
        location.city = faker.location.city();
        location.country = faker.location.country();

        return location;
      });

      await queryRunner.manager.save(locations);

      const skills: Skill[] = softwareSkills.map((title) => {
        const skill = new Skill();
        skill.title = title;
        skill.type = SkillType.PROFILE;

        return skill;
      });

      await queryRunner.manager.save(skills);
    }

    await queryRunner.commitTransaction();
    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    await queryRunner.rollbackTransaction();
  } finally {
    await queryRunner.release();
    await dataSource.destroy();
  }
}

seedDatabase();
