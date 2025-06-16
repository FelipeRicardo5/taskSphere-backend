"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTaskSchema = exports.createTaskSchema = void 0;
const zod_1 = require("zod");
exports.createTaskSchema = zod_1.z.object({
    title: zod_1.z.string({
        required_error: "O título da tarefa é obrigatório",
        invalid_type_error: "O título da tarefa deve ser uma string"
    }).min(3, "O título da tarefa deve ter pelo menos 3 caracteres"),
    status: zod_1.z.enum(['todo', 'in_progress', 'done'], {
        required_error: "O status é obrigatório",
        invalid_type_error: "O status deve ser um dos seguintes: todo, in_progress, done"
    }),
    due_date: zod_1.z.string({
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
    image_url: zod_1.z.string({
        invalid_type_error: "A URL da imagem deve ser uma string"
    }).url("A URL da imagem deve ser uma URL válida").optional(),
    project_id: zod_1.z.string({
        required_error: "O ID do projeto é obrigatório",
        invalid_type_error: "O ID do projeto deve ser uma string"
    })
});
exports.updateTaskSchema = zod_1.z.object({
    title: zod_1.z.string({
        invalid_type_error: "O título da tarefa deve ser uma string"
    }).min(3, "O título da tarefa deve ter pelo menos 3 caracteres").optional(),
    description: zod_1.z.string({
        invalid_type_error: "A descrição deve ser uma string"
    }).max(500, "A descrição deve ter no máximo 500 caracteres").optional(),
    status: zod_1.z.enum(['todo', 'in_progress', 'done'], {
        invalid_type_error: "O status deve ser um dos seguintes: todo, in_progress, done"
    }).optional(),
    due_date: zod_1.z.string({
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
    image_url: zod_1.z.string({
        invalid_type_error: "A URL da imagem deve ser uma string"
    }).url("A URL da imagem deve ser uma URL válida").optional()
}).refine(data => Object.keys(data).length > 0, {
    message: "Pelo menos um campo deve ser fornecido para atualização"
});
//# sourceMappingURL=task.validation.js.map