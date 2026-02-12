import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Get all documents
router.get('/', async (req, res) => {
  try {
    const { subjectId, chapterId } = req.query;

    const documents = await prisma.document.findMany({
      where: {
        ...(subjectId && { subjectId: subjectId as string }),
        ...(chapterId && { chapterId: chapterId as string }),
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
          },
        },
        subject: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(documents);
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// Get document by id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
          },
        },
        subject: true,
        chapter: true,
      },
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json(document);
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({ error: 'Failed to fetch document' });
  }
});

// Create document (authenticated)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, type, url, size, subjectId, chapterId } = req.body;
    const userId = (req as any).user.id;

    const document = await prisma.document.create({
      data: {
        title,
        type,
        url,
        size,
        subjectId,
        chapterId,
        uploadedById: userId,
      },
    });

    res.status(201).json(document);
  } catch (error) {
    console.error('Create document error:', error);
    res.status(500).json({ error: 'Failed to create document' });
  }
});

// Increment download count
router.post('/:id/download', async (req, res) => {
  try {
    const { id } = req.params;

    const document = await prisma.document.update({
      where: { id },
      data: {
        downloads: {
          increment: 1,
        },
      },
    });

    res.json(document);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Failed to download document' });
  }
});

export default router;
