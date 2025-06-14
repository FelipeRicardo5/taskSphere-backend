import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string({
    required_error: "Project name is required",
    invalid_type_error: "Project name must be a string"
  }).min(3, "Project name must be at least 3 characters").max(100, "Project name must be at most 100 characters"),
  
  description: z.string({
    invalid_type_error: "Description must be a string"
  }).max(500, "Description must be at most 500 characters").optional(),
  
  start_date: z.string({
    required_error: "Start date is required",
    invalid_type_error: "Start date must be a string"
  }).transform((str) => {
    const date = new Date(str);
    if (isNaN(date.getTime())) {
      throw new Error("Invalid start date format");
    }
    return date;
  }),
  
  end_date: z.string({
    required_error: "End date is required",
    invalid_type_error: "End date must be a string"
  }).transform((str) => {
    const date = new Date(str);
    if (isNaN(date.getTime())) {
      throw new Error("Invalid end date format");
    }
    return date;
  }),
  
  creator_id: z.string(),
  collaborators: z.array(z.string()).default([])
}).refine(
  (data) => data.end_date > data.start_date,
  {
    message: "End date must be after start date",
    path: ["end_date"]
  }
);

export const updateProjectSchema = z.object({
  name: z.string({
    invalid_type_error: "Project name must be a string"
  }).min(3, "Project name must be at least 3 characters").max(100, "Project name must be at most 100 characters").optional(),
  
  description: z.string({
    invalid_type_error: "Description must be a string"
  }).max(500, "Description must be at most 500 characters").optional(),
  
  start_date: z.string({
    invalid_type_error: "Start date must be a string"
  }).transform((str) => {
    const date = new Date(str);
    if (isNaN(date.getTime())) {
      throw new Error("Invalid start date format");
    }
    return date;
  }).optional(),
  
  end_date: z.string({
    invalid_type_error: "End date must be a string"
  }).transform((str) => {
    const date = new Date(str);
    if (isNaN(date.getTime())) {
      throw new Error("Invalid end date format");
    }
    return date;
  }).optional(),
  
  collaborators: z.array(z.string()).optional()
}).refine(data => Object.keys(data).length > 0, {
  message: "At least one field must be provided for update"
}); 