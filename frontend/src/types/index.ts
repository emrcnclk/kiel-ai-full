export enum UserRole {
  EXPERT = 'expert',
  CLIENT = 'client',
  ADMIN = 'admin',
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
}

export interface ExpertProfile {
  _id?: string;
  user: string;
  firstName: string;
  lastName: string;
  specialization: string[];
  experience: number;
  certifications: string[];
  bio: string;
  phone?: string;
}

export interface ClientProfile {
  _id?: string;
  user: string;
  firstName: string;
  lastName: string;
  childAge?: number;
  childInterests: string[];
  notes: string;
  phone?: string;
}

export interface Blog {
  _id: string;
  author: string | User;
  title: string;
  content: string;
  excerpt?: string;
  categories: string[];
  tags: string[];
  isPublished: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  _id: string;
  createdBy: string | User;
  title: string;
  description: string;
  category: string;
  ageRange: {
    min: number;
    max: number;
  };
  difficulty: 'easy' | 'medium' | 'hard';
  instructions: string;
  materials?: string[];
  estimatedDuration: number;
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  _id: string;
  expert: string | User;
  client: string | User;
  scheduledAt: string;
  duration: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  _id: string;
  sender: string | User;
  receiver: string | User;
  content: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface Notification {
  _id: string;
  user: string;
  type: string;
  title: string;
  message: string;
  relatedId?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface TimeSlot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface Schedule {
  _id: string;
  expert: string;
  timeSlots: TimeSlot[];
  timezone?: string;
}

