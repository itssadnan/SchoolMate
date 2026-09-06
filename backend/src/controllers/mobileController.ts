import { Response } from 'express';
import { prisma } from '../config/db';
import { TenantRequest } from '../middleware/tenant';

/**
 * PARENT API ENDPOINTS (Future Mobile App)
 */
export const getParentChildren = async (req: TenantRequest, res: Response) => {
  try {
    const parentId = req.user?.id;
    if (!parentId) return res.status(401).json({ error: 'Parent authentication required' });

    const relations = await prisma.parentStudentRelation.findMany({
      where: { parentId },
      include: {
        student: {
          include: {
            enrollments: {
              include: { classGroup: true },
            },
            studentAttendance: {
              take: 10,
              orderBy: { date: 'desc' },
            },
            gradesReceived: {
              take: 5,
              include: { assignment: true },
              orderBy: { gradedAt: 'desc' },
            },
          },
        },
      },
    });

    const children = relations.map((r) => {
      const s = r.student;
      const totalAtt = s.studentAttendance.length;
      const presentCount = s.studentAttendance.filter((a) => a.status === 'PRESENT').length;
      const attendanceRate = totalAtt > 0 ? Math.round((presentCount / totalAtt) * 100) : 100;

      return {
        id: s.id,
        relationship: r.relationshipType,
        firstName: s.firstName,
        lastName: s.lastName,
        avatarUrl: s.avatarUrl,
        class: s.enrollments[0]?.classGroup?.name || 'N/A',
        attendanceRate,
        recentAttendance: s.studentAttendance,
        recentGrades: s.gradesReceived,
      };
    });

    return res.json({ children });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch parent children data' });
  }
};

/**
 * STUDENT API ENDPOINTS (Future Mobile App)
 */
export const getStudentDashboard = async (req: TenantRequest, res: Response) => {
  try {
    const studentId = req.user?.id;
    if (!studentId) return res.status(401).json({ error: 'Student authentication required' });

    const enrollment = await prisma.studentEnrollment.findFirst({
      where: { studentId },
      include: {
        classGroup: {
          include: {
            assignments: {
              orderBy: { dueAt: 'asc' },
              include: {
                submissions: { where: { studentId } },
                subject: true,
              },
            },
            timetableSlots: {
              include: { subject: true, teacher: { select: { firstName: true, lastName: true } } },
            },
          },
        },
      },
    });

    if (!enrollment) return res.status(404).json({ error: 'Student enrollment not found' });

    return res.json({
      class: enrollment.classGroup.name,
      rollNumber: enrollment.rollNumber,
      assignments: enrollment.classGroup.assignments,
      timetable: enrollment.classGroup.timetableSlots,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch student mobile dashboard' });
  }
};
