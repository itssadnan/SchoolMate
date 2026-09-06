import { Response } from 'express';
import { prisma } from '../config/db';
import { TenantRequest } from '../middleware/tenant';

export const listSchools = async (_req: TenantRequest, res: Response) => {
  try {
    const schools = await prisma.school.findMany({
      select: {
        id: true,
        name: true,
        code: true,
        tagline: true,
        logoUrl: true,
        accentColor: true,
        email: true,
        phone: true,
        address: true,
        _count: {
          select: {
            users: true,
            classes: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
    return res.json(schools);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to retrieve schools' });
  }
};

export const getSchoolDetails = async (req: TenantRequest, res: Response) => {
  try {
    const schoolId = req.school?.id || req.user?.schoolId;
    if (!schoolId) {
      return res.status(400).json({ error: 'Tenant context required' });
    }

    const school = await prisma.school.findUnique({
      where: { id: schoolId },
      include: {
        academicYears: {
          where: { isCurrent: true },
          include: {
            terms: { where: { isCurrent: true } },
          },
        },
        _count: {
          select: {
            classes: true,
            users: true,
            assignments: true,
          },
        },
      },
    });

    return res.json(school);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch school details' });
  }
};
