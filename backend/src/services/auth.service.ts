import bcrypt from 'bcrypt';
import { User, UserRole } from '../models/User.model';
import { ExpertProfile } from '../models/ExpertProfile.model';
import { ClientProfile } from '../models/ClientProfile.model';
import { generateAccessToken, generateRefreshToken, TokenPayload } from '../utils/jwt.util';
import { AppError } from '../middleware/errorHandler';

export interface RegisterData {
  email: string;
  password: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  // Expert specific
  specialization?: string[];
  experience?: number;
  certifications?: string[];
  bio?: string;
  // Client specific
  childAge?: number;
  childInterests?: string[];
  notes?: string;
  phone?: string;
}

export const registerUser = async (data: RegisterData) => {
  // Check if user exists
  const existingUser = await User.findOne({ email: data.email.toLowerCase() });
  if (existingUser) {
    throw new AppError('Email already registered', 400);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(data.password, 10);

  // Create user
  const user = await User.create({
    email: data.email.toLowerCase(),
    password: hashedPassword,
    role: data.role,
    isVerified: true, // In production, implement email verification
  });

  // Create profile based on role
  if (data.role === UserRole.EXPERT) {
    await ExpertProfile.create({
      user: user._id,
      firstName: data.firstName,
      lastName: data.lastName,
      specialization: data.specialization || [],
      experience: data.experience || 0,
      certifications: data.certifications || [],
      bio: data.bio || '',
      phone: data.phone,
    });
  } else if (data.role === UserRole.CLIENT) {
    await ClientProfile.create({
      user: user._id,
      firstName: data.firstName,
      lastName: data.lastName,
      childAge: data.childAge,
      childInterests: data.childInterests || [],
      notes: data.notes || '',
      phone: data.phone,
    });
  }

  // Generate tokens
  const tokenPayload: TokenPayload = {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
  };

  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  return {
    user: {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    },
    accessToken,
    refreshToken,
  };
};

export const loginUser = async (email: string, password: string) => {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new AppError('Invalid credentials', 401);
  }

  const tokenPayload: TokenPayload = {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
  };

  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  return {
    user: {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    },
    accessToken,
    refreshToken,
  };
};

export const refreshAccessToken = async (refreshToken: string) => {
  try {
    const { verifyRefreshToken } = await import('../utils/jwt.util');
    const payload = verifyRefreshToken(refreshToken);

    const user = await User.findById(payload.id);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const tokenPayload: TokenPayload = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const newAccessToken = generateAccessToken(tokenPayload);

    return {
      accessToken: newAccessToken,
    };
  } catch (error) {
    throw new AppError('Invalid refresh token', 401);
  }
};

