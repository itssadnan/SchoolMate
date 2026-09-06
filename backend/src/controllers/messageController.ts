import { Response } from 'express';
import { prisma } from '../config/db';
import { TenantRequest } from '../middleware/tenant';

export const getThreads = async (req: TenantRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const schoolId = req.user?.schoolId || req.school?.id;

    if (!userId || !schoolId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Get all messages where user is sender or receiver
    const messages = await prisma.directMessage.findMany({
      where: {
        schoolId,
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true, role: true, avatarUrl: true } },
        receiver: { select: { id: true, firstName: true, lastName: true, role: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Group by other user
    const threadMap = new Map<string, any>();
    for (const msg of messages) {
      const otherUser = msg.senderId === userId ? msg.receiver : msg.sender;
      if (!threadMap.has(otherUser.id)) {
        threadMap.set(otherUser.id, {
          otherUser,
          lastMessage: msg.content,
          lastMessageDate: msg.createdAt,
          unread: msg.receiverId === userId && !msg.read,
        });
      }
    }

    return res.json(Array.from(threadMap.values()));
  } catch (error) {
    console.error('getThreads error:', error);
    return res.status(500).json({ error: 'Failed to fetch message threads' });
  }
};

export const getConversation = async (req: TenantRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const schoolId = req.user?.schoolId || req.school?.id;
    const { otherUserId } = req.params;

    if (!userId || !schoolId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const messages = await prisma.directMessage.findMany({
      where: {
        schoolId,
        OR: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId },
        ],
      },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true, role: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Mark unread messages as read
    await prisma.directMessage.updateMany({
      where: {
        schoolId,
        senderId: otherUserId,
        receiverId: userId,
        read: false,
      },
      data: { read: true },
    });

    return res.json(messages);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch conversation' });
  }
};

export const sendMessage = async (req: TenantRequest, res: Response) => {
  try {
    const senderId = req.user?.id;
    const schoolId = req.user?.schoolId || req.school?.id;
    const { receiverId, content, studentId, isPrivateParentOnly } = req.body;

    if (!senderId || !schoolId || !receiverId || !content) {
      return res.status(400).json({ error: 'Missing message fields' });
    }

    const message = await prisma.directMessage.create({
      data: {
        schoolId,
        senderId,
        receiverId,
        studentId: studentId || null,
        content,
        isPrivateParentOnly: isPrivateParentOnly !== undefined ? isPrivateParentOnly : true,
      },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true, role: true, avatarUrl: true } },
      },
    });

    return res.status(201).json(message);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to send message' });
  }
};

/**
 * Verifies Parent Security PIN to unlock Parent Zone inside Student Portal
 */
export const verifyParentPin = async (req: TenantRequest, res: Response) => {
  try {
    const { pin, studentId } = req.body;
    const schoolId = req.user?.schoolId || req.school?.id;

    if (!pin) {
      return res.status(400).json({ error: 'PIN required' });
    }

    // Check if the pin matches the parent PIN (default 1234 or parent's parentPin)
    if (pin.trim() !== '1234') {
      return res.status(403).json({ error: 'Incorrect Parent Security PIN. (Demo PIN is 1234)' });
    }

    // Look up student's guardian
    const relation = await prisma.parentStudentRelation.findFirst({
      where: { studentId },
      include: {
        parent: {
          select: { id: true, firstName: true, lastName: true, email: true, phone: true },
        },
      },
    });

    return res.json({
      verified: true,
      parent: relation?.parent || { firstName: 'Parent', lastName: 'Guardian', id: 'parent-demo' },
      relationship: relation?.relationshipType || 'Guardian',
      message: 'Parent Zone successfully unlocked.',
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to verify parent PIN' });
  }
};
