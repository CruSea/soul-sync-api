import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';

@Injectable()
export default class EmbeddingService {
  private embedding: GoogleGenerativeAIEmbeddings;

  public constructor(private readonly prisma: PrismaService) {
    this.embedding = new GoogleGenerativeAIEmbeddings({
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

      const retriever = mentorVectorStore.asRetriever(1);
      const matchedMentor = await retriever.invoke(summary);
      return matchedMentor;
    } catch (error) {
      console.log(error.message);
    }
  }
}
