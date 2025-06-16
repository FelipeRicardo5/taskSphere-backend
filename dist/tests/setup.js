"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("../config/env");
beforeAll(async () => {
    await mongoose_1.default.connect(env_1.env.MONGODB_URI);
});
afterAll(async () => {
    await mongoose_1.default.connection.dropDatabase();
    await mongoose_1.default.connection.close();
});
afterEach(() => {
    jest.clearAllMocks();
});
//# sourceMappingURL=setup.js.map