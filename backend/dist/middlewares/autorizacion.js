"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.autorizar = autorizar;
const errorHandler_1 = require("./errorHandler");
function autorizar(...rolesPermitidos) {
    return (req, res, next) => {
        if (!req.usuario) {
            return next(new errorHandler_1.UnauthorizedError());
        }
        if (!rolesPermitidos.includes(req.usuario.rol)) {
            return next(new errorHandler_1.ForbiddenError('No tienes permisos para realizar esta acción'));
        }
        next();
    };
}
