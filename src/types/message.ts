import { Message } from '@prisma/client';

export interface MessagePayload {
  type?: string;
  metadata?: Record<string, any>;
  payload?: Message;
}
