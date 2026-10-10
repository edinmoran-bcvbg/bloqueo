"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eliminar = exports.actualizar = exports.crear = exports.listar = void 0;
const Usuario_1 = require("../models/Usuario");
const LogAuditoria_1 = require("../models/LogAuditoria");
const passwords_1 = require("../utils/passwords");
const validators_1 = require("../utils/validators");
const asyncHandler_1 = require("../utils/asyncHandler");
const errorHandler_1 = require("../middlewares/errorHandler");
const emailService_1 = require("../services/emailService");
exports.listar = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const usuarios = await (0, Usuario_1.listarUsuarios)();
    res.json({ success: true, data: usuarios });
});
exports.crear = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { nombre, email, rol } = req.body;
    if (!nombre || !email || !rol) {
        throw new errorHandler_1.ValidationError('Nombre, email y rol son requeridos');
    }
    if (!(0, validators_1.validateEmail)(email)) {
        throw new errorHandler_1.ValidationError('Email inválido');
    }
    if (!(0, validators_1.validateRol)(rol)) {
        throw new errorHandler_1.ValidationError('Rol inválido');
    }
    const existente = await (0, Usuario_1.buscarPorEmail)(email.toLowerCase().trim());
    if (existente) {
        throw new errorHandler_1.ConflictError('Ya existe un usuario con ese email');
    }
    const passwordTemporal = (0, passwords_1.generateRandomPassword)();
    const passwordHash = await (0, passwords_1.hashPassword)(passwordTemporal);
    const usuario = await (0, Usuario_1.crearUsuario)({
        nombre,
        email: email.toLowerCase().trim(),
        passwordHash,
        rol,
    });
    await (0, LogAuditoria_1.registrarAuditoria)({
        usuarioId: req.usuario.userId,
        accion: 'CREATE',
        tablaAfectada: 'usuarios',
        registroId: usuario.id,
        datosNuevo: { nombre, email, rol },
        ipOrigen: req.ip,
    });
    (0, emailService_1.enviarCredencialesIniciales)({ email: usuario.email, nombre: usuario.nombre, passwordTemporal });
    res.status(201).json({ success: true, data: usuario });
});
exports.actualizar = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const { nombre, rol, estado } = req.body;
    if (rol !== undefined && !(0, validators_1.validateRol)(rol)) {
        throw new errorHandler_1.ValidationError('Rol inválido');
    }
    const usuarioExistente = await (0, Usuario_1.buscarPorId)(id);
    if (!usuarioExistente) {
        throw new errorHandler_1.NotFoundError('Usuario no encontrado');
    }
    if (usuarioExistente.rol === 'superadmin' && rol && rol !== 'superadmin') {
        const totalSuperadmins = await (0, Usuario_1.contarSuperadmins)();
        if (totalSuperadmins <= 1) {
            throw new errorHandler_1.ForbiddenError('Debe existir al menos un superadmin en el sistema');
        }
    }
    const actualizado = await (0, Usuario_1.actualizarUsuario)(id, { nombre, rol, estado });
    await (0, LogAuditoria_1.registrarAuditoria)({
        usuarioId: req.usuario.userId,
        accion: 'UPDATE',
        tablaAfectada: 'usuarios',
        registroId: id,
        datosAnterior: usuarioExistente,
        datosNuevo: { nombre, rol, estado },
        ipOrigen: req.ip,
    });
    res.json({ success: true, data: actualizado });
});
exports.eliminar = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const usuarioExistente = await (0, Usuario_1.buscarPorId)(id);
    if (!usuarioExistente) {
        throw new errorHandler_1.NotFoundError('Usuario no encontrado');
    }
    if (usuarioExistente.rol === 'superadmin') {
        const totalSuperadmins = await (0, Usuario_1.contarSuperadmins)();
        if (totalSuperadmins <= 1) {
            throw new errorHandler_1.ForbiddenError('No se puede eliminar el único superadmin del sistema');
        }
    }
    if (id === req.usuario.userId) {
        throw new errorHandler_1.ForbiddenError('No puedes eliminar tu propia cuenta');
    }
    await (0, Usuario_1.eliminarUsuario)(id);
    await (0, LogAuditoria_1.registrarAuditoria)({
        usuarioId: req.usuario.userId,
        accion: 'DELETE',
        tablaAfectada: 'usuarios',
        registroId: id,
        datosAnterior: usuarioExistente,
        ipOrigen: req.ip,
    });
    res.json({ success: true, data: { message: 'Usuario eliminado correctamente' } });
});
