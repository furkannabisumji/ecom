import { Request, Response, NextFunction } from 'express';
import { v4 } from 'uuid';
import { prisma } from '../clients/db.js';
import { uploadToStorage } from '../clients/upload.js';

export async function uploadKey(req: Request, res: Response, next: NextFunction) {
  if (req.params.slug) {
    const product = await prisma.product.findUnique({
      where: {
        slug: req.params.slug,
      },
    });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    req.uploadKey = product.media_key;
  }else {
  req.uploadKey = v4();
  }
  next();
}

export default uploadKey;