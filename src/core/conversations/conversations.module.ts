import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Message } from '../messages/entities/message.entity';
import { ConversationsService } from './conversations.service';
import { User } from '../users/entities/user.entity';
import { Conversation } from './entities/conversation.entity';
import { ConversationsController } from './conversations.controllers';
import { UsersModule } from '../users/users.module';
import { CacheServiceModule } from '../../utilities/caching/cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Conversation, Message, User]),
    UsersModule,
    CacheServiceModule,
  ],
  controllers: [ConversationsController],
  providers: [ConversationsService],
  exports: [ConversationsService],
})
export class ConversationsModule {}
