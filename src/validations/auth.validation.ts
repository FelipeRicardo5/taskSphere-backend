import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string({
    required_error: "O nome é obrigatório",
    invalid_type_error: "O nome deve ser uma string"
  }).min(3, "O nome deve ter pelo menos 3 caracteres"),
  
  email: z.string({
    required_error: "O email é obrigatório",
    invalid_type_error: "O email deve ser uma string"
  }).email("Por favor, insira um email válido"),
  
  password: z.string({
    required_error: "A senha é obrigatória",
    invalid_type_error: "A senha deve ser uma string"
  }).min(6, "A senha deve ter pelo menos 6 caracteres")
});

export const loginSchema = z.object({
  email: z.string({
    required_error: "O email é obrigatório",
    invalid_type_error: "O email deve ser uma string"
  }).email("Por favor, insira um email válido"),
  
  password: z.string({
    required_error: "A senha é obrigatória",
    invalid_type_error: "A senha deve ser uma string"
  })
}); 