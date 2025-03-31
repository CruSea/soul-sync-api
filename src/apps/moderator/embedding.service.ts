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

  async handleEmbedding(channelId: string, summary: string) {
    try {
      const mentors = await this.prisma.mentor.findMany({
        where: {
          Conversation: {
            some: {
              Channel: {
                id: channelId,
              },
            },
          },
        },
      });

      const mentorDocuments: any[] = mentors.map((mentor) => ({
        pageContent: mentor.expertise,
        metadata: { mentorId: mentor.id },
      }));

      const mentorVectorStore = await MemoryVectorStore.fromDocuments(
        mentorDocuments,
        this.embedding,
      );

      const retriever = ScoreThresholdRetriever.fromVectorStore(
        mentorVectorStore,
        {
          minSimilarityScore: 0.7,
          maxK: 3,
        },
      );

      const matchedMentors = await retriever.invoke(summary);

      if (matchedMentors.length === 0) {
        return null;
      }
      return matchedMentors;
    } catch (error) {
      console.log(error.message);
    }
  }
}
