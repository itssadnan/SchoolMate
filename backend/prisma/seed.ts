import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive multi-school seeding...');

  // Clean existing data
  await prisma.directMessage.deleteMany();
  await prisma.behaviorRecord.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.grade.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.attendanceRecord.deleteMany();
  await prisma.timetableSlot.deleteMany();
  await prisma.studentEnrollment.deleteMany();
  await prisma.parentStudentRelation.deleteMany();
  await prisma.subjectAssignment.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.classGroup.deleteMany();
  await prisma.term.deleteMany();
  await prisma.academicYear.deleteMany();
  await prisma.schoolSetting.deleteMany();
  await prisma.user.deleteMany();
  await prisma.school.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 10);

  // ==========================================
  // 1. SCHOOL 1: Oakridge Global Academy
  // ==========================================
  const oakridge = await prisma.school.create({
    data: {
      name: 'Oakridge Global Academy',
      code: 'OAKRIDGE',
      tagline: 'Inspiring Excellence, Igniting Innovation',
      accentColor: '#2563eb',
      logoUrl: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=120&auto=format&fit=crop&q=80',
      email: 'info@oakridge.edu',
      phone: '+1 (555) 234-8900',
      address: '742 Innovation Way, Silicon Hills, CA',
    },
  });

  // School 1 AI Setting (DB property)
  await prisma.schoolSetting.create({
    data: {
      schoolId: oakridge.id,
      settingKey: 'AI_MODEL_CONFIG',
      settingValue: JSON.stringify({
        provider: 'nvidia',
        baseURL: 'https://integrate.api.nvidia.com/v1',
        model: 'meta/llama-3.3-70b-instruct',
        apiKey: '',
        temperature: 0.4,
      }),
    },
  });

  // Academic Year & Terms
  const oakridgeYear = await prisma.academicYear.create({
    data: {
      schoolId: oakridge.id,
      name: '2026-2027',
      startDate: new Date('2026-08-15'),
      endDate: new Date('2027-06-15'),
      isCurrent: true,
    },
  });

  const oakridgeTerm1 = await prisma.term.create({
    data: {
      schoolId: oakridge.id,
      academicYearId: oakridgeYear.id,
      name: 'Term 1 (Fall Semester)',
      startDate: new Date('2026-08-15'),
      endDate: new Date('2026-12-20'),
      isCurrent: true,
    },
  });

  // Users: Admin, Teachers, Parents, Students
  const oakridgeAdmin = await prisma.user.create({
    data: {
      schoolId: oakridge.id,
      email: 'admin@oakridge.edu',
      passwordHash,
      role: 'SCHOOL_ADMIN',
      firstName: 'Eleanor',
      lastName: 'Vance',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
    },
  });

  const sarahJenkins = await prisma.user.create({
    data: {
      schoolId: oakridge.id,
      email: 'sarah.jenkins@oakridge.edu',
      passwordHash,
      role: 'TEACHER',
      firstName: 'Sarah',
      lastName: 'Jenkins',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      phone: '+1 (555) 901-2244',
    },
  });

  const marcusSterling = await prisma.user.create({
    data: {
      schoolId: oakridge.id,
      email: 'marcus.sterling@oakridge.edu',
      passwordHash,
      role: 'TEACHER',
      firstName: 'Marcus',
      lastName: 'Sterling',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    },
  });

  // Classes
  const grade9A = await prisma.classGroup.create({
    data: {
      schoolId: oakridge.id,
      name: 'Grade 9-A',
      section: 'A',
      gradeLevel: 9,
      room: 'Room 302',
      academicYearId: oakridgeYear.id,
      classTeacherId: sarahJenkins.id,
    },
  });

  const grade10B = await prisma.classGroup.create({
    data: {
      schoolId: oakridge.id,
      name: 'Grade 10-B',
      section: 'B',
      gradeLevel: 10,
      room: 'Lab 4',
      academicYearId: oakridgeYear.id,
      classTeacherId: marcusSterling.id,
    },
  });

  // Subjects
  const physics = await prisma.subject.create({
    data: { schoolId: oakridge.id, name: 'Physics & Mechanics', code: 'PHY101' },
  });
  const calculus = await prisma.subject.create({
    data: { schoolId: oakridge.id, name: 'AP Calculus', code: 'MTH301' },
  });
  const chemistry = await prisma.subject.create({
    data: { schoolId: oakridge.id, name: 'Chemistry Honors', code: 'CHM201' },
  });

  // Subject assignments to teachers
  await prisma.subjectAssignment.create({
    data: { classGroupId: grade9A.id, subjectId: physics.id, teacherId: sarahJenkins.id },
  });
  await prisma.subjectAssignment.create({
    data: { classGroupId: grade10B.id, subjectId: physics.id, teacherId: sarahJenkins.id },
  });
  await prisma.subjectAssignment.create({
    data: { classGroupId: grade9A.id, subjectId: calculus.id, teacherId: marcusSterling.id },
  });

  // Students in Grade 9-A
  const students9AData = [
    { first: 'Leo', last: 'Vance', email: 'leo.vance@student.oakridge.edu', roll: '01', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80' },
    { first: 'Maya', last: 'Lin', email: 'maya.lin@student.oakridge.edu', roll: '02', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80' },
    { first: 'Julian', last: 'Alvarez', email: 'julian.alvarez@student.oakridge.edu', roll: '03', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80' },
    { first: 'Chloe', last: 'Dupont', email: 'chloe.dupont@student.oakridge.edu', roll: '04', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80' },
    { first: 'Ethan', last: 'Nakamura', email: 'ethan.nakamura@student.oakridge.edu', roll: '05', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80' },
    { first: 'Sophia', last: 'Patel', email: 'sophia.patel@student.oakridge.edu', roll: '06', avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&auto=format&fit=crop&q=80' },
    { first: 'Liam', last: 'O\'Connor', email: 'liam.oconnor@student.oakridge.edu', roll: '07', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80' },
    { first: 'Emma', last: 'Watson', email: 'emma.watson@student.oakridge.edu', roll: '08', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80' },
  ];

  const students9A = [];
  for (const s of students9AData) {
    const student = await prisma.user.create({
      data: {
        schoolId: oakridge.id,
        email: s.email,
        passwordHash,
        role: 'STUDENT',
        firstName: s.first,
        lastName: s.last,
        avatarUrl: s.avatar,
      },
    });

    await prisma.studentEnrollment.create({
      data: {
        studentId: student.id,
        classGroupId: grade9A.id,
        rollNumber: s.roll,
        academicYearId: oakridgeYear.id,
      },
    });

    students9A.push(student);
  }

  // Parents
  const parent1 = await prisma.user.create({
    data: {
      schoolId: oakridge.id,
      email: 'david.vance@parent.oakridge.edu',
      passwordHash,
      role: 'PARENT',
      firstName: 'David',
      lastName: 'Vance',
      phone: '+1 (555) 777-1234',
    },
  });

  await prisma.parentStudentRelation.create({
    data: {
      parentId: parent1.id,
      studentId: students9A[0].id, // Leo Vance
      relationshipType: 'Father',
    },
  });

  // Timetable Slots for Dr. Sarah Jenkins
  const days = ['MON', 'TUE', 'WED', 'THU', 'FRI'];
  for (const day of days) {
    // Period 1: 08:30 - 09:15 (Grade 9-A Physics)
    await prisma.timetableSlot.create({
      data: {
        schoolId: oakridge.id,
        classGroupId: grade9A.id,
        subjectId: physics.id,
        teacherId: sarahJenkins.id,
        dayOfWeek: day,
        startTime: '08:30',
        endTime: '09:15',
        room: 'Room 302',
      },
    });
    // Period 2: 09:30 - 10:15 (Grade 10-B Physics)
    await prisma.timetableSlot.create({
      data: {
        schoolId: oakridge.id,
        classGroupId: grade10B.id,
        subjectId: physics.id,
        teacherId: sarahJenkins.id,
        dayOfWeek: day,
        startTime: '09:30',
        endTime: '10:15',
        room: 'Lab 4',
      },
    });
    // Period 4: 11:30 - 12:15 (Grade 9-A Lab)
    if (day === 'MON' || day === 'WED' || day === 'FRI') {
      await prisma.timetableSlot.create({
        data: {
          schoolId: oakridge.id,
          classGroupId: grade9A.id,
          subjectId: physics.id,
          teacherId: sarahJenkins.id,
          dayOfWeek: day,
          startTime: '11:30',
          endTime: '12:15',
          room: 'Physics Lab',
        },
      });
    }
  }

  // Attendance Records (Today and past dates)
  const today = new Date().toISOString().split('T')[0];
  const pastDates = [
    new Date(Date.now() - 86400000).toISOString().split('T')[0],
    new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
  ];

  for (const pastDate of pastDates) {
    for (let i = 0; i < students9A.length; i++) {
      const student = students9A[i];
      let status = 'PRESENT';
      if (i === 2 && pastDate === pastDates[0]) status = 'LATE';
      if (i === 4 && pastDate === pastDates[1]) status = 'EXCUSED';

      await prisma.attendanceRecord.create({
        data: {
          schoolId: oakridge.id,
          classGroupId: grade9A.id,
          studentId: student.id,
          date: pastDate,
          status,
          markedById: sarahJenkins.id,
        },
      });
    }
  }

  // Assignments
  const assignment1 = await prisma.assignment.create({
    data: {
      schoolId: oakridge.id,
      classGroupId: grade9A.id,
      subjectId: physics.id,
      teacherId: sarahJenkins.id,
      title: "Newton's Second Law & Friction Lab Analysis",
      description: 'Document your dynamic cart experimentation, friction coefficients, and error percentage calculation.',
      dueAt: new Date(Date.now() + 3 * 86400000),
      maxPoints: 100,
      category: 'PROJECT',
      rubricJson: JSON.stringify([
        { criterion: 'Data Accuracy & Graphing', weight: '30%' },
        { criterion: 'Theoretical Calculation', weight: '40%' },
        { criterion: 'Conclusion & Error Sources', weight: '30%' },
      ]),
    },
  });

  const assignment2 = await prisma.assignment.create({
    data: {
      schoolId: oakridge.id,
      classGroupId: grade9A.id,
      subjectId: physics.id,
      teacherId: sarahJenkins.id,
      title: 'Thermodynamics & Heat Transfer Problem Set',
      description: 'Solve questions 1 through 15 from Chapter 4 on thermal conductivity and specific heat.',
      dueAt: new Date(Date.now() - 1 * 86400000),
      maxPoints: 50,
      category: 'HOMEWORK',
    },
  });

  // Submissions & Grades
  // Leo Vance submitted assignment 1
  const sub1 = await prisma.submission.create({
    data: {
      assignmentId: assignment1.id,
      studentId: students9A[0].id,
      content: 'Here is my complete lab report with friction coefficient calculations: mu_k = 0.28, error margin = 3.2%.',
      attachmentUrl: 'https://schoolmate.io/files/leo_friction_lab.pdf',
      status: 'GRADED',
      submittedAt: new Date(Date.now() - 12 * 3600000),
    },
  });

  await prisma.grade.create({
    data: {
      schoolId: oakridge.id,
      studentId: students9A[0].id,
      assignmentId: assignment1.id,
      submissionId: sub1.id,
      pointsAwarded: 94,
      feedback: 'Outstanding experimental analysis, Leo. Excellent breakdown of dynamic vs static friction!',
      gradedById: sarahJenkins.id,
    },
  });

  // Maya Lin submitted assignment 1 (Pending grading)
  await prisma.submission.create({
    data: {
      assignmentId: assignment1.id,
      studentId: students9A[1].id,
      content: 'Attached my experiment graphs and calculations for inclined plane angles.',
      attachmentUrl: 'https://schoolmate.io/files/maya_cart_data.pdf',
      status: 'SUBMITTED',
      submittedAt: new Date(Date.now() - 4 * 3600000),
    },
  });

  // Julian Alvarez submitted assignment 1 (Pending grading)
  await prisma.submission.create({
    data: {
      assignmentId: assignment1.id,
      studentId: students9A[2].id,
      content: 'Friction test with steel and rubber surfaces. Results summary included.',
      status: 'SUBMITTED',
      submittedAt: new Date(Date.now() - 2 * 3600000),
    },
  });

  // Submissions for assignment 2 (Graded)
  for (let i = 0; i < 4; i++) {
    const student = students9A[i];
    const score = [48, 45, 42, 49][i];
    const sub = await prisma.submission.create({
      data: {
        assignmentId: assignment2.id,
        studentId: student.id,
        content: `Problem set solutions completed for Chapter 4 exercises.`,
        status: 'GRADED',
        submittedAt: new Date(Date.now() - 36 * 3600000),
      },
    });

    await prisma.grade.create({
      data: {
        schoolId: oakridge.id,
        studentId: student.id,
        assignmentId: assignment2.id,
        submissionId: sub.id,
        pointsAwarded: score,
        feedback: 'Well reasoned solutions with clear step-by-step units.',
        gradedById: sarahJenkins.id,
      },
    });
  }

  // Announcements
  await prisma.announcement.create({
    data: {
      schoolId: oakridge.id,
      authorId: oakridgeAdmin.id,
      title: 'Annual STEM & Science Olympiad Registration Open',
      content: 'Students interested in participating in the Regional Olympiad please register by Friday with your science teachers.',
      targetAudience: 'ALL',
      isUrgent: false,
    },
  });

  await prisma.announcement.create({
    data: {
      schoolId: oakridge.id,
      authorId: sarahJenkins.id,
      title: 'Physics Lab Safety Protocol & Lab Coats Required for Friday',
      content: 'Please ensure all students bring their approved safety goggles and lab journals for our optics laser experiment.',
      targetAudience: 'CLASS',
      targetClassId: grade9A.id,
      isUrgent: true,
    },
  });

  // Pastoral / Behavior records
  await prisma.behaviorRecord.create({
    data: {
      schoolId: oakridge.id,
      studentId: students9A[0].id,
      teacherId: sarahJenkins.id,
      type: 'MERIT',
      category: 'Curiosity & Inquiry',
      points: 2,
      note: 'Asked remarkable clarifying questions on thermal equilibrium that enriched the whole class discussion.',
    },
  });

  await prisma.behaviorRecord.create({
    data: {
      schoolId: oakridge.id,
      studentId: students9A[1].id,
      teacherId: sarahJenkins.id,
      type: 'MERIT',
      category: 'Leadership',
      points: 3,
      note: 'Guided peer group through complex vector mathematics with exceptional patience.',
    },
  });

  // Confidential Parent-Teacher Direct Discussion (Private to Parent & Teacher, PIN protected)
  await prisma.directMessage.create({
    data: {
      schoolId: oakridge.id,
      senderId: sarahJenkins.id,
      receiverId: parent1.id,
      studentId: students9A[0].id, // Leo Vance
      content: 'Hello Mr. Vance, I wanted to personally congratulate you on Leo’s stellar performance on the friction dynamics project (94%). His analytical reasoning is among the top 5% in our grade.',
      isPrivateParentOnly: true,
      read: true,
      createdAt: new Date(Date.now() - 48 * 3600000),
    },
  });

  await prisma.directMessage.create({
    data: {
      schoolId: oakridge.id,
      senderId: parent1.id,
      receiverId: sarahJenkins.id,
      studentId: students9A[0].id,
      content: 'Thank you Dr. Jenkins! We really appreciate the encouragement. He spent the weekend building models at home. Is there any advanced reading you would recommend for the upcoming optics unit?',
      isPrivateParentOnly: true,
      read: true,
      createdAt: new Date(Date.now() - 24 * 3600000),
    },
  });

  await prisma.directMessage.create({
    data: {
      schoolId: oakridge.id,
      senderId: sarahJenkins.id,
      receiverId: parent1.id,
      studentId: students9A[0].id,
      content: 'Absolutely! I will share the Feynman lectures on electromagnetic wave interference with him. Looking forward to seeing his project at the Science Fair!',
      isPrivateParentOnly: true,
      read: false,
      createdAt: new Date(Date.now() - 2 * 3600000),
    },
  });

  // ==========================================
  // 2. SCHOOL 2: St. Jude High School (Tenant 2)
  // ==========================================
  const stjude = await prisma.school.create({
    data: {
      name: 'St. Jude High School',
      code: 'STJUDE',
      tagline: 'Tradition of Wisdom and Character',
      accentColor: '#059669',
      logoUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=120&auto=format&fit=crop&q=80',
      email: 'admissions@stjude.edu',
      phone: '+1 (555) 888-4321',
      address: '100 Cathedral Oaks, Boston, MA',
    },
  });

  const stjudeYear = await prisma.academicYear.create({
    data: {
      schoolId: stjude.id,
      name: '2026-2027',
      startDate: new Date('2026-09-01'),
      endDate: new Date('2027-06-30'),
      isCurrent: true,
    },
  });

  const robertVance = await prisma.user.create({
    data: {
      schoolId: stjude.id,
      email: 'robert.vance@stjude.edu',
      passwordHash,
      role: 'TEACHER',
      firstName: 'Robert',
      lastName: 'Vance',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    },
  });

  const grade10Lit = await prisma.classGroup.create({
    data: {
      schoolId: stjude.id,
      name: 'Grade 10 English',
      section: 'A',
      gradeLevel: 10,
      room: 'Room 105',
      academicYearId: stjudeYear.id,
      classTeacherId: robertVance.id,
    },
  });

  const english = await prisma.subject.create({
    data: { schoolId: stjude.id, name: 'World Literature', code: 'ENG201' },
  });

  await prisma.subjectAssignment.create({
    data: { classGroupId: grade10Lit.id, subjectId: english.id, teacherId: robertVance.id },
  });

  const stjudeStudent = await prisma.user.create({
    data: {
      schoolId: stjude.id,
      email: 'lucas.bell@student.stjude.edu',
      passwordHash,
      role: 'STUDENT',
      firstName: 'Lucas',
      lastName: 'Bell',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    },
  });

  await prisma.studentEnrollment.create({
    data: {
      studentId: stjudeStudent.id,
      classGroupId: grade10Lit.id,
      rollNumber: '01',
      academicYearId: stjudeYear.id,
    },
  });

  console.log('✅ Multi-school database seeded successfully:');
  console.log(`- School 1: ${oakridge.name} (Code: ${oakridge.code})`);
  console.log(`  Teacher: ${sarahJenkins.email} / password123`);
  console.log(`- School 2: ${stjude.name} (Code: ${stjude.code})`);
  console.log(`  Teacher: ${robertVance.email} / password123`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
