"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("../controllers/auth.controller");
const validate_1 = require("../middleware/validate");
const auth_validation_1 = require("../validations/auth.validation");
const router = express_1.default.Router();
router.post('/register', (0, validate_1.validateRequest)(auth_validation_1.registerSchema), auth_controller_1.AuthController.register);
router.post('/login', (0, validate_1.validateRequest)(auth_validation_1.loginSchema), auth_controller_1.AuthController.login);
router.post('/refresh-token', auth_controller_1.AuthController.refreshToken);
router.post('/logout', auth_controller_1.AuthController.logout);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map