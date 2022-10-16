"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bad_words_1 = __importDefault(require("bad-words"));
const filter = new bad_words_1.default();
function ValidateName(name) {
    if (name === undefined || name === null || name === "" || name.length < 1) {
        return { valid: false, reason: "You must enter a name." };
    }
    if (name.length > 12) {
        return { valid: false, reason: "Name is too long (max 12)." };
    }
    if (filter.isProfane(name)) {
        return { valid: false, reason: "Name contains profanity." };
    }
    if (name.match("[^a-zA-Z0-9_]")) {
        return { valid: false, reason: "Name my only contain underscores, letters, and numbers." };
    }
    return { valid: true };
}
exports.default = ValidateName;
