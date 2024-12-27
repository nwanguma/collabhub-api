import {
  Res,
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';

import { ConversationsService } from './conversations.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { GetCurrentUser } from '../../common/decorators/current-user.decorator';
import { CustomSerializerInterceptor } from '../../common/interceptors/transform.interceptor';
import { User } from '../users/entities/user.entity';
import { ConversationDto } from './dtos/conversation.dto';
import { CacheService } from '../../utilities/caching/cache.service';

@Controller('conversations')
export class ConversationsController {
  constructor(
    private readonly conversationsService: ConversationsService,
    private readonly cacheService: CacheService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(new CustomSerializerInterceptor(ConversationDto))
  async getConversations(
    @GetCurrentUser() user: User,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return await this.conversationsService.getConversations(
      user.uuid,
      page,
      limit,
    );
  }

  @Get(':conversationId/messages/long-poll')
  @UseGuards(JwtAuthGuard)
  async longPolling(
    @Res() res: Response,
    @GetCurrentUser() user: User,
    @Param('conversationId') conversationId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    const timeout = 30000;
    const pollingInterval = 5000;
    let hasNewMessages = false;

    const latestSentMessagesTimestampCacheKey = `user_${user.uuid}_latest_message_time`;
    const latestSentMessagesTimestampCacheData = await this.cacheService.get(
      latestSentMessagesTimestampCacheKey,
    );

    let pollingTimeoutId: NodeJS.Timeout;

    const checkForNewMessages = async () => {
      try {
        const messagesData = await this.conversationsService.getMessages(
          user,
          conversationId,
          page,
          limit,
        );

        let checkHasNewMessages = false;
        if (messagesData.total > 0) {
          const latestNotificationTimeStamp = new Date(
            messagesData.data[0].created_at,
          ).getTime();

          checkHasNewMessages =
            !latestSentMessagesTimestampCacheData ||
            latestNotificationTimeStamp !==
              latestSentMessagesTimestampCacheData;
        }

        if (checkHasNewMessages) {
          const latestNotificationTimeStamp = new Date(
            messagesData.data[0].created_at,
          ).getTime();

          hasNewMessages = true;
          await this.cacheService.set(
            latestSentMessagesTimestampCacheKey,
            latestNotificationTimeStamp,
          );

          if (pollingTimeoutId) clearTimeout(pollingTimeoutId);

          return res.json({
            ...messagesData,
            // data: messagesData?.data
            //   ?.filter((message) => {
            //     return (
            //       new Date(message.created_at).getTime() >=
            //       latestNotificationTimeStamp
            //     );
            //   })
            //   .map((message) => message.id),
          });
        }

        pollingTimeoutId = setTimeout(checkForNewMessages, pollingInterval);
      } catch (error) {
        console.error('Error checking messages:', error);
        return res
          .status(500)
          .json({ message: 'An error occurred during polling.' });
      }
    };

    checkForNewMessages();

    const endTimeoutId = setTimeout(() => {
      if (!hasNewMessages) {
        if (pollingTimeoutId) clearTimeout(pollingTimeoutId);

        res.json({ data: [], total: 0 });
      }

      clearTimeout(endTimeoutId);
    }, timeout);
  }

  @Get(':conversationId/messages')
  @UseGuards(JwtAuthGuard)
  async getMessages(
    @GetCurrentUser() user: User,
    @Param('conversationId') conversationId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return await this.conversationsService.getMessages(
      user,
      conversationId,
      page,
      limit,
    );
  }

  @Post(':recipientId')
  @UseInterceptors(new CustomSerializerInterceptor(ConversationDto))
  @UseGuards(JwtAuthGuard)
  async createConversation(
    @GetCurrentUser() user: User,
    @Param('recipientId') recipientId: string,
  ) {
    return await this.conversationsService.findOrCreateConversation(
      user.uuid,
      recipientId,
    );
  }
}
