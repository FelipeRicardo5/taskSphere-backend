"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    name: zod_1.z.string({
        required_error: "O nome é obrigatório",
        invalid_type_error: "O nome deve ser uma string"
    }).min(3, "O nome deve ter pelo menos 3 caracteres"),
    email: zod_1.z.string({
        required_error: "O email é obrigatório",
        invalid_type_error: "O email deve ser uma string"
    }).email("Por favor, insira um email válido"),
    password: zod_1.z.string({
        required_error: "A senha é obrigatória",
        invalid_type_error: "A senha deve ser uma string"
    }).min(6, "A senha deve ter pelo menos 6 caracteres")
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string({
        required_error: "O email é obrigatório",
        invalid_type_error: "O email deve ser uma string"
    }).email("Por favor, insira um email válido"),
    password: zod_1.z.string({
        required_error: "A senha é obrigatória",
        invalid_type_error: "A senha deve ser uma string"
    })
});
//# sourceMappingURL=auth.validation.js.map