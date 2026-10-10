"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = hashPassword;
exports.comparePassword = comparePassword;
exports.generateRandomPassword = generateRandomPassword;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const SALT_ROUNDS = 12;
async function hashPassword(password) {
    return bcryptjs_1.default.hash(password, SALT_ROUNDS);
}
async function comparePassword(password, hash) {
    return bcryptjs_1.default.compare(password, hash);
}
function generateRandomPassword() {
    const mayus = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const minus = 'abcdefghijklmnopqrstuvwxyz';
    const numeros = '0123456789';
    const especiales = '!@#$%^&*';
    const todos = mayus + minus + numeros + especiales;
    let password = mayus[Math.floor(Math.random() * mayus.length)] +
        minus[Math.floor(Math.random() * minus.length)] +
        numeros[Math.floor(Math.random() * numeros.length)] +
        especiales[Math.floor(Math.random() * especiales.length)];
    for (let i = password.length; i < 12; i++) {
        password += todos[Math.floor(Math.random() * todos.length)];
    }
    return password
        .split('')
        .sort(() => Math.random() - 0.5)
        .join('');
}
