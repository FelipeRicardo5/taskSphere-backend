"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const User_1 = __importDefault(require("../models/User"));
const Project_1 = __importDefault(require("../models/Project"));
const Task_1 = __importDefault(require("../models/Task"));
const RefreshToken_1 = __importDefault(require("../models/RefreshToken"));
class UserService {
    static async delete(userId) {
        await RefreshToken_1.default.deleteMany({ user_id: userId });
        await Project_1.default.updateMany({ collaborators: userId }, { $pull: { collaborators: userId } });
        await Project_1.default.deleteMany({ creator_id: userId });
        await Task_1.default.deleteMany({ creator_id: userId });
        await User_1.default.findByIdAndDelete(userId);
    }
}
exports.UserService = UserService;
//# sourceMappingURL=user.service.js.map