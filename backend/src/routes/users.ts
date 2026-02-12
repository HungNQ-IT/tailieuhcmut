import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

const router = Router();

// Get all users (admin only)
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user by id
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const id = req.params.id as string;
    const currentUserId = (req as any).user.id;
    const isAdmin = (req as any).user.role === 'admin';

    // Users can only view their own profile unless they're admin
    if (id !== currentUserId && !isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update user
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const id = req.params.id as string;
    const { name, avatar } = req.body;
    const currentUserId = (req as any).user.id;
    const isAdmin = (req as any).user.role === 'admin';

    if (id !== currentUserId && !isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(avatar && { avatar }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        createdAt: true,
      },
    });

    res.json(user);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Update user role (admin only)
router.patch('/:id/role', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const id = req.params.id as string;
    const { role } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    res.json(user);
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ error: 'Failed to update role' });
  }
});

// Delete user (admin only)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const id = req.params.id as string;

    await prisma.user.delete({
      where: { id },
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;
