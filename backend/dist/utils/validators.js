"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateEmail = validateEmail;
exports.validatePassword = validatePassword;
exports.validatePhoneNumber = validatePhoneNumber;
exports.validateRol = validateRol;
exports.validateMotivo = validateMotivo;
function validateEmail(email) {
    const regex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    return regex.test(email);
}
function validatePassword(password) {
    // Mínimo 8 caracteres, 1 mayúscula, 1 minúscula, 1 número, 1 carácter especial
    const regex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    return regex.test(password);
}
function validatePhoneNumber(phone) {
    const regex = /^[0-9]{8,15}$/;
    return regex.test(phone.replace(/\D/g, ''));
}
function validateRol(rol) {
    return ['superadmin', 'bombero'].includes(rol);
}
function validateMotivo(motivo) {
    return ['broma', 'falsa_alarma', 'dato_erroneo', 'otro'].includes(motivo);
}
