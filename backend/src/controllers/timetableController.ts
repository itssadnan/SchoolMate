import { Response } from 'express';
import { prisma } from '../config/db';
import { TenantRequest } from '../middleware/tenant';

export const getTeacherTimetable = async (req: TenantRequest, res: Response) => {
  try {
    const teacherId = req.user?.id;
    const schoolId = req.user?.schoolId || req.school?.id;

    if (!teacherId || !schoolId) {
      return res.status(400).json({ error: 'Authentication required' });
    }

    const slots = await prisma.timetableSlot.findMany({
      where: {
        schoolId,
        teacherId,
      },
      include: {
        classGroup: { select: { id: true, name: true } },
        subject: { select: { id: true, name: true, code: true } },
      },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });

    return res.json(slots);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch timetable' });
  }
};

export const getLivePeriod = async (req: TenantRequest, res: Response) => {
  try {
    const teacherId = req.user?.id;
    const schoolId = req.user?.schoolId || req.school?.id;

    if (!teacherId || !schoolId) {
      return res.status(400).json({ error: 'Authentication required' });
    }

    const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const todayDay = dayNames[new Date().getDay()] || 'MON';
    // If weekend, fallback to MON for demo visibility
    const activeDay = todayDay === 'SUN' || todayDay === 'SAT' ? 'MON' : todayDay;

    const slots = await prisma.timetableSlot.findMany({
      where: {
        schoolId,
        teacherId,
        dayOfWeek: activeDay,
      },
      include: {
        classGroup: { select: { id: true, name: true } },
        subject: { select: { id: true, name: true, code: true } },
      },
      orderBy: { startTime: 'asc' },
    });

    // Default to the first slot as active/current for demo immersion
    const currentSlot = slots.length > 0 ? slots[0] : null;
    const nextSlot = slots.length > 1 ? slots[1] : null;

    return res.json({
      activeDay,
      isLive: true,
      currentSlot,
      nextSlot,
      allTodaySlots: slots,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch live period' });
  }
};
