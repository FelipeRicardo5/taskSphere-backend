import mongoose, { Document, Schema } from 'mongoose';

export interface IProject extends Document {
  name: string;
  description?: string;
  start_date: Date;
  end_date: Date;
  image_url?: string;
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
  image_url: {
    type: String,
    validate: {
      validator: function(v: string) {
        if (!v) return true; // Allow empty values since it's optional
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
    validate: [
      {
        validator: function(v: Date) {
          return v instanceof Date && !isNaN(v.getTime());
        },
        message: 'End date must be a valid date'
      },
      {
        validator: function(this: { start_date: Date }, v: Date) {
          if (!this.start_date) return true;
          return v > this.start_date;
        },
        message: 'End date must be after start date'
      }
    ]
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