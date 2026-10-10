"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.crear = exports.listar = void 0;
const NumeroBloqueado_1 = require("../models/NumeroBloqueado");
const Usuario_1 = require("../models/Usuario");
const LogAuditoria_1 = require("../models/LogAuditoria");
const validators_1 = require("../utils/validators");
const asyncHandler_1 = require("../utils/asyncHandler");
const errorHandler_1 = require("../middlewares/errorHandler");
const emailService_1 = require("../services/emailService");
const externalBlocklistService_1 = require("../services/externalBlocklistService");
exports.listar = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const bloqueos = await (0, NumeroBloqueado_1.listarTodos)();
    res.json({ success: true, data: bloqueos });
});
exports.crear = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { numeroTelefono, razon } = req.body;
    if (!numeroTelefono || !razon) {
        throw new errorHandler_1.ValidationError('El número de teléfono y la razón son requeridos');
    }
    if (!(0, validators_1.validatePhoneNumber)(numeroTelefono)) {
        throw new errorHandler_1.ValidationError('Formato de número de teléfono inválido (8-15 dígitos)');
    }
    if (typeof razon !== 'string' || razon.trim().length < 3) {
        throw new errorHandler_1.ValidationError('La razón debe tener al menos 3 caracteres');
    }
    const bloqueo = await (0, NumeroBloqueado_1.crearBloqueo)({
        numeroTelefono,
        razon: razon.trim(),
        usuarioId: req.usuario.userId,
    });
    await (0, LogAuditoria_1.registrarAuditoria)({
        usuarioId: req.usuario.userId,
        accion: 'CREATE',
        tablaAfectada: 'numeros_bloqueados',
        registroId: bloqueo.id,
        datosNuevo: bloqueo,
        ipOrigen: req.ip,
    });
    const resultadoSync = await (0, externalBlocklistService_1.sincronizarBloqueoExterno)(bloqueo.numero_telefono, bloqueo.fecha_expiracion);
    await (0, NumeroBloqueado_1.marcarSincronizado)(bloqueo.id, { exito: resultadoSync.exito, error: resultadoSync.error });
    const bombero = await (0, Usuario_1.buscarPorId)(req.usuario.userId);
    (0, emailService_1.notificarBloqueoRegistrado)({
        numeroTelefono: bloqueo.numero_telefono,
        razon: bloqueo.razon,
        reportadoPor: bombero?.nombre || req.usuario.email,
        fechaBloqueo: bloqueo.fecha_bloqueo,
        fechaExpiracion: bloqueo.fecha_expiracion,
    });
    res.status(201).json({
        success: true,
        data: { ...bloqueo, sincronizado_externo: resultadoSync.exito },
    });
});
