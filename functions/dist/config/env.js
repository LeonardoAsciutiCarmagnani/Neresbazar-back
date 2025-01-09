"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/config/env.ts
const dotenv_1 = require("dotenv");
const zod_1 = require("zod");
// Garante que o .env seja carregado
(0, dotenv_1.config)();
// Define o schema com valores padrão opcionais
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z
        .enum(["development", "production"])
        .optional()
        .default("development"),
    CORS_ORIGIN: zod_1.z.string().optional().default("*"),
    HIPER_API_URL: zod_1.z
        .string()
        .optional()
        .default("http://ms-ecommerce.hiper.com.br/api/v1"),
    API_SECRET_KEY: zod_1.z.string({
        required_error: "API_SECRET_KEY é obrigatória no arquivo .env",
    }),
});
// Faz o parse das variáveis de ambiente
const env = envSchema.parse(process.env);
// Exportação padrão
exports.default = env;
// Se ocorrer erro no parse, o processo será encerrado
if (!env.API_SECRET_KEY) {
    console.error("API_SECRET_KEY é obrigatória no arquivo .env");
    process.exit(1);
}
