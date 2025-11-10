// src/middleware/adminAuth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const verifyAdmin = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) 
    { res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { adminId: string, role: string };
    if (decoded.role !== 'admin') 
        
        {res.status(403).json({ message: 'Forbidden' });

    return;
    }

    (req as any).admin = decoded;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};
