import jwt from 'jsonwebtoken';
import { UserRole } from '../models/User.model';

export interface TokenPayload {
  id: string;
  email: string;
  role: UserRole;
}

export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, process.env.JWT_SECRET || 'secret', {
    expiresIn: process.env.JWT_EXPIRE || '15m',
  });
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET || 'refresh-secret', {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d',
  });
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, process.env.JWT_SECRET || 'secret') as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'refresh-secret') as TokenPayload;
};

