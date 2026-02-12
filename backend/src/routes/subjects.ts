import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Get all subjects
router.get('/', async (req, res) => {
  try {
    const subjects = await prisma.subject.findMany({
      include: {
        _count: {
          select: {
            chapters: true,
            documents: true,
          },
        },
      },
    });

    res.json(subjects);
  } catch (error) {
    console.error('Get subjects error:', error);
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
});

// Get subject by slug
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    const subject = await prisma.subject.findUnique({
      where: { slug },
      include: {
        chapters: {
          include: {
            documents: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
        documents: true,
      },
    });

    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    res.json(subject);
  } catch (error) {
    console.error('Get subject error:', error);
    res.status(500).json({ error: 'Failed to fetch subject' });
  }
});

// Create subject (admin only)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, slug, category, description, icon, color } = req.body;

    const subject = await prisma.subject.create({
      data: {
        name,
        slug,
        category,
        description,
        icon,
        color,
      },
    });

    res.status(201).json(subject);
  } catch (error) {
    console.error('Create subject error:', error);
    res.status(500).json({ error: 'Failed to create subject' });
  }
});

export default router;
