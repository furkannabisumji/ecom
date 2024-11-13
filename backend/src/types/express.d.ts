import { User as PrismaUser } from '@prisma/client'; // Import User type from Prisma

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        role: string;
      }
      uploadKey?: string;
    }
  }
}
