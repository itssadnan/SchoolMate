import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/db';
import { TenantRequest } from '../middleware/tenant';

// Standard permitted academic grade definitions (Pre-KG through 12th)
export const VALID_GRADES = [
  'PRE-KG',
  'PREKG',
  'LKG',
  'UKG',
  'GRADE 1',
  'GRADE 2',
  'GRADE 3',
  'GRADE 4',
  'GRADE 5',
  'GRADE 6',
  'GRADE 7',
  'GRADE 8',
  'GRADE 9',
  'GRADE 10',
  'GRADE 11',
  'GRADE 12',
  '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12',
  '1ST', '2ND', '3RD', '4TH', '5TH', '6TH', '7TH', '8TH', '9TH', '10TH', '11TH', '12TH',
];

interface ImportRowInput {
  name: string;
  rollNumber: string;
  className: string;
  section?: string;
  email?: string;
  phone?: string;
}

/**
 * Normalizes input grade strings into standard display names and numerical values
 */
function normalizeGrade(raw: string): { displayName: string; numericGrade: number } | null {
  if (!raw) return null;
  const cleaned = raw.toUpperCase().trim().replace(/CLASS|STD|STANDARD/g, '').trim();

  if (cleaned === 'PRE-KG' || cleaned === 'PREKG') {
    return { displayName: 'Pre-KG', numericGrade: 0 };
  }
  if (cleaned === 'LKG') {
    return { displayName: 'LKG', numericGrade: 0 };
  }
  if (cleaned === 'UKG') {
    return { displayName: 'UKG', numericGrade: 0 };
  }

  // Check numeric digits (e.g. "9", "GRADE 9", "9TH", "GRADE 9-A")
  const match = cleaned.match(/(\d+)/);
  if (match) {
    const num = parseInt(match[1], 10);
    if (num >= 1 && num <= 12) {
      return { displayName: `Grade ${num}`, numericGrade: num };
    }
  }

  return null;
}

/**
 * Bulk Student Import Handler
 * Strictly validates all rows. If ANY row fails, the entire transaction is rejected.
 */
