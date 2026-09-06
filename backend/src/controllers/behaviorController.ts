import { Response } from 'express';
import { prisma } from '../config/db';
import { TenantRequest } from '../middleware/tenant';

export const logBehavior = async (req: TenantRequest, res: Response) => {
  try {
    const teacherId = req.user?.id;
    const schoolId = req.user?.schoolId || req.school?.id;
    const { studentId, type, category, points, note } = req.body;

    if (!studentId || !type || !category || !teacherId || !schoolId) {
      return res.status(400).json({ error: 'Missing required behavior details' });
    }

    const record = await prisma.behaviorRecord.create({
      data: {
        schoolId,
        studentId,
        teacherId,
        type: type || 'MERIT',
        category,
        points: points !== undefined ? parseInt(points, 10) : 1,
        note: note || null,
      },
      include: {
        student: { select: { firstName: true, lastName: true } },
      },
    });

    return res.status(201).json(record);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to record behavior entry' });
  }
};

export const getClassBehaviors = async (req: TenantRequest, res: Response) => {
  try {
    const { classId } = req.params;

    const enrollments = await prisma.studentEnrollment.findMany({
      where: { classGroupId: classId },
      select: { studentId: true },
    });

    const studentIds = enrollments.map((e) => e.studentId);

    const records = await prisma.behaviorRecord.findMany({
      where: { studentId: { in: studentIds } },
      include: {
        student: { select: { firstName: true, lastName: true, avatarUrl: true } },
        teacher: { select: { firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return res.json(records);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch class behavior records' });
  }
};
