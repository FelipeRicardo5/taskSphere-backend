"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const user_service_1 = require("../services/user.service");
class UserController {
    static async delete(req, res, next) {
        try {
            const userId = req.user._id;
            await user_service_1.UserService.delete(userId.toString());
            res.status(204).send();
        }
        catch (error) {
            next(error);
        }
    }
}
exports.UserController = UserController;
//# sourceMappingURL=user.controller.js.map