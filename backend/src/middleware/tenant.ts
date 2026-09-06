import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db';

export interface TenantRequest extends Request {
  school?: {
    id: string;
    code: string;
    name: string;
    accentColor: string | null;
  };
  user?: {
    id: string;
    schoolId: string;
    email: string;
    role: string;
    firstName: string;
    lastName: string;
  };
}

export const tenantMiddleware = async (req: TenantRequest, res: Response, next: NextFunction) => {
  try {
    const tenantCode = (req.headers['x-tenant-code'] as string) || (req.query.schoolCode as string);

    if (tenantCode) {
      const school = await prisma.school.findUnique({
        where: { code: tenantCode.toUpperCase() },
        select: { id: true, code: true, name: true, accentColor: true },
      });

      if (!school) {
        return res.status(404).json({ error: `School with code '${tenantCode}' not found.` });
      }

      req.school = school;
      return next();
    }

    // Default fallback to first school if not specified (helps easy local dev)
    const firstSchool = await prisma.school.findFirst({
      select: { id: true, code: true, name: true, accentColor: true },
    });

    if (firstSchool) {
      req.school = firstSchool;
    }

    next();
  } catch (error) {
    console.error('Tenant middleware error:', error);
    next();
  }
};
