import { PrismaClient } from '@prisma/client';

export async function waitForConversationToBeCreated(
  prisma: PrismaClient,
  address: string,
  maxRetries = 10,
  delayMs = 500,
): Promise<string | null> {
  for (let i = 0; i < maxRetries; i++) {
    const convo = await prisma.conversation.findFirst({
      where: { address, isActive: true },
    });

    if (convo) {
      return convo.id;
    }

    await new Promise((res) => setTimeout(res, delayMs));
  }
  return null;
}
