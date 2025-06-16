"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const projectSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'Project name is required'],
        minlength: [3, 'Project name must be at least 3 characters'],
        trim: true
    },
    description: {
        type: String,
        maxlength: [500, 'Description cannot exceed 500 characters'],
        trim: true
    },
    image_url: {
        type: String,
        validate: {
            validator: function (v) {
                if (!v)
                    return true;
                try {
                    new URL(v);
                    return true;
                }
                catch (_a) {
                    return false;
                }
            },
            message: 'Image URL must be a valid URL'
        }
    },
    start_date: {
        type: Date,
        required: [true, 'Start date is required'],
        validate: {
            validator: function (v) {
                return v instanceof Date && !isNaN(v.getTime());
            },
            message: 'Start date must be a valid date'
        }
    },
    end_date: {
        type: Date,
        required: [true, 'End date is required'],
        validate: [
            {
                validator: function (v) {
                    return v instanceof Date && !isNaN(v.getTime());
                },
                message: 'End date must be a valid date'
            },
            {
                validator: function (v) {
                    if (!this.start_date)
                        return true;
                    return v > this.start_date;
                },
                message: 'End date must be after start date'
            }
        ]
    },
    creator_id: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Creator ID is required']
    },
    collaborators: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User'
        }]
}, {
    timestamps: true
});
projectSchema.index({ creator_id: 1 });
projectSchema.index({ collaborators: 1 });
exports.default = mongoose_1.default.model('Project', projectSchema);
//# sourceMappingURL=Project.js.map