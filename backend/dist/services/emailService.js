"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificarBloqueoRegistrado = notificarBloqueoRegistrado;
exports.enviarCredencialesIniciales = enviarCredencialesIniciales;
const nodemailer_1 = __importDefault(require("nodemailer"));
const environment_1 = require("../config/environment");
let transporter = null;
function getTransporter() {
    if (!environment_1.config.smtp.host || !environment_1.config.smtp.user || !environment_1.config.smtp.password) {
        console.warn('[EmailService] SMTP no configurado. Los correos no se enviarán.');
        return null;
    }
    if (!transporter) {
        transporter = nodemailer_1.default.createTransport({
            host: environment_1.config.smtp.host,
            port: environment_1.config.smtp.port,
            secure: environment_1.config.smtp.port === 465,
            auth: {
                user: environment_1.config.smtp.user,
                pass: environment_1.config.smtp.password,
            },
        });
    }
    return transporter;
}
const REINTENTOS_MS = [0, 5 * 60 * 1000, 30 * 60 * 1000, 2 * 60 * 60 * 1000];
async function enviarConReintentos(mensaje, intento = 0) {
    const transport = getTransporter();
    if (!transport)
        return;
    try {
        await transport.sendMail({
            from: `"${environment_1.config.smtp.fromName}" <${environment_1.config.smtp.fromEmail}>`,
            to: mensaje.destinatarios.join(', '),
            subject: mensaje.asunto,
            html: mensaje.html,
        });
    }
    catch (error) {
        console.error(`[EmailService] Fallo al enviar correo (intento ${intento + 1}):`, error);
        if (intento + 1 < REINTENTOS_MS.length) {
            const espera = REINTENTOS_MS[intento + 1];
            setTimeout(() => {
                enviarConReintentos(mensaje, intento + 1);
            }, espera);
        }
        else {
            console.error('[EmailService] Todos los reintentos fallaron para:', mensaje.asunto);
            if (environment_1.config.smtp.adminEmails.length > 0) {
                transport
                    .sendMail({
                    from: `"${environment_1.config.smtp.fromName}" <${environment_1.config.smtp.fromEmail}>`,
                    to: environment_1.config.smtp.adminEmails.join(', '),
                    subject: '[ALERTA] Fallo de envío de correo',
                    html: `<p>El envío del correo "${mensaje.asunto}" falló tras 4 intentos.</p>`,
                })
                    .catch(() => undefined);
            }
        }
    }
}
function notificarBloqueoRegistrado(data) {
    if (environment_1.config.smtp.adminEmails.length === 0)
        return;
    const zonaHoraria = { timeZone: 'America/Guatemala' };
    const fechaBloqueo = data.fechaBloqueo.toLocaleString('es-GT', zonaHoraria);
    const fechaExpiracion = data.fechaExpiracion.toLocaleString('es-GT', zonaHoraria);
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
      <div style="background:#111111; padding:16px; text-align:center;">
        <span style="color:#F4B400; font-weight:bold; font-size:18px;">Bomberos Voluntarios</span>
      </div>
      <div style="border:1px solid #eee; border-top:4px solid #C8102E; padding:24px;">
        <h2 style="color:#C8102E; margin-top:0;">Número Bloqueado por 48 Horas</h2>
        <p>Un bombero registró un número como llamada falsa/broma y se solicitó su bloqueo:</p>
        <table style="width:100%; border-collapse: collapse;">
          <tr><td style="padding:6px 0; vertical-align:top;"><strong>📞 Número:</strong></td><td>${data.numeroTelefono}</td></tr>
          <tr><td style="padding:6px 0; vertical-align:top;"><strong>📝 Razón:</strong></td><td>${data.razon}</td></tr>
          <tr><td style="padding:6px 0; vertical-align:top;"><strong>👤 Reportado por:</strong></td><td>${data.reportadoPor}</td></tr>
          <tr><td style="padding:6px 0; vertical-align:top;"><strong>📅 Fecha de bloqueo:</strong></td><td>${fechaBloqueo}</td></tr>
          <tr><td style="padding:6px 0; vertical-align:top;"><strong>⏳ Bloqueado hasta:</strong></td><td>${fechaExpiracion}</td></tr>
        </table>
        <p style="margin-top:16px;">El bloqueo vence automáticamente 48 horas después de haberse registrado.</p>
      </div>
      <p style="text-align:center; color:#888; font-size:12px; margin-top:16px;">Sistema de Bomberos Voluntarios</p>
    </div>
  `;
    enviarConReintentos({
        destinatarios: environment_1.config.smtp.adminEmails,
        asunto: `[Bomberos Voluntarios] Número bloqueado 48h: ${data.numeroTelefono}`,
        html,
    });
}
function enviarCredencialesIniciales(data) {
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
      <div style="background:#111111; padding:16px; text-align:center;">
        <span style="color:#F4B400; font-weight:bold; font-size:18px;">Bomberos Voluntarios</span>
      </div>
      <div style="border:1px solid #eee; border-top:4px solid #C8102E; padding:24px;">
        <h2 style="color:#C8102E; margin-top:0;">Bienvenido(a), ${data.nombre}</h2>
        <p>Se ha creado una cuenta para ti en el Sistema de Registro de Llamadas Falsas.</p>
        <p><strong>Correo:</strong> ${data.email}<br/>
           <strong>Contraseña temporal:</strong> ${data.passwordTemporal}</p>
        <p>Por seguridad, cambia tu contraseña en tu primer inicio de sesión.</p>
      </div>
    </div>
  `;
    enviarConReintentos({
        destinatarios: [data.email],
        asunto: '[Bomberos Voluntarios] Tu cuenta ha sido creada',
        html,
    });
}
