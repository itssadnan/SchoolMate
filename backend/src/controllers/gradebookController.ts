import { Response } from 'express';
import { prisma } from '../config/db';
import { TenantRequest } from '../middleware/tenant';

export const getClassGradebook = async (req: TenantRequest, res: Response) => {
  try {
    const { classId } = req.params;

    const classGroup = await prisma.classGroup.findUnique({
      where: { id: classId },
      include: {
        enrollments: {
          include: {
            student: {
              select: { id: true, firstName: true, lastName: true, avatarUrl: true },
            },
          },
          orderBy: { rollNumber: 'asc' },
        },
        assignments: {
          include: {
            subject: { select: { name: true, code: true } },
            grades: true,
          },
          orderBy: { dueAt: 'asc' },
        },
      },
    });

    if (!classGroup) {
      return res.status(404).json({ error: 'Class not found' });
    }

    const assignments = classGroup.assignments.map((a) => ({
      id: a.id,
      title: a.title,
      category: a.category,
      maxPoints: a.maxPoints,
      subjectName: a.subject.name,
      dueAt: a.dueAt,
    }));

    // Map grades per assignment per student
    const studentRows = classGroup.enrollments.map((e) => {
      let totalEarned = 0;
      let totalMax = 0;
      const gradesMap: Record<string, { pointsAwarded: number; percentage: number; feedback?: string }> = {};

      for (const a of classGroup.assignments) {
        const studentGrade = a.grades.find((g) => g.studentId === e.student.id);
        if (studentGrade) {
          totalEarned += studentGrade.pointsAwarded;
          totalMax += a.maxPoints;
          gradesMap[a.id] = {
            pointsAwarded: studentGrade.pointsAwarded,
            percentage: Math.round((studentGrade.pointsAwarded / a.maxPoints) * 100),
            feedback: studentGrade.feedback || undefined,
          };
        }
      }

      const overallPercentage = totalMax > 0 ? Math.round((totalEarned / totalMax) * 100) : 100;
      let letterGrade = 'A';
      if (overallPercentage >= 95) letterGrade = 'A+';
      else if (overallPercentage >= 90) letterGrade = 'A';
      else if (overallPercentage >= 80) letterGrade = 'B';
      else if (overallPercentage >= 70) letterGrade = 'C';
      else if (overallPercentage >= 60) letterGrade = 'D';
      else letterGrade = 'F';

      return {
        studentId: e.student.id,
        rollNumber: e.rollNumber,
        firstName: e.student.firstName,
        lastName: e.student.lastName,
        fullName: `${e.student.firstName} ${e.student.lastName}`,
        avatarUrl: e.student.avatarUrl,
        grades: gradesMap,
        totalEarned,
        totalMax,
        overallPercentage,
        letterGrade,
      };
    });

    return res.json({
      classId: classGroup.id,
      className: classGroup.name,
      assignments,
      students: studentRows,
    });
  } catch (error) {
    console.error('getClassGradebook error:', error);
    return res.status(500).json({ error: 'Failed to fetch gradebook matrix' });
  }
};
