import { Response } from 'express';
import { prisma } from '../config/db';
import { TenantRequest } from '../middleware/tenant';

export const getAnnouncements = async (req: TenantRequest, res: Response) => {
  try {
    const schoolId = req.user?.schoolId || req.school?.id;

    if (!schoolId) {
      return res.status(400).json({ error: 'Tenant context required' });
    }

    const announcements = await prisma.announcement.findMany({
      where: { schoolId },
      include: {
        author: { select: { firstName: true, lastName: true, role: true } },
        targetClass: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json(announcements);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch announcements' });
  }
};

export const createAnnouncement = async (req: TenantRequest, res: Response) => {
  try {
    const authorId = req.user?.id;
    const schoolId = req.user?.schoolId || req.school?.id;
    const { title, content, targetAudience, targetClassId, isUrgent } = req.body;

    if (!title || !content || !authorId || !schoolId) {
      return res.status(400).json({ error: 'Missing required announcement details' });
    }

    const notice = await prisma.announcement.create({
      data: {
        schoolId,
        authorId,
        title,
        content,
        targetAudience: targetAudience || 'ALL',
        targetClassId: targetClassId || null,
        isUrgent: !!isUrgent,
      },
      include: {
        author: { select: { firstName: true, lastName: true } },
        targetClass: { select: { name: true } },
      },
    });

    return res.status(201).json(notice);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create announcement' });
  }
};
