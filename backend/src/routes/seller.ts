import express from 'express';
import { z } from 'zod';
import { verifyUser } from '../middlewares/verifyuser.js';
import { prisma } from '../clients/db.js';
import slugify from 'slugify';
import uploadKey from '../middlewares/uploadkey.js';
import { uploadInR2, uploadInS3 } from '../clients/upload.js';
import { v4 } from 'uuid';

const router = express.Router()

const productSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required")
});

router.post('/add', verifyUser, uploadKey, async (req, res) => {
  try {
    const { title, description } = productSchema.parse(req.body);
    const { userId } = req.user!;
    const product = await prisma.product.create({
      data: {
        title,
        description,
        slug: slugify.default(title)+v4().substring(0,6),
        media_key: req.uploadKey!,
        userId: userId,
      },
    });

    res.status(201).json({ message: 'Product added successfully', product });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(400).json({ error: error instanceof z.ZodError ? error.errors : 'Error adding product' });
  }
});

router.post('/upload/image/:slug', verifyUser, uploadKey, uploadInR2.single('image'), async (req, res) => {
  try {
    res.status(201).json({ message: 'Uploaded successfully' });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(400).json({ error: error instanceof z.ZodError ? error.errors : 'Error adding product' });
  }
});

router.post('/upload/video/:slug', verifyUser, uploadKey, uploadInS3.single('video'), async (req, res) => {
  try {
    res.status(201).json({ message: 'Uploaded successfully' });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(400).json({ error: error instanceof z.ZodError ? error.errors : 'Error adding product' });
  }
});

export default router;
