import { Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  avatar_url?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IProject extends Document {
  name: string;
  description?: string;
  start_date: Date;
  end_date: Date;
  image_url?: string;
  creator_id: IUser['_id'];
  collaborators: IUser['_id'][];
  createdAt: Date;
  updatedAt: Date;
}

export interface ITask extends Document {
  title: string;
  status: 'todo' | 'in_progress' | 'done';
  due_date: Date;
  image_url: string;
  project_id: IProject['_id'];
  creator_id: IUser['_id'];
  createdAt: Date;
  updatedAt: Date;
}

export interface IRefreshToken extends Document {
  token: string;
  user_id: IUser['_id'];
  expires_at: Date;
  createdAt: Date;
  updatedAt: Date;
} 