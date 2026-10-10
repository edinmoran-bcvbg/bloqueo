"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConflictError = exports.NotFoundError = exports.ForbiddenError = exports.UnauthorizedError = exports.ValidationError = void 0;
exports.errorHandler = errorHandler;
exports.notFoundHandler = notFoundHandler;
function errorHandler(err, req, res, next) {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Error interno del servidor';
    if (statusCode >= 500) {
        console.error(`[ERROR] ${statusCode}: ${message}`);
    }
    res.status(statusCode).json({
        success: false,
        error: {
            statusCode,
            message,
        },
    });
}
function notFoundHandler(req, res) {
    res.status(404).json({
        success: false,
        error: { statusCode: 404, message: 'Ruta no encontrada' },
    });
}
class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.statusCode = 400;
        this.name = 'ValidationError';
    }
}
exports.ValidationError = ValidationError;
class UnauthorizedError extends Error {
    constructor(message = 'No autorizado') {
        super(message);
        this.statusCode = 401;
        this.name = 'UnauthorizedError';
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends Error {
    constructor(message = 'Acceso denegado') {
        super(message);
        this.statusCode = 403;
        this.name = 'ForbiddenError';
    }
}
exports.ForbiddenError = ForbiddenError;
class NotFoundError extends Error {
    constructor(message = 'No encontrado') {
        super(message);
        this.statusCode = 404;
        this.name = 'NotFoundError';
    }
}
exports.NotFoundError = NotFoundError;
class ConflictError extends Error {
    constructor(message = 'Conflicto con el estado actual del recurso') {
        super(message);
        this.statusCode = 409;
        this.name = 'ConflictError';
    }
}
exports.ConflictError = ConflictError;
