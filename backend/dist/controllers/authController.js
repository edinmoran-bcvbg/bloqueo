"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cambiarPassword = exports.logout = exports.me = exports.refresh = exports.login = void 0;
const Usuario_1 = require("../models/Usuario");
const LogAuditoria_1 = require("../models/LogAuditoria");
const passwords_1 = require("../utils/passwords");
const jwt_1 = require("../utils/jwt");
const validators_1 = require("../utils/validators");
const asyncHandler_1 = require("../utils/asyncHandler");
const errorHandler_1 = require("../middlewares/errorHandler");
exports.login = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new errorHandler_1.ValidationError('Email y contraseña son requeridos');
    }
    const usuario = await (0, Usuario_1.buscarPorEmail)(email.toLowerCase().trim());
    if (!usuario || !usuario.estado) {
        throw new errorHandler_1.UnauthorizedError('Credenciales inválidas');
    }
    const passwordValido = await (0, passwords_1.comparePassword)(password, usuario.password_hash);
    if (!passwordValido) {
        await (0, Usuario_1.registrarIntentoFallido)(usuario.id);
        await (0, LogAuditoria_1.registrarAuditoria)({
            usuarioId: usuario.id,
            accion: 'LOGIN_FALLIDO',
            ipOrigen: req.ip,
        });
        throw new errorHandler_1.UnauthorizedError('Credenciales inválidas');
    }
    await (0, Usuario_1.registrarLogin)(usuario.id);
    await (0, LogAuditoria_1.registrarAuditoria)({ usuarioId: usuario.id, accion: 'LOGIN', ipOrigen: req.ip });
    const payload = { userId: usuario.id, email: usuario.email, rol: usuario.rol };
    const accessToken = (0, jwt_1.generateAccessToken)(payload);
    const refreshToken = (0, jwt_1.generateRefreshToken)(payload);
    res.json({
        success: true,
        data: {
            accessToken,
            refreshToken,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol,
            },
        },
    });
});
exports.refresh = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        throw new errorHandler_1.ValidationError('Refresh token requerido');
    }
    let payload;
    try {
        payload = (0, jwt_1.verifyRefreshToken)(refreshToken);
    }
    catch {
        throw new errorHandler_1.UnauthorizedError('Refresh token inválido o expirado');
    }
    const usuario = await (0, Usuario_1.buscarPorId)(payload.userId);
    if (!usuario || !usuario.estado) {
        throw new errorHandler_1.UnauthorizedError('Usuario no válido');
    }
    const nuevoAccessToken = (0, jwt_1.generateAccessToken)({
        userId: usuario.id,
        email: usuario.email,
        rol: usuario.rol,
    });
    res.json({ success: true, data: { accessToken: nuevoAccessToken } });
});
exports.me = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const usuario = await (0, Usuario_1.buscarPorId)(req.usuario.userId);
    if (!usuario) {
        throw new errorHandler_1.UnauthorizedError('Usuario no encontrado');
    }
    res.json({
        success: true,
        data: {
            id: usuario.id,
            nombre: usuario.nombre,
            email: usuario.email,
            rol: usuario.rol,
        },
    });
});
exports.logout = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    res.json({ success: true, data: { message: 'Sesión cerrada correctamente' } });
});
exports.cambiarPassword = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { passwordActual, passwordNueva } = req.body;
    if (!passwordActual || !passwordNueva) {
        throw new errorHandler_1.ValidationError('Contraseña actual y nueva son requeridas');
    }
    if (!(0, validators_1.validatePassword)(passwordNueva)) {
        throw new errorHandler_1.ValidationError('La nueva contraseña debe tener mínimo 8 caracteres, mayúscula, minúscula, número y carácter especial');
    }
    const usuario = await (0, Usuario_1.buscarPorId)(req.usuario.userId);
    if (!usuario) {
        throw new errorHandler_1.UnauthorizedError();
    }
    const valido = await (0, passwords_1.comparePassword)(passwordActual, usuario.password_hash);
    if (!valido) {
        throw new errorHandler_1.ValidationError('La contraseña actual es incorrecta');
    }
    const nuevoHash = await (0, passwords_1.hashPassword)(passwordNueva);
    await (0, Usuario_1.actualizarPassword)(usuario.id, nuevoHash);
    await (0, LogAuditoria_1.registrarAuditoria)({
        usuarioId: usuario.id,
        accion: 'UPDATE',
        tablaAfectada: 'usuarios',
        registroId: usuario.id,
        ipOrigen: req.ip,
    });
    res.json({ success: true, data: { message: 'Contraseña actualizada correctamente' } });
});
