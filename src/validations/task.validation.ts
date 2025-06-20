import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z.string({
    required_error: "O título da tarefa é obrigatório",
    invalid_type_error: "O título da tarefa deve ser uma string"
  }).min(3, "O título da tarefa deve ter pelo menos 3 caracteres"),
  
  status: z.enum(['todo', 'in_progress', 'done'], {
    required_error: "O status é obrigatório",
    invalid_type_error: "O status deve ser um dos seguintes: todo, in_progress, done"
  }),
  
  due_date: z.string({
    required_error: "A data de vencimento é obrigatória",
    invalid_type_error: "A data de vencimento deve ser uma string"
  }).transform((str) => {
    const date = new Date(str);
    if (isNaN(date.getTime())) {
      throw new Error("Formato de data inválido");
    }
    if (date <= new Date()) {
      throw new Error("A data de vencimento deve ser futura");
    }
    return date;
  }),
  
  image_url: z.string({
    invalid_type_error: "A URL da imagem deve ser uma string"
  }).url("A URL da imagem deve ser uma URL válida").optional(),
  
  project_id: z.string({
    required_error: "O ID do projeto é obrigatório",
    invalid_type_error: "O ID do projeto deve ser uma string"
  })
});

export const updateTaskSchema = z.object({
  title: z.string({
    invalid_type_error: "O título da tarefa deve ser uma string"
  }).min(3, "O título da tarefa deve ter pelo menos 3 caracteres").optional(),
  
  description: z.string({
    invalid_type_error: "A descrição deve ser uma string"
  }).max(500, "A descrição deve ter no máximo 500 caracteres").optional(),
  
  status: z.enum(['todo', 'in_progress', 'done'], {
    invalid_type_error: "O status deve ser um dos seguintes: todo, in_progress, done"
  }).optional(),
  
  due_date: z.string({
    invalid_type_error: "A data de vencimento deve ser uma string"
  }).transform((str) => {
    const date = new Date(str);
    if (isNaN(date.getTime())) {
      throw new Error("Formato de data inválido");
    }
    if (date <= new Date()) {
      throw new Error("A data de vencimento deve ser futura");
    }
    return date;
  }).optional(),
  
  image_url: z.string({
    invalid_type_error: "A URL da imagem deve ser uma string"
  }).url("A URL da imagem deve ser uma URL válida").optional()
}).refine(data => Object.keys(data).length > 0, {
  message: "Pelo menos um campo deve ser fornecido para atualização"
}); 