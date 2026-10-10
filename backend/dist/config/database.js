"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
const pg_1 = require("pg");
const environment_1 = require("./environment");
exports.pool = new pg_1.Pool({
    host: environment_1.config.db.host,
    port: environment_1.config.db.port,
    user: environment_1.config.db.user,
    password: environment_1.config.db.password,
    database: environment_1.config.db.database,
});
exports.pool.on('error', (err) => {
    console.error('[DB] Error inesperado en cliente inactivo', err);
});
exports.default = exports.pool;
