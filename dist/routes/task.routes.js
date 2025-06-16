"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const task_controller_1 = require("../controllers/task.controller");
const validate_1 = require("../middleware/validate");
const task_validation_1 = require("../validations/task.validation");
const auth_1 = require("../middleware/auth");
const upload_1 = require("../middleware/upload");
const router = express_1.default.Router();
router.use(auth_1.authenticate);
router.post('/', upload_1.upload.single('image'), (0, validate_1.validateRequest)(task_validation_1.createTaskSchema), task_controller_1.TaskController.create);
router.get('/', task_controller_1.TaskController.getTasks);
router.get('/:id', task_controller_1.TaskController.getById);
router.put('/:id', upload_1.upload.single('image'), (0, validate_1.validateRequest)(task_validation_1.updateTaskSchema), task_controller_1.TaskController.update);
router.delete('/:id', task_controller_1.TaskController.delete);
exports.default = router;
//# sourceMappingURL=task.routes.js.map