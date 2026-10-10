"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registrarAuditoria = registrarAuditoria;
exports.listarAuditoria = listarAuditoria;
const database_1 = __importDefault(require("../config/database"));
async function registrarAuditoria(data) {
    await database_1.default.query(`INSERT INTO log_auditoria
       (usuario_id, accion, tabla_afectada, registro_id, datos_anterior, datos_nuevo, ip_origen)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`, [
        data.usuarioId,
        data.accion,
        data.tablaAfectada || null,
        data.registroId || null,
        data.datosAnterior ? JSON.stringify(data.datosAnterior) : null,
        data.datosNuevo ? JSON.stringify(data.datosNuevo) : null,
        data.ipOrigen || null,
    ]);
}
async function listarAuditoria(limite = 100) {
    const result = await database_1.default.query(`SELECT l.*, u.nombre AS usuario_nombre, u.email AS usuario_email
     FROM log_auditoria l
     LEFT JOIN usuarios u ON u.id = l.usuario_id
     ORDER BY l.fecha_hora DESC
     LIMIT $1`, [limite]);
    return result.rows;
}
