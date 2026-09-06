import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env';
import { TenantRequest } from './tenant';

export interface JwtPayload {
  userId: string;
  schoolId: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
}

export const authenticateToken = (req: TenantRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET) as JwtPayload;
    req.user = {
      id: decoded.userId,
      schoolId: decoded.schoolId,
      email: decoded.email,
      role: decoded.role,
      firstName: decoded.firstName,
      lastName: decoded.lastName,
    };

    // If request has a tenant context, verify match
    if (req.school && req.school.id !== decoded.schoolId) {
      return res.status(403).json({ error: 'User does not belong to the requested school tenant' });
    }

    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: TenantRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Requires one of roles: [${allowedRoles.join(', ')}]. Current role: ${req.user.role}`,
      });
    }

    next();
  };
};
