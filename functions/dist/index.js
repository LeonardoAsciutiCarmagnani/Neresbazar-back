"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const https_1 = require("firebase-functions/v2/https");
const api_1 = require("./controllers/api");
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const env_1 = __importDefault(require("./config/env"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
class App {
    constructor() {
        this.app = (0, express_1.default)();
        this.setupMiddlewares();
        this.setupRoutes();
        this.setupErrorHandling();
    }
    setupMiddlewares() {
        this.app.set("trust proxy", true);
        // Security middlewares
        this.app.use((0, helmet_1.default)());
        this.app.use((0, cors_1.default)({
            origin: env_1.default.CORS_ORIGIN,
            methods: ["GET", "POST"],
            allowedHeaders: ["Content-Type", "Authorization"],
            credentials: true,
        }));
        // Request parsing
        this.app.use(express_1.default.json({ limit: "10kb" }));
        // Rate limiting
        const limiter = (0, express_rate_limit_1.default)({
            windowMs: 15 * 60 * 1000,
            max: 100,
            message: "Too many requests from this IP, please try again later",
            keyGenerator: (req) => {
                return req.ip || "unknown-ip";
            },
            validate: { ip: false },
        });
        this.app.use("/v1/", limiter);
        // Logging
        if (env_1.default.NODE_ENV === "development") {
            this.app.use((0, morgan_1.default)("dev"));
        }
        else {
            this.app.use((0, morgan_1.default)("combined"));
        }
        // Custom request logger
        this.app.use((req, res, next) => {
            const timestamp = new Date().toISOString();
            console.log(`[${timestamp}] ${req.method} ${req.url} - IP: ${req.ip || "undefined"}`);
            next();
        });
    }
    setupRoutes() {
        const router = express_1.default.Router();
        // API routes
        router.get("/products", api_1.ProductController.getProducts);
        router.post("/create-user", api_1.UserController.createUser);
        router.post("/check-email", api_1.UserController.checkEmail);
        router.post("/post-order", api_1.OrderController.postOrderSale);
        router.post("/find-CEP", api_1.CEPController.getCEP);
        // Health check route
        router.get("/health", (_, res) => {
            res
                .status(200)
                .json({ status: "ok", timestamp: new Date().toISOString() });
        });
        // Apply routes with version prefix
        this.app.use("/v1", router);
        // Handle 404
        this.app.use((_, res) => {
            res.status(404).json({
                success: false,
                message: "Route not found",
            });
        });
    }
    setupErrorHandling() {
        // Global error handler
        this.app.use(api_1.errorHandler);
        // Unhandled promise rejections
        process.on("unhandledRejection", (reason) => {
            console.error("Unhandled Rejection:", reason);
            // You might want to do some cleanup here
        });
        // Uncaught exceptions
        process.on("uncaughtException", (error) => {
            console.error("Uncaught Exception:", error);
            // You might want to do some cleanup here and exit gracefully
            process.exit(1);
        });
    }
    getApp() {
        return this.app;
    }
}
// Initialize app
const application = new App();
const app = application.getApp();
// Export for Firebase Functions
exports.api = (0, https_1.onRequest)(app);
console.log(`Server started in ${env_1.default.NODE_ENV} mode`);
