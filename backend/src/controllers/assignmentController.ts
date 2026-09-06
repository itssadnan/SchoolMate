import { Response } from 'express';
import { prisma } from '../config/db';
import { TenantRequest } from '../middleware/tenant';

export const getTeacherAssignments = async (req: TenantRequest, res: Response) => {
  try {
    const teacherId = req.user?.id;
    const schoolId = req.user?.schoolId || req.school?.id;

    if (!teacherId || !schoolId) {
      return res.status(400).json({ error: 'Authentication required' });
    }

    const assignments = await prisma.assignment.findMany({
      where: {
        schoolId,
        teacherId,
      },
      include: {
        classGroup: { select: { id: true, name: true, gradeLevel: true } },
        subject: { select: { id: true, name: true, code: true } },
        submissions: {
          select: {
            id: true,
            status: true,
            grade: { select: { pointsAwarded: true } },
          },
        },
      },
      orderBy: { dueAt: 'desc' },
    });

    const enriched = assignments.map((a) => {
      const totalSubmissions = a.submissions.length;
      const gradedCount = a.submissions.filter((s) => s.status === 'GRADED').length;
      const pendingGrading = a.submissions.filter((s) => s.status === 'SUBMITTED').length;

      return {
        id: a.id,
        title: a.title,
        description: a.description,
        dueAt: a.dueAt,
        maxPoints: a.maxPoints,
        category: a.category,
        classGroup: a.classGroup,
        subject: a.subject,
        rubric: a.rubricJson ? JSON.parse(a.rubricJson) : null,
        totalSubmissions,
        gradedCount,
        pendingGrading,
      };
    });

    return res.json(enriched);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch assignments' });
  }
};

export const createAssignment = async (req: TenantRequest, res: Response) => {
  try {
    const teacherId = req.user?.id;
    const schoolId = req.user?.schoolId || req.school?.id;
    const { classGroupId, subjectId, title, description, dueAt, maxPoints, category, rubric } = req.body;

    if (!classGroupId || !subjectId || !title || !dueAt || !teacherId || !schoolId) {
      return res.status(400).json({ error: 'Missing required assignment fields' });
    }

    const assignment = await prisma.assignment.create({
      data: {
        schoolId,
        classGroupId,
        subjectId,
        teacherId,
        title,
        description: description || '',
        dueAt: new Date(dueAt),
        maxPoints: parseFloat(maxPoints) || 100,
        category: category || 'HOMEWORK',
        rubricJson: rubric ? JSON.stringify(rubric) : null,
      },
      include: {
        classGroup: { select: { name: true } },
        subject: { select: { name: true } },
      },
    });

    return res.status(201).json(assignment);
  } catch (error) {
    console.error('createAssignment error:', error);
    return res.status(500).json({ error: 'Failed to create assignment' });
  }
};

export const getAssignmentSubmissions = async (req: TenantRequest, res: Response) => {
  try {
    const { assignmentId } = req.params;

    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        classGroup: {
          include: {
            enrollments: {
              include: {
                student: {
                  select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true },
                },
              },
            },
          },
        },
        subject: true,
        submissions: {
          include: {
            grade: true,
          },
        },
      },
    });

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    const submissionMap = new Map<string, any>();
    for (const sub of assignment.submissions) {
      submissionMap.set(sub.studentId, sub);
    }

    // Combine enrollments so every student is listed (even if not yet submitted)
    const studentSubmissions = assignment.classGroup.enrollments.map((e) => {
      const sub = submissionMap.get(e.studentId);
      return {
        studentId: e.student.id,
        rollNumber: e.rollNumber,
        firstName: e.student.firstName,
        lastName: e.student.lastName,
        avatarUrl: e.student.avatarUrl,
        submissionId: sub ? sub.id : null,
        status: sub ? sub.status : 'PENDING',
        content: sub ? sub.content : null,
        attachmentUrl: sub ? sub.attachmentUrl : null,
        submittedAt: sub ? sub.submittedAt : null,
        grade: sub && sub.grade ? sub.grade.pointsAwarded : null,
        feedback: sub && sub.grade ? sub.grade.feedback : null,
      };
    });

    return res.json({
      assignment: {
        id: assignment.id,
        title: assignment.title,
        description: assignment.description,
        maxPoints: assignment.maxPoints,
        category: assignment.category,
        dueAt: assignment.dueAt,
        className: assignment.classGroup.name,
        subjectName: assignment.subject.name,
        rubric: assignment.rubricJson ? JSON.parse(assignment.rubricJson) : null,
      },
      students: studentSubmissions,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch assignment submissions' });
  }
};

export const gradeSubmission = async (req: TenantRequest, res: Response) => {
  try {
    const { assignmentId, studentId } = req.params;
    const { pointsAwarded, feedback, submissionId } = req.body;
    const teacherId = req.user?.id;
    const schoolId = req.user?.schoolId || req.school?.id;

    if (!teacherId || !schoolId || pointsAwarded === undefined) {
      return res.status(400).json({ error: 'Missing grading details' });
    }

    // Ensure submission exists or create one if teacher grades an offline/in-person submission
    let activeSubId = submissionId;
    if (!activeSubId) {
      const existing = await prisma.submission.findUnique({
        where: { assignmentId_studentId: { assignmentId, studentId } },
      });
      if (existing) {
        activeSubId = existing.id;
      } else {
        const newSub = await prisma.submission.create({
          data: {
            assignmentId,
            studentId,
            status: 'GRADED',
            content: 'Graded via Classroom Evaluation',
          },
        });
        activeSubId = newSub.id;
      }
    }

    // Update submission status to GRADED
    await prisma.submission.update({
      where: { id: activeSubId },
      data: { status: 'GRADED' },
    });

    // Upsert Grade
    const grade = await prisma.grade.upsert({
      where: {
        studentId_assignmentId: {
          studentId,
          assignmentId,
        },
      },
      update: {
        pointsAwarded: parseFloat(pointsAwarded),
        feedback: feedback || '',
        gradedById: teacherId,
        gradedAt: new Date(),
        submissionId: activeSubId,
      },
      create: {
        schoolId,
        studentId,
        assignmentId,
        submissionId: activeSubId,
        pointsAwarded: parseFloat(pointsAwarded),
        feedback: feedback || '',
        gradedById: teacherId,
      },
    });

    return res.json({
      success: true,
      grade,
    });
  } catch (error) {
    console.error('gradeSubmission error:', error);
    return res.status(500).json({ error: 'Failed to record grade' });
  }
};

export const submitHomework = async (req: TenantRequest, res: Response) => {
  try {
    const studentId = req.user?.id;
    const { assignmentId } = req.params;
    const { content, attachmentUrl } = req.body;

    if (!studentId || !assignmentId) {
      return res.status(400).json({ error: 'Student ID and Assignment ID required' });
    }

    const sub = await prisma.submission.upsert({
      where: {
        assignmentId_studentId: { assignmentId, studentId },
      },
      update: {
        content,
        attachmentUrl: attachmentUrl || null,
        status: 'SUBMITTED',
        submittedAt: new Date(),
      },
      create: {
        assignmentId,
        studentId,
        content,
        attachmentUrl: attachmentUrl || null,
        status: 'SUBMITTED',
        submittedAt: new Date(),
      },
    });

    return res.json({ success: true, submission: sub });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to submit assignment' });
  }
};

