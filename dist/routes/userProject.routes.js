"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userProject_controller_1 = require("../controllers/userProject.controller");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.get('/projects', auth_1.authenticate, userProject_controller_1.UserProjectController.getUserProjects);
router.get('/projects/created', auth_1.authenticate, userProject_controller_1.UserProjectController.getCreatedProjects);
router.get('/projects/collaborated', auth_1.authenticate, userProject_controller_1.UserProjectController.getCollaboratedProjects);
exports.default = router;
//# sourceMappingURL=userProject.routes.js.map