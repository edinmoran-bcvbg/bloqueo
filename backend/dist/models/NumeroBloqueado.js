"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.crearBloqueo = crearBloqueo;
exports.listarTodos = listarTodos;
exports.buscarPorId = buscarPorId;
exports.marcarSincronizado = marcarSincronizado;
const database_1 = __importDefault(require("../config/database"));
const HORAS_BLOQUEO = 48;
async function crearBloqueo(data) {
    const result = await database_1.default.query(`INSERT INTO numeros_bloqueados (numero_telefono, razon, usuario_id, fecha_expiracion)
     VALUES ($1, $2, $3, CURRENT_TIMESTAMP + INTERVAL '${HORAS_BLOQUEO} hours')
     RETURNING *`, [data.numeroTelefono, data.razon, data.usuarioId]);
    return result.rows[0];
}
async function listarTodos() {
    const result = await database_1.default.query(`SELECT b.*, u.nombre AS reportado_por, (b.fecha_expiracion > CURRENT_TIMESTAMP) AS vigente
     FROM numeros_bloqueados b
     JOIN usuarios u ON u.id = b.usuario_id
     ORDER BY b.fecha_bloqueo DESC`);
    return result.rows;
}
async function buscarPorId(id) {
    const result = await database_1.default.query('SELECT * FROM numeros_bloqueados WHERE id = $1', [id]);
    return result.rows[0] || null;
}
async function marcarSincronizado(id, data) {
    await database_1.default.query(`UPDATE numeros_bloqueados
     SET sincronizado_externo = $2, fecha_sincronizado = CURRENT_TIMESTAMP, error_sincronizacion = $3
     WHERE id = $1`, [id, data.exito, data.error || null]);
}
