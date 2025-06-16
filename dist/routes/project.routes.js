"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const project_controller_1 = require("../controllers/project.controller");
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const project_validation_1 = require("../validations/project.validation");
const router = express_1.default.Router();
router.get('/', auth_1.authenticate, project_controller_1.ProjectController.getAll);
router.post('/', auth_1.authenticate, (0, validate_1.validateRequest)(project_validation_1.createProjectSchema), project_controller_1.ProjectController.create);
router.get('/:id', auth_1.authenticate, project_controller_1.ProjectController.getById);
router.put('/:id', auth_1.authenticate, (0, validate_1.validateRequest)(project_validation_1.updateProjectSchema), project_controller_1.ProjectController.update);
router.delete('/:id', auth_1.authenticate, project_controller_1.ProjectController.delete);
router.post('/:id/collaborators', auth_1.authenticate, project_controller_1.ProjectController.addCollaborator);
router.delete('/:id/collaborators/:collaboratorId', auth_1.authenticate, project_controller_1.ProjectController.removeCollaborator);
router.get('/:id/collaborators', auth_1.authenticate, project_controller_1.ProjectController.getCollaborators);
exports.default = router;
//# sourceMappingURL=project.routes.js.map