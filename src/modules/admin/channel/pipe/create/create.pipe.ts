import { PipeTransform, Injectable, UnauthorizedException, Inject, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { CreateChannelDto } from 'src/modules/admin/channel/dto/create-channel.dto';
import { REQUEST } from '@nestjs/core';

@Injectable()
export class CreateChannelPipe implements PipeTransform {
  constructor(
    @Inject(REQUEST) private readonly request: any,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService
  ) { }

  async transform(value: CreateChannelDto) {
    const token = this.request.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Token not found');
    }

    let userId: string;
    let accountId: string;
    try {
      const decoded = this.jwtService.verify(token, { secret: process.env.JWT_SECRET });
      if (typeof decoded === 'string') {
        throw new UnauthorizedException('Invalid token');
      }
      userId = decoded.sub;
      accountId = decoded.accounts[0].id; 

    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }

    // Check if the account exists for the current user
    const account = await this.prisma.account.findFirst({
      where: {
        id: accountId,
        AccountUser: {
          some: { userId: userId },
        },
      },
    });

    if (!account) {
      throw new UnauthorizedException(
        'Account not found or user does not have access to this account!',
      );
    }


    // Attach userId and accountId to the request object
    this.request.userId = userId;
    this.request.accountId = accountId;

    // Validate the channel name
    if (!value.name || value.name.trim() === '') {
      throw new BadRequestException('Channel name is required');
    }

    // Validate the configuration
    if (!value.configuration || typeof value.configuration !== 'string' || value.configuration.trim() === '') {
      throw new BadRequestException('Configuration is required and must be a non-empty JSON string');
    }

    // Validate the metadata
    if (!value.metadata || typeof value.metadata !== 'string' || value.metadata.trim() === '') {
      throw new BadRequestException('Metadata is required and must be a non-empty JSON string');
    }

    // Parse the JSON strings to ensure they are valid JSON
    try {
      value.configuration = JSON.parse(value.configuration);
    } catch (error) {
      throw new BadRequestException('Configuration must be a valid JSON string');
    }

    try {
      value.metadata = JSON.parse(value.metadata);
    } catch (error) {
      throw new BadRequestException('Metadata must be a valid JSON string');
    }

    return value;
  }
}