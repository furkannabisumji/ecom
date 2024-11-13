import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const DecodedTokenSchema = z.object({
  userId: z.number(),
  role: z.enum(['USER', 'SELLER', 'ADMIN']),
});

type DecodedToken = z.infer<typeof DecodedTokenSchema>;

export async function verifyUser(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies['token'];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET as string, async (err: any, decoded: any) => {
    if (err) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }

    try {
      const validatedDecoded = DecodedTokenSchema.parse(decoded);
      if (validatedDecoded.role !== 'USER' && req.baseUrl !== '/' && validatedDecoded.role !== (req.baseUrl.replace('/', '').toUpperCase())) {
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
      }

      req.user = { userId: validatedDecoded.userId, role: validatedDecoded.role };

      next();
    } catch (validationError) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token structure' });
    }
  });
}

export default verifyUser;
