import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { Prisma } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Adjust the path as necessary

@Controller('messages')
@UseGuards(JwtAuthGuard) // Protect all routes in this controller
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post('/create')
create(@Body() createMessageDto: { to_address: string; body: string }, @Request() req) {
  // Call the create method with user ID from request
  return this.messagesService.create(createMessageDto, req.user.uuid); // Pass both arguments
}

  @Get('/fetch_all')
  findAll(@Request() req) {
    // Fetch messages only for the authenticated user
    return this.messagesService.findAllByUser(req.user.uuid);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    // Fetch a specific message by ID and ensure ownership
    return this.messagesService.findOne(id, req.user.uuid);
  }

  @Patch('/update/:id')
  update(@Param('id') id: string, 
          @Body() updateMessageDto: Prisma.MessageUpdateInput,
          @Request() req) {
    // Update a message and ensure ownership
    return this.messagesService.update(id, updateMessageDto, req.user.uuid);
  }

  @Delete('/delete/:id')
  remove(@Param('id') id: string, @Request() req) {
    // Soft delete a message and ensure ownership
    return this.messagesService.remove(id, req.user.uuid);
  }
}