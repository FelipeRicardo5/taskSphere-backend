"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollaboratorService = void 0;
const axios_1 = __importDefault(require("axios"));
const User_1 = __importDefault(require("../models/User"));
class CollaboratorService {
    static async getSuggestedCollaborators(limit = 5) {
        try {
            const response = await axios_1.default.get(`https://randomuser.me/api/?results=${limit}`);
            const randomUsers = response.data.results;
            const suggestions = randomUsers.map((user) => ({
                name: `${user.name.first} ${user.name.last}`,
                email: user.email,
                avatar: user.picture.medium
            }));
            const existingEmails = await User_1.default.find({
                email: { $in: suggestions.map((s) => s.email) }
            }).select('email');
            const filteredSuggestions = suggestions.filter((suggestion) => !existingEmails.some((user) => user.email === suggestion.email));
            return filteredSuggestions;
        }
        catch (error) {
            throw new Error('Failed to fetch suggested collaborators');
        }
    }
}
exports.CollaboratorService = CollaboratorService;
//# sourceMappingURL=collaborator.service.js.map