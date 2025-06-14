import mongoose, { Document, Schema } from 'mongoose';

export interface ITask extends Document {
  title: string;
  status: 'todo' | 'in_progress' | 'done';
  due_date: Date;
  image_url: string;
  project_id: mongoose.Types.ObjectId;
  creator_id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    minlength: [3, 'Task title must be at least 3 characters'],
    trim: true
  },
  status: {
    type: String,
    enum: {
      values: ['todo', 'in_progress', 'done'],
      message: 'Status must be one of: todo, in_progress, done'
    },
    required: [true, 'Task status is required']
  },
  due_date: {
    type: Date,
    required: [true, 'Due date is required'],
    validate: {
      validator: function(v: Date) {
        return v instanceof Date && !isNaN(v.getTime()) && v > new Date();
      },
      message: 'Due date must be a valid future date'
    }
  },
  image_url: {
    type: String,
    required: [true, 'Image URL is required'],
    validate: {
      validator: function(v: string) {
        try {
          new URL(v);
          return true;
        } catch {
          return false;
        }
      },
      message: 'Image URL must be a valid URL'
    }
  },
  project_id: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Project ID is required']
  },
  creator_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator ID is required']
  }
}, {
  timestamps: true
});

// Indexes for faster queries
taskSchema.index({ project_id: 1 });
taskSchema.index({ creator_id: 1 });
taskSchema.index({ status: 1 });

export default mongoose.model<ITask>('Task', taskSchema); 