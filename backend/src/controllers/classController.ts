import { Response } from 'express';
import { prisma } from '../config/db';
import { TenantRequest } from '../middleware/tenant';

export const getTeacherClasses = async (req: TenantRequest, res: Response) => {
  try {
    const teacherId = req.user?.id;
    const schoolId = req.user?.schoolId || req.school?.id;

    if (!teacherId || !schoolId) {
      return res.status(400).json({ error: 'Teacher authentication required' });
    }

    // Find classes where user is class teacher or teaches a subject
    const classes = await prisma.classGroup.findMany({
      where: {
        schoolId,
        OR: [
          { classTeacherId: teacherId },
          { subjects: { some: { teacherId } } },
        ],
      },
      include: {
        subjects: {
          include: {
            subject: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
            assignments: true,
          },
        },
      },
    });

    return res.json(classes);
  } catch (error) {
    console.error('getTeacherClasses error:', error);
    return res.status(500).json({ error: 'Failed to fetch teacher classes' });
  }
};

export const getClassStudents = async (req: TenantRequest, res: Response) => {
  try {
    const { classId } = req.params;
    const schoolId = req.user?.schoolId || req.school?.id;

    if (!classId) {
      return res.status(400).json({ error: 'Class ID required' });
    }

    const enrollments = await prisma.studentEnrollment.findMany({
      where: { classGroupId: classId },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,
            phone: true,
            studentAttendance: {
              where: { classGroupId: classId },
              select: { status: true },
            },
            studentBehaviors: {
              where: { schoolId },
              select: { points: true, type: true },
            },
          },
        },
      },
      orderBy: { rollNumber: 'asc' },
    });

    const students = enrollments.map((e) => {
      const att = e.student.studentAttendance;
      const totalDays = att.length;
      const presentDays = att.filter((a) => a.status === 'PRESENT').length;
      const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100;

      const meritPoints = e.student.studentBehaviors
        .filter((b) => b.type === 'MERIT')
        .reduce((sum, b) => sum + b.points, 0);

      return {
        id: e.student.id,
        enrollmentId: e.id,
        rollNumber: e.rollNumber,
        firstName: e.student.firstName,
        lastName: e.student.lastName,
        fullName: `${e.student.firstName} ${e.student.lastName}`,
        email: e.student.email,
        avatarUrl: e.student.avatarUrl,
        phone: e.student.phone,
        attendanceRate,
        meritPoints,
      };
    });

    return res.json(students);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch class students' });
  }
};

export const getStudent360 = async (req: TenantRequest, res: Response) => {
  try {
    const { studentId } = req.params;
    const schoolId = req.user?.schoolId || req.school?.id;

    const student = await prisma.user.findFirst({
      where: { id: studentId, schoolId, role: 'STUDENT' },
      include: {
        enrollments: {
          include: { classGroup: true },
        },
        studentAttendance: {
          orderBy: { date: 'desc' },
          take: 30,
        },
        gradesReceived: {
          include: {
            assignment: {
              include: { subject: true },
            },
          },
          orderBy: { gradedAt: 'desc' },
        },
        studentBehaviors: {
          include: { teacher: { select: { firstName: true, lastName: true } } },
          orderBy: { createdAt: 'desc' },
        },
        parentRelations: {
          include: {
            parent: {
              select: { firstName: true, lastName: true, email: true, phone: true },
            },
          },
        },
      },
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Compute metrics
    const totalAttendance = student.studentAttendance.length;
    const presentCount = student.studentAttendance.filter((a) => a.status === 'PRESENT').length;
    const attendanceRate = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 100;

    const grades = student.gradesReceived;
    const avgGrade =
      grades.length > 0
        ? Math.round(grades.reduce((sum, g) => sum + g.pointsAwarded, 0) / grades.length)
        : 85;

    return res.json({
      ...student,
      attendanceRate,
      averageGrade: avgGrade,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch student 360 profile' });
  }
};
