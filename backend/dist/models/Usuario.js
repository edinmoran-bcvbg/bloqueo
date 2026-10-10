"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.crearUsuario = crearUsuario;
exports.buscarPorEmail = buscarPorEmail;
exports.buscarPorId = buscarPorId;
exports.listarUsuarios = listarUsuarios;
exports.actualizarUsuario = actualizarUsuario;
exports.actualizarPassword = actualizarPassword;
exports.eliminarUsuario = eliminarUsuario;
exports.registrarLogin = registrarLogin;
exports.registrarIntentoFallido = registrarIntentoFallido;
exports.contarSuperadmins = contarSuperadmins;
const database_1 = __importDefault(require("../config/database"));
const COLUMNAS_PUBLICAS = `id, nombre, email, rol, estado, fecha_creacion, fecha_ultima_login`;
async function crearUsuario(data) {
    const result = await database_1.default.query(`INSERT INTO usuarios (nombre, email, password_hash, rol)
     VALUES ($1, $2, $3, $4)
     RETURNING ${COLUMNAS_PUBLICAS}`, [data.nombre, data.email, data.passwordHash, data.rol]);
    return result.rows[0];
}
async function buscarPorEmail(email) {
    const result = await database_1.default.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    return result.rows[0] || null;
}
async function buscarPorId(id) {
    const result = await database_1.default.query('SELECT * FROM usuarios WHERE id = $1', [id]);
    return result.rows[0] || null;
}
async function listarUsuarios() {
    const result = await database_1.default.query(`SELECT ${COLUMNAS_PUBLICAS} FROM usuarios ORDER BY fecha_creacion DESC`);
    return result.rows;
}
async function actualizarUsuario(id, data) {
    const campos = [];
    const valores = [];
    let idx = 1;
    if (data.nombre !== undefined) {
        campos.push(`nombre = $${idx++}`);
        valores.push(data.nombre);
    }
    if (data.rol !== undefined) {
        campos.push(`rol = $${idx++}`);
        valores.push(data.rol);
    }
    if (data.estado !== undefined) {
        campos.push(`estado = $${idx++}`);
        valores.push(data.estado);
    }
    if (campos.length === 0) {
        return buscarPorId(id);
    }
    valores.push(id);
    const result = await database_1.default.query(`UPDATE usuarios SET ${campos.join(', ')} WHERE id = $${idx} RETURNING ${COLUMNAS_PUBLICAS}`, valores);
    return result.rows[0] || null;
}
async function actualizarPassword(id, passwordHash) {
    await database_1.default.query('UPDATE usuarios SET password_hash = $1 WHERE id = $2', [passwordHash, id]);
}
async function eliminarUsuario(id) {
    const result = await database_1.default.query('DELETE FROM usuarios WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
}
async function registrarLogin(id) {
    await database_1.default.query('UPDATE usuarios SET fecha_ultima_login = CURRENT_TIMESTAMP, intentos_fallidos = 0 WHERE id = $1', [id]);
}
async function registrarIntentoFallido(id) {
    await database_1.default.query('UPDATE usuarios SET intentos_fallidos = intentos_fallidos + 1 WHERE id = $1', [id]);
}
async function contarSuperadmins() {
    const result = await database_1.default.query(`SELECT COUNT(*)::int AS total FROM usuarios WHERE rol = 'superadmin'`);
    return result.rows[0].total;
}