export const importStudents = async (req: TenantRequest, res: Response) => {
  try {
    const schoolId = req.user?.schoolId || req.school?.id;
    if (!schoolId) {
      return res.status(401).json({ error: 'Tenant institution context required for import' });
    }

    const { rows } = req.body as { rows: ImportRowInput[] };

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ error: 'Import failed: No student rows found in the uploaded file.' });
    }

    // 1. Fetch current school academic year
    const academicYear = await prisma.academicYear.findFirst({
      where: { schoolId, isCurrent: true },
    }) || await prisma.academicYear.findFirst({
      where: { schoolId },
    });

    if (!academicYear) {
      return res.status(400).json({
        error: 'Import failed: No active academic year configured for this institution. Please configure an academic year first.',
      });
    }

    // 2. Fetch existing classes in this school for cross-referencing
    const existingClasses = await prisma.classGroup.findMany({
      where: { schoolId },
      include: {
        enrollments: {
          select: { rollNumber: true, studentId: true },
        },
      },
    });

    // 3. Strict Validation Pass (All-or-Nothing)
    const normalizedRows: Array<{
      rowNumber: number;
      firstName: string;
      lastName: string;
      rollNumber: string;
      gradeDisplayName: string;
      numericGrade: number;
      section: string;
      classGroupName: string;
      email: string;
      phone?: string;
    }> = [];

    const seenRollsInSheet = new Set<string>();
    const seenEmailsInSheet = new Set<string>();

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 1;

      // Validate Name
      const name = (row.name || '').trim();
      if (!name) {
        return res.status(400).json({
          error: `Import failed at row ${rowNum}: Student Name is required and cannot be empty.`,
        });
      }

      // Validate Roll Number
      const rollNumber = (row.rollNumber || '').toString().trim();
      if (!rollNumber) {
        return res.status(400).json({
          error: `Import failed at row ${rowNum} (${name}): Roll Number is required.`,
        });
      }

      // Validate Class / Grade
      const rawGrade = (row.className || '').toString().trim();
      if (!rawGrade) {
        return res.status(400).json({
          error: `Import failed at row ${rowNum} (${name}): Class/Grade is missing.`,
        });
      }

      const gradeInfo = normalizeGrade(rawGrade);
      if (!gradeInfo) {
        return res.status(400).json({
          error: `Import failed at row ${rowNum} (${name}): Invalid Grade "${rawGrade}". Valid options are Pre-KG, LKG, UKG, or Grades 1 to 12.`,
        });
      }

      // Normalize Section (Default to "A" if unspecified)
      let section = (row.section || '').toString().trim().toUpperCase().replace(/SECTION/g, '').trim();
      if (!section) {
        // Try extracting section from class name e.g. "Grade 9-A"
        const sectionMatch = rawGrade.match(/[-_\s]([A-Za-z])$/);
        section = sectionMatch ? sectionMatch[1].toUpperCase() : 'A';
      }

      const classGroupName = `${gradeInfo.displayName}-${section}`;

      // Check duplicate roll number within the same class cohort inside the sheet
      const cohortKey = `${classGroupName}::${rollNumber}`;
      if (seenRollsInSheet.has(cohortKey)) {
        return res.status(400).json({
          error: `Import failed at row ${rowNum} (${name}): Duplicate roll number "${rollNumber}" found in class ${classGroupName} within the upload sheet.`,
        });
      }
      seenRollsInSheet.add(cohortKey);

      // Check duplicate roll number against existing database enrollments
      const existingClass = existingClasses.find(
        (c) => c.name.toUpperCase() === classGroupName.toUpperCase()
      );
      if (existingClass) {
        const existingRoll = existingClass.enrollments.find(
          (e) => e.rollNumber.toLowerCase() === rollNumber.toLowerCase()
        );
        if (existingRoll) {
          return res.status(400).json({
            error: `Import failed at row ${rowNum} (${name}): Roll number "${rollNumber}" is already assigned to an enrolled student in existing class "${classGroupName}".`,
          });
        }
      }

      // Split name into first and last
      const nameParts = name.split(/\s+/);
      const firstName = nameParts[0];
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Student';

      // Email generation / validation
      let email = (row.email || '').trim().toLowerCase();
      if (!email) {
        const safeFirst = firstName.toLowerCase().replace(/[^a-z0-9]/g, '');
        const safeLast = lastName.toLowerCase().replace(/[^a-z0-9]/g, '');
        const cleanSchoolCode = (req.school?.code || 'school').toLowerCase();
        email = `${safeFirst}.${safeLast}.${rollNumber}@student.${cleanSchoolCode}.edu`;
      }

      if (seenEmailsInSheet.has(email)) {
        return res.status(400).json({
          error: `Import failed at row ${rowNum} (${name}): Duplicate email "${email}" detected within the upload sheet.`,
        });
      }
      seenEmailsInSheet.add(email);

      // Check if email already registered in this school
      const existingEmail = await prisma.user.findFirst({
        where: { schoolId, email },
      });
      if (existingEmail) {
        return res.status(400).json({
          error: `Import failed at row ${rowNum} (${name}): An account with email "${email}" already exists in this school.`,
        });
      }

      normalizedRows.push({
        rowNumber: rowNum,
        firstName,
        lastName,
        rollNumber,
        gradeDisplayName: gradeInfo.displayName,
        numericGrade: gradeInfo.numericGrade,
        section,
        classGroupName,
        email,
        phone: (row.phone || '').toString().trim() || undefined,
      });
    }

    // 4. Atomic Execution Pass (Prisma Transaction)
    const defaultPasswordHash = await bcrypt.hash('password123', 10);

    const importResult = await prisma.$transaction(async (tx) => {
      // Map of classGroupName to classGroup ID
      const classMap = new Map<string, string>();

      // Ensure each required class group exists
      for (const row of normalizedRows) {
        if (!classMap.has(row.classGroupName)) {
          let classGroup = await tx.classGroup.findFirst({
            where: { schoolId, name: row.classGroupName },
          });

          if (!classGroup) {
            // Automatically establish class group under this school & academic year
            classGroup = await tx.classGroup.create({
              data: {
                schoolId,
                name: row.classGroupName,
                gradeLevel: row.numericGrade,
                section: row.section,
                academicYearId: academicYear.id,
                room: `Room ${100 + row.numericGrade}`,
              },
            });
          }
          classMap.set(row.classGroupName, classGroup.id);
        }
      }

      // Create students and enrollments
      let createdCount = 0;
      for (const row of normalizedRows) {
        const classGroupId = classMap.get(row.classGroupName)!;

        const student = await tx.user.create({
          data: {
            schoolId,
            email: row.email,
            passwordHash: defaultPasswordHash,
            role: 'STUDENT',
            firstName: row.firstName,
            lastName: row.lastName,
            phone: row.phone,
          },
        });

        await tx.studentEnrollment.create({
          data: {
            studentId: student.id,
            classGroupId,
            academicYearId: academicYear.id,
            rollNumber: row.rollNumber,
          },
        });

        createdCount++;
      }

      return {
        createdCount,
        cohortsCreatedOrUpdated: Array.from(classMap.keys()),
      };
    });

    return res.status(201).json({
      success: true,
      message: `Successfully imported ${importResult.createdCount} students across cohorts: ${importResult.cohortsCreatedOrUpdated.join(', ')}`,
      importedCount: importResult.createdCount,
      cohorts: importResult.cohortsCreatedOrUpdated,
    });
  } catch (error: any) {
    console.error('importStudents error:', error);
    return res.status(500).json({ error: `Bulk import failed: ${error.message || 'Server error'}` });
  }
};
