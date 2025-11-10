// middleware/auth.ts
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

const JWT_SECRET = process.env.JWT_SECRET!;

export const authenticateUser = (req: Request, res: Response, next: NextFunction) => {
  
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
     res.status(401).json({ message: 'Unauthorized' });
     return
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string, role: string };
    console
    req.user = decoded; // add user info to request
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};
