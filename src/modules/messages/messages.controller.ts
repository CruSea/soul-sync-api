import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { Prisma } from '@prisma/client';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post('/create')
  create(@Body() createMessageDto: Prisma.MessageCreateInput) {
    return this.messagesService.create(createMessageDto);
  }

  @Get('/fetch_all')
  findAll() {
    return this.messagesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.messagesService.findOne(id);
  }

  @Patch('/update/:id')
  update(@Param('id') id: string, 
  @Body() updateMessageDto: Prisma.MessageUpdateInput) {
    return this.messagesService.update(id, updateMessageDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.messagesService.remove(+id);
  }
}
