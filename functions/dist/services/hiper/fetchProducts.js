"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.productService = void 0;
const axios_1 = __importDefault(require("axios"));
const fetchToken_1 = require("./fetchToken");
const env_1 = __importDefault(require("../../config/env"));
// Constants
const API_CONFIG = {
    baseURL: env_1.default.HIPER_API_URL,
    timeout: 10000,
};
class ProductService {
    constructor() {
        this.axiosInstance = axios_1.default.create(API_CONFIG);
        this.setupInterceptors();
    }
    setupInterceptors() {
        this.axiosInstance.interceptors.request.use(async (config) => {
            const token = await (0, fetchToken_1.fetchToken)();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        }, (error) => Promise.reject(error));
    }
    async fetchProducts(pontoDeSincronizacao = 0) {
        var _a;
        try {
            const response = await this.axiosInstance.get(`/produtos/pontoDeSincronizacao`, {
                params: { pontoDeSincronizacao },
            });
            return response.data;
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error)) {
                console.error("Erro na requisição:", ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
            }
            else {
                console.error("Erro inesperado:", error);
            }
            return this.createErrorResponse(error);
        }
    }
    createErrorResponse(error) {
        return {
            pontoDeSincronizacao: 0,
            produtos: [],
            errors: [error],
            message: "Erro ao buscar produtos",
        };
    }
}
// Export singleton instance
exports.productService = new ProductService();
