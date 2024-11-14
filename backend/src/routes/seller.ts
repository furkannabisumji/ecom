import express from 'express';
import { z } from 'zod';
import { verifyUser } from '../middlewares/verifyuser.js';
import { prisma } from '../clients/db.js';
import slugify from 'slugify';
import { uploadInR2, uploadInS3 } from '../clients/upload.js';
import { v4 } from 'uuid';

const router = express.Router()

const productSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  price: z.number().min(1, "Price is required"),
  basePrice: z.number().min(1, "Base price is required").optional(),
});

router.post('/add', verifyUser, async (req, res) => {
  try {
    const { title, description, price, basePrice } = productSchema.parse(req.body);
    const { userId } = req.user!;
    const product = await prisma.product.create({
      data: {
        title,
        description,
        price,
        base_price: basePrice,
        slug: slugify.default(title)+v4().substring(0,6),
        userId: userId,
      },
    });

    res.status(201).json({ message: 'Product added successfully', product });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(400).json({ error: error instanceof z.ZodError ? error.errors : 'Error adding product' });
  }
});

router.post('/upload/image/:slug', verifyUser, uploadInR2.single('image'), async (req, res) => {
  try {
    await prisma.product.update({
      where: {
        slug: req.params.slug,
      },
      data: {
        image: req.uploadKey!,
      },
    });
    res.status(201).json({ message: 'Uploaded successfully' });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(400).json({ error: error instanceof z.ZodError ? error.errors : 'Error adding product' });
  }
});

router.post('/upload/video/:slug', verifyUser, uploadInS3.single('video'), async (req, res) => {
  try {
    await prisma.product.update({
      where: {
        slug: req.params.slug,
      },
      data: {
        video: req.uploadKey!,
        video_status: 'UNPROCESSED',
      },
    });
    res.status(201).json({ message: 'Uploaded successfully' });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(400).json({ error: error instanceof z.ZodError ? error.errors : 'Error adding product' });
  }
});

export default router;
