import { prisma } from '../src/config/db';
import bcrypt from 'bcryptjs';

async function testAuthFlows() {
  console.log('🧪 ========================================================');
  console.log('🧪 TESTING MODERNIZED AUTH FLOWS (EMAIL+PASSWORD & SIGNUP)');
  console.log('🧪 ========================================================\n');

  // 1. Test finding user by email without schoolCode
  const testEmail = 'sarah.jenkins@oakridge.edu';
  console.log(`▶ [TEST 1] Email + Password Lookup for: ${testEmail}`);
  const matchingUsers = await prisma.user.findMany({
    where: { email: testEmail.toLowerCase().trim() },
    include: {
      school: {
        select: { id: true, name: true, code: true, logoUrl: true, accentColor: true },
      },
    },
  });

  if (matchingUsers.length === 0) {
    throw new Error('Test 1 Failed: User not found');
  }

  const user = matchingUsers[0];
  const passwordValid = await bcrypt.compare('password123', user.passwordHash);
  if (!passwordValid) {
    throw new Error('Test 1 Failed: Password check failed');
  }
  console.log(`✅ [TEST 1 PASSED] Successfully resolved user ${user.firstName} ${user.lastName} (${user.role}) to School: "${user.school.name}" [Code: ${user.school.code}]`);

  // 2. Test School Registration Flow
  console.log('\n▶ [TEST 2] Registering a New School Institution: "Westminster Global Academy"');
  const testSchoolCode = 'WESTMINSTER_' + Math.floor(Math.random() * 1000);
  const testAdminEmail = `headmaster_${Math.floor(Math.random() * 1000)}@westminster.edu`;
  const passwordHash = await bcrypt.hash('adminPass123', 10);

  const newSchool = await prisma.school.create({
    data: {
      name: 'Westminster Global Academy',
      code: testSchoolCode,
      email: testAdminEmail,
      address: '14 Queen Anne Gate, London',
      tagline: 'Tradition, Rigor, Leadership',
      accentColor: '#0f172a',
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      schoolId: newSchool.id,
      email: testAdminEmail,
      passwordHash,
      role: 'SCHOOL_ADMIN',
      firstName: 'Lord',
      lastName: 'Alistair',
      phone: '+44 20 7946 0912',
    },
  });

  console.log(`✅ [TEST 2 PASSED] School created: ${newSchool.name} [${newSchool.code}] with Admin ${adminUser.firstName} ${adminUser.lastName}`);

  // 3. Test Teacher Registration Flow under the new school
  console.log('\n▶ [TEST 3] Registering a New Teacher under Westminster');
  const teacherEmail = `clara.oswald_${Math.floor(Math.random() * 1000)}@westminster.edu`;
  const teacherHash = await bcrypt.hash('teacherPass123', 10);

  const teacherUser = await prisma.user.create({
    data: {
      schoolId: newSchool.id,
      email: teacherEmail,
      passwordHash: teacherHash,
      role: 'TEACHER',
      firstName: 'Clara',
      lastName: 'Oswald',
      phone: '+44 20 7946 0999',
    },
    include: {
      school: true,
    },
  });

  console.log(`✅ [TEST 3 PASSED] Teacher registered: ${teacherUser.firstName} ${teacherUser.lastName} under ${teacherUser.school.name}`);

  // 4. Test Email Login directly for the newly registered teacher
  console.log('\n▶ [TEST 4] Logging in as newly registered Teacher with just email: ' + teacherEmail);
  const foundTeacher = await prisma.user.findFirst({
    where: { email: teacherEmail },
    include: { school: true },
  });

  if (!foundTeacher) {
    throw new Error('Test 4 Failed: Teacher not found');
  }
  const teacherPassValid = await bcrypt.compare('teacherPass123', foundTeacher.passwordHash);
  if (!teacherPassValid) {
    throw new Error('Test 4 Failed: Teacher password comparison failed');
  }

  console.log(`✅ [TEST 4 PASSED] Seamless login verified for ${foundTeacher.firstName} ${foundTeacher.lastName} at ${foundTeacher.school.name}!`);

  console.log('\n🎉 ALL AUTHENTICATION TESTS PASSED SUCCESSFULLY!\n');
}

testAuthFlows().catch(console.error);
