import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { ScoreThresholdRetriever } from 'langchain/retrievers/score_threshold';

@Injectable()
export class EmbeddingService {
  private embedding: GoogleGenerativeAIEmbeddings;

  public constructor(private readonly prisma: PrismaService) {
    this.embedding = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GOOGLE_GENAI_API_KEY,
      model: 'text-embedding-004',
    });
  }

  async handleEmbedding(topic: string, conversationId: string) {
    try {
      const mentors = await this.prisma.mentor.findMany({
        where: {
          accountId: {
            equals: (
              await this.prisma.conversation.findUnique({
                where: { id: conversationId },
                select: { Mentor: { select: { accountId: true } } },
              })
            )?.Mentor.accountId,
          },
          isBot: false,
        },
      });

      const mentorDocuments: any[] = mentors.map((mentor) => ({
        pageContent: Array.isArray(mentor.expertise)
          ? mentor.expertise.join(' ')
          : mentor.expertise,
        metadata: { mentorId: mentor.id },
      }));

      const mentorVectorStore = await MemoryVectorStore.fromDocuments(
        mentorDocuments,
        this.embedding,
      );

      const retriever = ScoreThresholdRetriever.fromVectorStore(
        mentorVectorStore,
        {
          minSimilarityScore: 0.1,
          maxK: 3,
        },
      );
      const matchedMentors = await retriever.invoke(topic);

      if (matchedMentors.length === 0) {
        return null;
      }
      const selectedMentors = matchedMentors.map((match) =>
        mentors.find((mentor) => mentor.id === match.metadata.mentorId),
      );

      return selectedMentors;
    } catch (error) {
      console.log({ 'error: ': error.message });
    }
  }
}
