import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { Prisma } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; 

@Controller('messages')
@UseGuards(JwtAuthGuard) 
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post('/create')
  create(@Body() createMessageDto: { to_address: string; body: string }, @Request() req) {
    return this.messagesService.create(createMessageDto, req.user.uuid);
  }

  @Get('/fetch_all')
  findAll(@Request() req) {
    return this.messagesService.findAllByUser(req.user.uuid);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.messagesService.findOne(id, req.user.uuid);
  }

  @Patch('/update/:id')
  update(@Param('id') id: string, 
          @Body() updateMessageDto: Prisma.MessageUpdateInput,
          @Request() req) {
    return this.messagesService.update(id, updateMessageDto, req.user.uuid);
  }

  @Delete('/delete/:id')
  remove(@Param('id') id: string, @Request() req) {
    return this.messagesService.remove(id, req.user.uuid);
  }
}
