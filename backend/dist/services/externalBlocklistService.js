"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sincronizarBloqueoExterno = sincronizarBloqueoExterno;
const environment_1 = require("../config/environment");
async function sincronizarBloqueoExterno(numeroTelefono, fechaExpiracion) {
    if (!environment_1.config.externalBlocklist.enabled) {
        console.warn(`[ExternalBlocklist] Integración no configurada. Pendiente bloquear ${numeroTelefono} hasta ${fechaExpiracion.toISOString()} en la central de llamadas.`);
        return { exito: false, error: 'Integración externa no configurada todavía' };
    }
    // --------------------------------------------------------------------
    // TODO: implementar la conexión real aquí una vez se tengan los datos
    // de la base de datos/API de la central de llamadas. Ejemplo orientativo
    // si resulta ser una base de datos relacional accesible por red:
    //
    //   const externalPool = new Pool({
    //     host: config.externalBlocklist.dbHost,
    //     port: config.externalBlocklist.dbPort,
    //     user: config.externalBlocklist.dbUser,
    //     password: config.externalBlocklist.dbPassword,
    //     database: config.externalBlocklist.dbName,
    //   });
    //   await externalPool.query(
    //     `UPDATE ${config.externalBlocklist.tabla}
    //      SET ${config.externalBlocklist.columnaBloqueadoHasta} = $2
    //      WHERE ${config.externalBlocklist.columnaTelefono} = $1`,
    //     [numeroTelefono, fechaExpiracion]
    //   );
    // --------------------------------------------------------------------
    console.error('[ExternalBlocklist] EXTERNAL_BLOCKLIST_ENABLED=true pero falta implementar la conexión real.');
    return { exito: false, error: 'Integración marcada como habilitada pero sin implementar' };
}
