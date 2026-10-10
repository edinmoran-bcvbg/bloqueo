"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const environment_1 = require("./config/environment");
const Usuario_1 = require("./models/Usuario");
const passwords_1 = require("./utils/passwords");
const validators_1 = require("./utils/validators");
const database_1 = __importDefault(require("./config/database"));
async function seed() {
    const { nombre, email } = environment_1.config.superadmin;
    let { password } = environment_1.config.superadmin;
    if (!(0, validators_1.validateEmail)(email)) {
        console.error('[Seed] SUPERADMIN_EMAIL inválido en .env');
        process.exit(1);
    }
    const existente = await (0, Usuario_1.buscarPorEmail)(email.toLowerCase().trim());
    if (existente) {
        console.log(`[Seed] Ya existe un usuario con el email ${email}. No se crea de nuevo.`);
        await database_1.default.end();
        return;
    }
    let generada = false;
    if (!password) {
        password = (0, passwords_1.generateRandomPassword)();
        generada = true;
    }
    const passwordHash = await (0, passwords_1.hashPassword)(password);
    const usuario = await (0, Usuario_1.crearUsuario)({
        nombre,
        email: email.toLowerCase().trim(),
        passwordHash,
        rol: 'superadmin',
    });
    console.log('[Seed] SuperAdmin creado exitosamente:');
    console.log(`  Email: ${usuario.email}`);
    if (generada) {
        console.log(`  Contraseña temporal generada: ${password}`);
        console.log('  ⚠️  Guarda esta contraseña, no se mostrará de nuevo. Cámbiala en tu primer login.');
    }
    else {
        console.log('  Contraseña: la definida en SUPERADMIN_PASSWORD (.env)');
        if (!(0, validators_1.validatePassword)(password)) {
            console.log('  ⚠️  Esta contraseña NO cumple la política de seguridad (mayúscula/minúscula/número/especial). Úsala solo para pruebas.');
        }
    }
    await database_1.default.end();
}
seed().catch((err) => {
    console.error('[Seed] Error al crear el SuperAdmin inicial:', err);
    process.exit(1);
});
