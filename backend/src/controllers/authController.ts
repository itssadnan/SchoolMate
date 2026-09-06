import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db';
import { ENV } from '../config/env';
import { TenantRequest } from '../middleware/tenant';

export const login = async (req: TenantRequest, res: Response) => {
  try {
    const { schoolCode, email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Resolve school by code or tenant header or req.school
    let targetSchool = req.school;
    if (schoolCode) {
      targetSchool = await prisma.school.findUnique({
        where: { code: schoolCode.toUpperCase() },
        select: { id: true, code: true, name: true, accentColor: true },
      }) as any;
    }

    if (!targetSchool) {
      return res.status(400).json({ error: 'Please specify a valid school or school code' });
    }

    const user = await prisma.user.findFirst({
      where: {
        schoolId: targetSchool.id,
        email: email.toLowerCase().trim(),
      },
      include: {
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
      return res.status(401).json({ error: 'Invalid email or password for this school' });
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

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
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error during login' });
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
