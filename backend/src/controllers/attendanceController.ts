import { Response } from 'express';
import { prisma } from '../config/db';
import { TenantRequest } from '../middleware/tenant';

export const getClassAttendanceByDate = async (req: TenantRequest, res: Response) => {
  try {
    const { classId } = req.params;
    const date = (req.query.date as string) || new Date().toISOString().split('T')[0];

    const enrollments = await prisma.studentEnrollment.findMany({
      where: { classGroupId: classId },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { rollNumber: 'asc' },
    });

    const existingRecords = await prisma.attendanceRecord.findMany({
      where: {
        classGroupId: classId,
        date,
      },
    });

    const recordMap = new Map<string, { status: string; remarks: string | null; id: string }>();
    for (const r of existingRecords) {
      recordMap.set(r.studentId, { status: r.status, remarks: r.remarks, id: r.id });
    }

    const rosterAttendance = enrollments.map((e) => {
      const record = recordMap.get(e.student.id);
      return {
        studentId: e.student.id,
        rollNumber: e.rollNumber,
        firstName: e.student.firstName,
        lastName: e.student.lastName,
        avatarUrl: e.student.avatarUrl,
        status: record ? record.status : 'PRESENT', // default to PRESENT for fast 1-click marking
        remarks: record ? record.remarks : '',
        recordId: record ? record.id : null,
        isRecorded: !!record,
      };
    });

    return res.json({
      classId,
      date,
      totalStudents: rosterAttendance.length,
      roster: rosterAttendance,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch class attendance' });
  }
};

export const recordBatchAttendance = async (req: TenantRequest, res: Response) => {
  try {
    const { classId } = req.params;
    const { date, records } = req.body; // records: [{ studentId, status, remarks }]
    const teacherId = req.user?.id;
    const schoolId = req.user?.schoolId || req.school?.id;

    if (!classId || !date || !Array.isArray(records) || !teacherId || !schoolId) {
      return res.status(400).json({ error: 'Missing required attendance payload' });
    }

    // Upsert each attendance record in parallel transaction
    const operations = records.map((r: { studentId: string; status: string; remarks?: string }) => {
      return prisma.attendanceRecord.upsert({
        where: {
          classGroupId_studentId_date: {
            classGroupId: classId,
            studentId: r.studentId,
            date,
          },
        },
        update: {
          status: r.status,
          remarks: r.remarks || null,
          markedById: teacherId,
        },
        create: {
          schoolId,
          classGroupId: classId,
          studentId: r.studentId,
          date,
          status: r.status,
          remarks: r.remarks || null,
          markedById: teacherId,
        },
      });
    });

    await prisma.$transaction(operations);

    // Calculate metrics summary for response
    const presentCount = records.filter((r) => r.status === 'PRESENT').length;
    const absentCount = records.filter((r) => r.status === 'ABSENT').length;
    const lateCount = records.filter((r) => r.status === 'LATE').length;
    const excusedCount = records.filter((r) => r.status === 'EXCUSED').length;

    return res.json({
      success: true,
      message: `Attendance recorded for ${records.length} students on ${date}`,
      summary: {
        total: records.length,
        present: presentCount,
        absent: absentCount,
        late: lateCount,
        excused: excusedCount,
        attendanceRate: Math.round((presentCount / records.length) * 100),
      },
    });
  } catch (error) {
    console.error('recordBatchAttendance error:', error);
    return res.status(500).json({ error: 'Failed to record batch attendance' });
  }
};
