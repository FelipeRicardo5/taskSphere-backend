import mongoose, { Document, Schema } from 'mongoose';

export interface IProject extends Document {
  name: string;
  description?: string;
  start_date: Date;
  end_date: Date;
  creator_id: mongoose.Types.ObjectId;
  collaborators: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Project name is required'],
    minlength: [3, 'Project name must be at least 3 characters'],
    trim: true
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    trim: true
  },
  start_date: {
    type: Date,
    required: [true, 'Start date is required'],
    validate: {
      validator: function(v: Date) {
        return v instanceof Date && !isNaN(v.getTime());
      },
      message: 'Start date must be a valid date'
    }
  },
  end_date: {
    type: Date,
    required: [true, 'End date is required'],
    validate: {
      validator: function(this: { start_date: Date }, v: Date) {
        return v instanceof Date && !isNaN(v.getTime()) && v > this.start_date;
      },
      message: 'End date must be a valid date and must be after start date'
    }
  },
  creator_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator ID is required']
  },
  collaborators: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

// Index for faster queries
projectSchema.index({ creator_id: 1 });
projectSchema.index({ collaborators: 1 });

export default mongoose.model<IProject>('Project', projectSchema); 