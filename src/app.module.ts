import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
// import { LoggerModule } from 'nestjs-pino';
// import { APP_FILTER } from '@nestjs/core';
// import { SentryModule } from '@sentry/nestjs/setup';
// import { SentryGlobalFilter } from '@sentry/nestjs/setup';
import { ThrottlerModule } from '@nestjs/throttler';
import { NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ApiKeyMiddleware } from './common/middleware';

import databaseConfig from './common/config/database.config';
import { UsersModule } from './core/users/users.module';
import { ProfilesModule } from './core/profiles/profiles.module';
import { ProjectsModule } from './core/projects/projects.module';
import { AuthModule } from './core/auth/auth.module';
import redisConfig from './common/config/redis.config';
import { ActivitiesModule } from './core/activities/activities.module';
import { NotificationsModule } from './core/notifications/notifications.module';
import { FileUploadModule } from './utilities/file-uploads/file-uploads.module';
import { MessagesModule } from './core/messages/messages.module';
// import { AppGatewayModule } from './utilities/gateway/gateway.module';
import { ConversationsModule } from './core/conversations/conversations.module';
import { SkillsModule } from './core/skills/skills.module';
import { RecommendationsModule } from './core/recommendations/recommendations.module';
import { LocationsModule } from './core/locations/locations.module';
import { AppDataSource } from './../data-source';

@Module({
  imports: [
    // SentryModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV}`, '.env'],
      load: [databaseConfig, redisConfig],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    TypeOrmModule.forRootAsync({
      useFactory: async () => AppDataSource.options,
    }),
    // LoggerModule.forRoot({
    //   pinoHttp: {
    //     level: 'info',
    //     transport: {
    //       target: 'pino-pretty',
    //       options: {
    //         colorize: true,
    //         translateTime: 'SYS:standard',
    //         ignore: 'pid,hostname',
    //       },
    //     },
    //   },
    // }),
    UsersModule,
    ProjectsModule,
    ProfilesModule,
    AuthModule,
    ActivitiesModule,
    NotificationsModule,
    FileUploadModule,
    MessagesModule,
    ConversationsModule,
    // AppGatewayModule,
    SkillsModule,
    RecommendationsModule,
    LocationsModule,
  ],
  // providers: [
  //   {
  //     provide: APP_FILTER,
  //     useClass: SentryGlobalFilter,
  //   },
  // ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ApiKeyMiddleware).forRoutes('*');
  }
}
