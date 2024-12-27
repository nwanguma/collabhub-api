import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { groupBy } from 'lodash';

import { Conversation } from './entities/conversation.entity';
import { UsersService } from '../users/users.service';
import { Message } from '../messages/entities/message.entity';
import { ParticipantsData } from './conversations.constants';
import { User } from '../users/entities/user.entity';

Injectable();
export class ConversationsService {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationsRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private readonly messagesRepository: Repository<Message>,
    private readonly usersService: UsersService,
  ) {}

  async findOrCreateConversation(
    userId: string,
    otherUserId: string,
  ): Promise<ParticipantsData> {
    const userIds = [userId, otherUserId];
    let savedConversation;
    let conversation;

    const conversationData = await this.conversationsRepository
      .createQueryBuilder('conversation')
      .innerJoin('conversation.participants', 'participant')
      .where('participant.uuid IN (:...userIds)', { userIds })
      .groupBy('conversation.id')
      .having('COUNT(participant.id) = 2')
      .getOne();

    if (conversationData) {
      conversation = await this.conversationsRepository.findOne({
        where: {
          id: conversationData.id,
        },
        relations: ['participants'],
      });
    }

    if (!conversation) {
      const user = await this.usersService.getUserById(userId);
      const otherUser = await this.usersService.getUserById(otherUserId);

      conversation = this.conversationsRepository.create({
        participants: [user, otherUser],
        is_group: false,
      });

      savedConversation = await this.conversationsRepository.save(conversation);

      const currentUser = savedConversation.participants.filter(
        (participant) => participant.uuid === userId,
      )[0];

      const participant = savedConversation.participants.filter(
        (participant) => participant.uuid !== userId,
      )[0];

      return {
        participants: {
          user: currentUser,
          participant,
        },
        latest_message: savedConversation.latest_message,
        id: savedConversation.id,
      };
    }

    const currentUser = conversation.participants.filter(
      (participant) => participant.uuid === userId,
    )[0];

    const participant = conversation.participants.filter(
      (participant) => participant.uuid !== userId,
    )[0];

    return {
      participants: {
        user: currentUser,
        participant,
      },
      latest_message: conversation.latest_message,
      id: conversation.id,
    };
  }

  async getConversations(userId: string, page: number = 1, limit: number = 20) {
    const subQuery = this.conversationsRepository
      .createQueryBuilder('subConversation')
      .select('subConversation.id')
      .leftJoin('subConversation.participants', 'subParticipant')
      .where('subParticipant.uuid = :userId', { userId });

    const conversations = await this.conversationsRepository
      .createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.participants', 'participant')
      .leftJoinAndSelect('participant.profile', 'profile')
      .leftJoinAndSelect('conversation.messages', 'message')
      .leftJoinAndSelect('conversation.latest_message', 'latest_message')
      .where(`conversation.id IN (${subQuery.getQuery()})`)
      .setParameters(subQuery.getParameters())
      .orderBy('conversation.updated_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    // const sortedConversations = conversations.reverse();

    return conversations.map((conversation) => {
      const currentUser = conversation.participants.filter(
        (participant) => participant.uuid === userId,
      )[0];

      const participant = conversation.participants.filter(
        (participant) => participant.uuid !== userId,
      )[0];

      return {
        participants: {
          user: currentUser,
          participant: participant,
        },
        latest_message: conversation.latest_message,
        id: conversation.id,
      };
    });
  }

  // async getMessages(
  //   user: User,
  //   conversationId: string,
  //   page: number = 1,
  //   limit: number = 20,
  // ) {
  //   const queryBuilder = await this.messagesRepository
  //     .createQueryBuilder('message')
  //     .leftJoinAndSelect('message.sender', 'sender')
  //     .where('message.conversation_id = :conversationId', { conversationId })
  //     .orderBy('message.created_at', 'DESC')
  //     .skip((page - 1) * limit)
  //     .take(limit);

  //   const [data, total] = await queryBuilder.getManyAndCount();

  //   this.usersService.updateLastSeen(user);

  //   const sortedData = data.reverse();

  //   return {
  //     data: sortedData,
  //     total,
  //     page: total ? page : 0,
  //     totalPages: Math.ceil(total / limit),
  //   };
  // }

  async getMessages(
    user: User,
    conversationId: string,
    page: number = 1,
    limit: number = 20,
  ) {
    const conversation = await this.conversationsRepository.findOne({
      where: {
        id: conversationId,
      },
    });

    if (!conversation)
      throw new BadRequestException('Conversation does not exist');

    const queryBuilder = await this.messagesRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.sender', 'sender')
      .where('message.conversation_id = :conversationId', { conversationId })
      .orderBy('message.created_at', 'DESC') // Get the latest messages first
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();

    this.usersService.updateLastSeen(user);

    const sortedData = data.reverse();

    const groupedMessages = groupBy(
      sortedData,
      (message) => new Date(message.created_at).toISOString().split('T')[0],
    );

    return {
      batch: sortedData.length,
      data: groupedMessages,
      total,
      page: total ? page : 0,
      totalPages: Math.ceil(total / limit),
    };
  }
}
