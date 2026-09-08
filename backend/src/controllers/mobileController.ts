import { Response } from 'express';
import { prisma } from '../config/db';
import { TenantRequest } from '../middleware/tenant';

/**
 * PARENT API ENDPOINTS
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
              include: {
                classGroup: {
                  include: {
                    assignments: {
                      orderBy: { dueAt: 'desc' },
                      take: 5,
                      include: {
                        subject: true,
                        submissions: true,
                      },
                    },
                    timetableSlots: {
                      include: {
                        subject: true,
                        teacher: { select: { id: true, firstName: true, lastName: true, email: true } },
                      },
                    },
                  },
                },
              },
            },
            studentAttendance: {
              take: 15,
              orderBy: { date: 'desc' },
            },
            gradesReceived: {
              take: 10,
              include: {
                assignment: {
                  include: { subject: true },
                },
              },
              orderBy: { gradedAt: 'desc' },
            },
            studentBehaviors: {
              take: 10,
              orderBy: { createdAt: 'desc' },
            },
          },
        },
      },
    });

    const schoolId = req.school?.id || req.user?.schoolId;
    const announcements = schoolId
      ? await prisma.announcement.findMany({
          where: { schoolId },
          orderBy: { createdAt: 'desc' },
          take: 5,
        })
      : [];

    const children = relations.map((r: any) => {
      const s = r.student;
      const totalAtt = s?.studentAttendance?.length || 0;
      const presentCount = s?.studentAttendance?.filter((a: any) => a.status === 'PRESENT').length || 0;
      const attendanceRate = totalAtt > 0 ? Math.round((presentCount / totalAtt) * 100) : 100;

      const classGroup = s?.enrollments?.[0]?.classGroup;

      return {
        id: s.id,
        relationship: r.relationshipType,
        firstName: s.firstName,
        lastName: s.lastName,
        avatarUrl: s.avatarUrl,
        class: classGroup?.name || 'N/A',
        rollNumber: s?.enrollments?.[0]?.rollNumber || 'N/A',
        attendanceRate,
        recentAttendance: s?.studentAttendance || [],
        recentGrades: s?.gradesReceived || [],
        behaviors: s?.studentBehaviors || [],
        upcomingAssignments: classGroup?.assignments || [],
        timetable: classGroup?.timetableSlots || [],
      };
    });

    return res.json({ children, announcements });
  } catch (error) {
    console.error('getParentChildren error:', error);
    return res.status(500).json({ error: 'Failed to fetch parent children data' });
  }
};

/**
 * STUDENT API ENDPOINTS
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

    // Fetch actual attendance records
    const attendanceRecords = await prisma.attendanceRecord.findMany({
      where: { studentId },
      orderBy: { date: 'desc' },
      take: 20,
    });

    const totalAtt = attendanceRecords.length;
    const presentCount = attendanceRecords.filter((a: any) => a.status === 'PRESENT').length;
    const attendanceRate = totalAtt > 0 ? Math.round((presentCount / totalAtt) * 100) : 100;

    // Fetch evaluated grades
    const gradesReceived = await prisma.grade.findMany({
      where: { studentId },
      include: {
        assignment: {
          include: { subject: true },
        },
      },
      orderBy: { gradedAt: 'desc' },
    });

    // Calculate academic average percentage
    let gradeAverage = 94; // fallback default
    if (gradesReceived.length > 0) {
      let totalEarned = 0;
      let totalMax = 0;
      gradesReceived.forEach((g: any) => {
        totalEarned += g.pointsAwarded;
        totalMax += g.assignment?.maxPoints || 100;
      });
      if (totalMax > 0) {
        gradeAverage = Math.round((totalEarned / totalMax) * 100);
      }
    }

    // Fetch behavior merits
    const behaviors = await prisma.behaviorRecord.findMany({
      where: { studentId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const totalMerits = behaviors.reduce((acc: number, b: any) => acc + (b.type === 'MERIT' ? b.points : -b.points), 0);

    // Fetch school announcements
    const schoolId = req.school?.id || req.user?.schoolId;
    const announcements = schoolId
      ? await prisma.announcement.findMany({
          where: { schoolId },
          orderBy: { createdAt: 'desc' },
          take: 5,
        })
      : [];

    return res.json({
      class: enrollment.classGroup.name,
      rollNumber: enrollment.rollNumber,
      assignments: enrollment.classGroup.assignments,
      timetable: enrollment.classGroup.timetableSlots,
      attendanceRate,
      attendanceRecords,
      grades: gradesReceived,
      gradeAverage,
      merits: totalMerits,
      behaviors,
      announcements,
    });
  } catch (error) {
    console.error('getStudentDashboard error:', error);
    return res.status(500).json({ error: 'Failed to fetch student dashboard data' });
  }
};
