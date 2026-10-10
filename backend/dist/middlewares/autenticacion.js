"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.autenticar = autenticar;
const jwt_1 = require("../utils/jwt");
const errorHandler_1 = require("./errorHandler");
function autenticar(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new errorHandler_1.UnauthorizedError('Token de acceso no proporcionado'));
    }
    const token = authHeader.split(' ')[1];
    try {
        const payload = (0, jwt_1.verifyAccessToken)(token);
        req.usuario = payload;
        next();
    }
    catch (error) {
        next(new errorHandler_1.UnauthorizedError('Token de acceso inválido o expirado'));
    }
}
