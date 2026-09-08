import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db';
import { ENV } from '../config/env';
import { TenantRequest } from '../middleware/tenant';

/**
 * Modernized Login Endpoint:
 * Supports Email + Password with automatic school resolution.
 * If schoolCode is optionally provided, scopes search to that school.
 */
export const login = async (req: TenantRequest, res: Response) => {
  try {
    const { schoolCode, email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const cleanEmail = email.toLowerCase().trim();

    // 1. If schoolCode is explicitly provided, scope strictly to that school
    if (schoolCode && schoolCode.trim().length > 0) {
      const targetSchool = await prisma.school.findUnique({
        where: { code: schoolCode.toUpperCase().trim() },
        select: { id: true, code: true, name: true, logoUrl: true, accentColor: true },
      });

      if (!targetSchool) {
        return res.status(404).json({ error: `School with code "${schoolCode}" not found` });
      }

      const user = await prisma.user.findFirst({
        where: {
          schoolId: targetSchool.id,
          email: cleanEmail,
        },
        include: {
          school: {
            select: { id: true, name: true, code: true, logoUrl: true, accentColor: true },
          },
        },
      });

      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password for this school' });
      }

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      return issueAuthResponse(res, user);
    }

    // 2. Automatic School Detection by Email alone
    const matchingUsers = await prisma.user.findMany({
      where: { email: cleanEmail },
      include: {
        school: {
          select: { id: true, name: true, code: true, logoUrl: true, accentColor: true },
        },
      },
    });

    if (matchingUsers.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // If only one user found for this email, verify password directly
    if (matchingUsers.length === 1) {
      const user = matchingUsers[0];
      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
      return issueAuthResponse(res, user);
    }

    // If multiple accounts exist for this email across schools
    // 1. Verify password validity on at least one account
    const accountsWithValidPassword: typeof matchingUsers = [];
    for (const u of matchingUsers) {
      if (await bcrypt.compare(password, u.passwordHash)) {
        accountsWithValidPassword.push(u);
      }
    }

    if (accountsWithValidPassword.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // If only one account matched the password, log into that one directly
    if (accountsWithValidPassword.length === 1) {
      return issueAuthResponse(res, accountsWithValidPassword[0]);
    }

    // If password matches accounts in multiple schools, prompt the user to select their school
    return res.status(200).json({
      requiresSchoolSelection: true,
      message: 'This email is registered under multiple schools. Please select your institution to continue.',
      schools: accountsWithValidPassword.map((u) => ({
        id: u.school.id,
        name: u.school.name,
        code: u.school.code,
        role: u.role,
        accentColor: u.school.accentColor,
      })),
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error during login' });
  }
};

/**
 * Register a New School Institution & School Administrator
 */
export const registerSchool = async (req: TenantRequest, res: Response) => {
  try {
    const { name, code, adminFirstName, adminLastName, email, password, phone, address, tagline } = req.body;

    if (!name || !code || !adminFirstName || !adminLastName || !email || !password) {
      return res.status(400).json({
        error: 'School name, school code, administrator name, email, and password are required',
      });
    }

    const cleanCode = code.toUpperCase().trim().replace(/[^A-Z0-9_-]/g, '');
    const cleanEmail = email.toLowerCase().trim();

    if (cleanCode.length < 2) {
      return res.status(400).json({ error: 'School code must be at least 2 alphanumeric characters' });
    }

    // Check if school code already exists
    const existingSchool = await prisma.school.findUnique({
      where: { code: cleanCode },
    });

    if (existingSchool) {
      return res.status(400).json({
        error: `School code "${cleanCode}" is already registered. Please choose a distinct code.`,
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Create school and school administrator in transaction
    const result = await prisma.$transaction(async (tx) => {
      const newSchool = await tx.school.create({
        data: {
          name: name.trim(),
          code: cleanCode,
          email: cleanEmail,
          phone: phone?.trim() || null,
          address: address?.trim() || null,
          tagline: tagline?.trim() || 'Excellence in Academic Inquiry',
          accentColor: '#1e3a8a',
        },
      });

      const adminUser = await tx.user.create({
        data: {
          schoolId: newSchool.id,
          email: cleanEmail,
          passwordHash,
          role: 'SCHOOL_ADMIN',
          firstName: adminFirstName.trim(),
          lastName: adminLastName.trim(),
          phone: phone?.trim() || null,
        },
      });

      // Initialize default School Settings (AI model config, etc.)
      await tx.schoolSetting.create({
        data: {
          schoolId: newSchool.id,
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

      return { newSchool, adminUser };
    });

    return issueAuthResponse(res, {
      ...result.adminUser,
      school: result.newSchool,
    });
  } catch (error) {
    console.error('registerSchool error:', error);
    return res.status(500).json({ error: 'Failed to register school institution' });
  }
};

/**
 * Register a Teacher to an Existing School
 */
export const registerTeacher = async (req: TenantRequest, res: Response) => {
  try {
    const { schoolCode, firstName, lastName, email, password, phone } = req.body;

    if (!schoolCode || !firstName || !lastName || !email || !password) {
      return res.status(400).json({
        error: 'School code, first name, last name, email, and password are required',
      });
    }

    const cleanCode = schoolCode.toUpperCase().trim();
    const cleanEmail = email.toLowerCase().trim();

    const targetSchool = await prisma.school.findUnique({
      where: { code: cleanCode },
      select: { id: true, name: true, code: true, logoUrl: true, accentColor: true },
    });

    if (!targetSchool) {
      return res.status(404).json({
        error: `No school found with code "${cleanCode}". Please verify your school's institutional code with your administrator.`,
      });
    }

    // Check if email already registered in this school
    const existing = await prisma.user.findFirst({
      where: {
        schoolId: targetSchool.id,
        email: cleanEmail,
      },
    });

    if (existing) {
      return res.status(400).json({
        error: `An account with email "${cleanEmail}" is already registered under ${targetSchool.name}. Please sign in.`,
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newTeacher = await prisma.user.create({
      data: {
        schoolId: targetSchool.id,
        email: cleanEmail,
        passwordHash,
        role: 'TEACHER',
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone?.trim() || null,
      },
      include: {
        school: {
          select: { id: true, name: true, code: true, logoUrl: true, accentColor: true },
        },
      },
    });

    return issueAuthResponse(res, newTeacher);
  } catch (error) {
    console.error('registerTeacher error:', error);
    return res.status(500).json({ error: 'Failed to register teacher account' });
  }
};

export const getMe = async (req: TenantRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthenticated' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        avatarUrl: true,
        phone: true,
        school: {
          select: {
            id: true,
            name: true,
            code: true,
            logoUrl: true,
            accentColor: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json(user);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch current user' });
  }
};

/**
 * Internal Helper to issue standard JWT and user/school payload
 */
function issueAuthResponse(res: Response, user: any) {
  const token = jwt.sign(
    {
      userId: user.id,
      schoolId: user.schoolId,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    },
    ENV.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl,
      phone: user.phone,
    },
    school: user.school,
  });
}
