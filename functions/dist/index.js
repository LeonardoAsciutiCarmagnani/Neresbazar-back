"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const api_1 = require("./api");
const https_1 = require("firebase-functions/v2/https");
const app = (0, express_1.default)();
// Configuração específica do CORS para Firebase Functions
const corsOptions = {
    origin: [
        "http://localhost:5173",
        "http://localhost:3000",
        "https://neres-bazar.web.app", // Seu domínio de produção
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    optionsSuccessStatus: 200,
};
// Aplicar CORS como middleware
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
// Middleware para logs
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});
// Adicionar headers CORS em todas as rotas
app.use((req, res, next) => {
    res.set("Access-Control-Allow-Origin", corsOptions.origin);
    res.set("Access-Control-Allow-Methods", corsOptions.methods.join(","));
    res.set("Access-Control-Allow-Headers", corsOptions.allowedHeaders.join(","));
    res.set("Access-Control-Allow-Credentials", "true");
    if (req.method === "OPTIONS") {
        res.status(200).send();
        return;
    }
    next();
});
app.get("/v1/products", api_1.getProducts);
app.post("/v1/create-user", api_1.createUser);
exports.api = (0, https_1.onRequest)(app);
console.log("API initialization started");
process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection:", reason);
});
