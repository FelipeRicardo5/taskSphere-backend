import { z } from 'zod';

export const createProjectSchema = z.object({
  name: z.string({
    required_error: "O nome do projeto é obrigatório",
    invalid_type_error: "O nome do projeto deve ser uma string"
  }).min(3, "O nome do projeto deve ter pelo menos 3 caracteres").max(100, "O nome do projeto deve ter no máximo 100 caracteres"),
  
  description: z.string({
    invalid_type_error: "A descrição deve ser uma string"
  }).max(500, "A descrição deve ter no máximo 500 caracteres").optional(),
  
  start_date: z.string({
    required_error: "A data de início é obrigatória",
    invalid_type_error: "A data de início deve ser uma string"
  }).transform((str) => {
    const date = new Date(str);
    if (isNaN(date.getTime())) {
      throw new Error("Formato de data de início inválido");
    }
    return date;
  }),
  
  end_date: z.string({
    required_error: "A data de término é obrigatória",
    invalid_type_error: "A data de término deve ser uma string"
  }).transform((str) => {
    const date = new Date(str);
    if (isNaN(date.getTime())) {
      throw new Error("Formato de data de término inválido");
    }
    return date;
  }),
  
  collaborators: z.array(z.string()).default([])
}).refine(
  (data) => data.end_date > data.start_date,
  {
    message: "A data de término deve ser posterior à data de início",
    path: ["end_date"]
  }
);

export const updateProjectSchema = z.object({
  name: z.string({
    invalid_type_error: "O nome do projeto deve ser uma string"
  }).min(3, "O nome do projeto deve ter pelo menos 3 caracteres").max(100, "O nome do projeto deve ter no máximo 100 caracteres").optional(),
  
  description: z.string({
    invalid_type_error: "A descrição deve ser uma string"
  }).max(500, "A descrição deve ter no máximo 500 caracteres").optional(),
  
  start_date: z.string({
    invalid_type_error: "A data de início deve ser uma string"
  }).transform((str) => {
    const date = new Date(str);
    if (isNaN(date.getTime())) {
      throw new Error("Formato de data de início inválido");
    }
    return date;
  }).optional(),
  
  end_date: z.string({
    invalid_type_error: "A data de término deve ser uma string"
  }).transform((str) => {
    const date = new Date(str);
    if (isNaN(date.getTime())) {
      throw new Error("Formato de data de término inválido");
    }
    return date;
  }).optional(),
  
  collaborators: z.array(z.string()).optional()
}).refine(data => Object.keys(data).length > 0, {
  message: "Pelo menos um campo deve ser fornecido para atualização"
}); 