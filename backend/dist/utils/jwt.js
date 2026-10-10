"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAccessToken = generateAccessToken;
exports.generateRefreshToken = generateRefreshToken;
exports.verifyAccessToken = verifyAccessToken;
exports.verifyRefreshToken = verifyRefreshToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const environment_1 = require("../config/environment");
function generateAccessToken(payload) {
    return jsonwebtoken_1.default.sign(payload, environment_1.config.jwtSecret, {
        expiresIn: environment_1.config.jwtExpiry,
    });
}
function generateRefreshToken(payload) {
    return jsonwebtoken_1.default.sign(payload, environment_1.config.jwtRefreshSecret, {
        expiresIn: environment_1.config.jwtRefreshExpiry,
    });
}
function verifyAccessToken(token) {
    return jsonwebtoken_1.default.verify(token, environment_1.config.jwtSecret);
}
function verifyRefreshToken(token) {
    return jsonwebtoken_1.default.verify(token, environment_1.config.jwtRefreshSecret);
}
