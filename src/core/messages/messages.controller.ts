import { Controller, Post, Body, UseGuards } from '@nestjs/common';

import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dtos/create-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async getMessages(@Body() createMessageDto: CreateMessageDto) {
    return await this.messagesService.sendMessage(createMessageDto);
  }
}
