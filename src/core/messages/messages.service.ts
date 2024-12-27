import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateMessageDto } from './dtos/create-message.dto';
import { User } from '../users/entities/user.entity';
import { Message } from './entities/message.entity';
import { Conversation } from '../conversations/entities/conversation.entity';
import { NotificationsService } from './../notifications/notifications.service';
import {
  NotificationCategories,
  NotificationTypes,
} from '../notifications/notifications.constant';
import { ResourceTypes } from '../../common/constants/index.constants';

@Injectable()
export class MessagesService {
  private readonly logger = new Logger(MessagesService.name);

  constructor(
    @InjectRepository(Conversation)
    private conversationsRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async createMessage(
    conversationId: string,
    senderId: string,
    text: string,
  ): Promise<Message> {
    const conversation = await this.conversationsRepository.findOne({
      where: { id: conversationId },
      relations: ['participants'],
    });
    const sender = await this.usersRepository.findOne({
      where: { uuid: senderId },
    });

    const message = this.messagesRepository.create({
      conversation,
      sender,
      text,
    });

    return await this.messagesRepository.save(message);
  }

  async sendMessage(createMessageDto: CreateMessageDto): Promise<Message> {
    const sender = await this.usersRepository.findOneBy({
      uuid: createMessageDto.user_id,
    });
    if (!sender) throw new NotFoundException('Sender not found');

    const receiver = await this.usersRepository.findOneBy({
      uuid: createMessageDto.receiver_id,
    });
    if (!receiver) throw new NotFoundException('Receiver not found');

    const conversation = await this.conversationsRepository.findOne({
      where: { id: createMessageDto.conversation_id },
    });

    const message = this.messagesRepository.create({
      text: createMessageDto.text,
      sender,
    });

    message.conversation = conversation;
    const savedMessage = await this.messagesRepository.save(message);

    conversation.latest_message = savedMessage;
    await this.conversationsRepository.save(conversation);

    // To Improve: Remove circular reference for serialization latest_message
    delete savedMessage.conversation?.latest_message;

    try {
      this.notificationsService.createAndSendNotification(
        sender,
        {
          resource_type: ResourceTypes.MESSAGE,
          category: NotificationCategories.MESSAGE,
          type: [NotificationTypes.MESSAGE],
          recipient_id: receiver.uuid,
        },
        message,
      );
    } catch (e) {
      this.logger.error('An error occurred creating notification');
    }

    return savedMessage;
  }

  async markAsRead(messageId: string, userId: string) {
    const message = await this.messagesRepository.findOne({
      where: { id: messageId },
    });
    if (!message) throw new NotFoundException('Message not found');

    if (message.sender.uuid === userId) return;

    message.is_read = true;
    return this.messagesRepository.save(message);
  }
}
