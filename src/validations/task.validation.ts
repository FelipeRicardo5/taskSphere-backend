import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z.string({
    required_error: "Task title is required",
    invalid_type_error: "Task title must be a string"
  }).min(3, "Task title must be at least 3 characters"),
  
  description: z.string({
    invalid_type_error: "Description must be a string"
  }).max(500, "Description must be at most 500 characters").optional(),
  
  status: z.enum(['todo', 'in_progress', 'done'], {
    required_error: "Status is required",
    invalid_type_error: "Status must be one of: todo, in_progress, done"
  }),
  
  due_date: z.string({
    required_error: "Due date is required",
    invalid_type_error: "Due date must be a string"
  }).transform((str) => {
    const date = new Date(str);
    if (isNaN(date.getTime())) {
      throw new Error("Invalid due date format");
    }
    if (date <= new Date()) {
      throw new Error("Due date must be in the future");
    }
    return date;
  }),
  
  image_url: z.string({
    invalid_type_error: "Image URL must be a string"
  }).url("Image URL must be a valid URL").optional(),
  
  project_id: z.string({
    required_error: "Project ID is required",
    invalid_type_error: "Project ID must be a string"
  })
});

export const updateTaskSchema = z.object({
  title: z.string({
    invalid_type_error: "Task title must be a string"
  }).min(3, "Task title must be at least 3 characters").optional(),
  
  description: z.string({
    invalid_type_error: "Description must be a string"
  }).max(500, "Description must be at most 500 characters").optional(),
  
  status: z.enum(['todo', 'in_progress', 'done'], {
    invalid_type_error: "Status must be one of: todo, in_progress, done"
  }).optional(),
  
  due_date: z.string({
    invalid_type_error: "Due date must be a string"
  }).transform((str) => {
    const date = new Date(str);
    if (isNaN(date.getTime())) {
      throw new Error("Invalid due date format");
    }
    if (date <= new Date()) {
      throw new Error("Due date must be in the future");
    }
    return date;
  }).optional(),
  
  image_url: z.string({
    invalid_type_error: "Image URL must be a string"
  }).url("Image URL must be a valid URL").optional()
}).refine(data => Object.keys(data).length > 0, {
  message: "At least one field must be provided for update"
}); 