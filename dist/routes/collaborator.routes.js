"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const collaborator_controller_1 = require("../controllers/collaborator.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/suggestions', auth_1.authenticate, collaborator_controller_1.CollaboratorController.getSuggestedCollaborators);
router.post('/projects/:id/collaborators', auth_1.authenticate, collaborator_controller_1.CollaboratorController.addCollaborator);
router.delete('/projects/:id/collaborators/:collaboratorId', auth_1.authenticate, collaborator_controller_1.CollaboratorController.removeCollaborator);
exports.default = router;
//# sourceMappingURL=collaborator.routes.js.map