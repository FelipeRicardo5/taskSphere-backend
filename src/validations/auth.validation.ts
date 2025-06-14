import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string({
    required_error: "Name is required",
    invalid_type_error: "Name must be a string"
  }).min(3, "Name must be at least 3 characters"),
  
  email: z.string({
    required_error: "Email is required",
    invalid_type_error: "Email must be a string"
  }).email("Please enter a valid email"),
  
  password: z.string({
    required_error: "Password is required",
    invalid_type_error: "Password must be a string"
  }).min(6, "Password must be at least 6 characters long")
});

export const loginSchema = z.object({
  email: z.string({
    required_error: "Email is required",
    invalid_type_error: "Email must be a string"
  }).email("Please enter a valid email"),
  
  password: z.string({
    required_error: "Password is required",
    invalid_type_error: "Password must be a string"
  })
}); 