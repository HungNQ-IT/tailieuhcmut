import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Get user conversations
router.get('/conversations', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).user.id;

    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId,
          },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    res.json(conversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Get messages in conversation
router.get('/conversations/:id/messages', authMiddleware, async (req, res) => {
  try {
    const id = req.params.id as string;
    const userId = (req as any).user.id;

    // Verify user is in conversation
    const participant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId: id,
        userId,
      },
    });

    if (!participant) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const messages = await prisma.message.findMany({
      where: {
        conversationId: id,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    res.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Create message
router.post('/conversations/:id/messages', authMiddleware, async (req, res) => {
  try {
    const id = req.params.id as string;
    const { content } = req.body;
    const userId = (req as any).user.id;

    // Verify user is in conversation
    const participant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId: id,
        userId,
      },
    });

    if (!participant) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const message = await prisma.message.create({
      data: {
        content,
        conversationId: id,
        senderId: userId,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    // Update conversation updatedAt
    await prisma.conversation.update({
      where: { id },
      data: { updatedAt: new Date() },
    });

    res.status(201).json(message);
  } catch (error) {
    console.error('Create message error:', error);
    res.status(500).json({ error: 'Failed to create message' });
  }
});

// Create conversation
router.post('/conversations', authMiddleware, async (req, res) => {
  try {
    const { participantIds } = req.body;
    const userId = (req as any).user.id;

    // Include current user
    const allParticipants = [...new Set([...participantIds, userId])];

    const conversation = await prisma.conversation.create({
      data: {
        participants: {
          create: allParticipants.map((id: string) => ({
            userId: id,
          })),
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    res.status(201).json(conversation);
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

export default router;
