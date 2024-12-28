import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { AuthGuard } from 'src/modules/auth/guard/auth/auth.guard';

@Controller('conversation')
@UseGuards(AuthGuard)
export class ConversationController {
  constructor(
    private readonly conversationService: ConversationService,
    private readonly prisma: PrismaService) {}

  @Post()
  create(@Body() createConversationDto: CreateConversationDto, @Req() request: any) {
    return this.conversationService.create(createConversationDto);
  }

  // @Get()
  // findAll() {
  //   return this.conversationService.findAll();
  // }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.conversationService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateConversationDto: UpdateConversationDto) {
    return this.conversationService.update(+id, updateConversationDto);
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.conversationService.remove(id);
  // }
}
