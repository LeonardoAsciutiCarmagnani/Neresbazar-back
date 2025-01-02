"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchProducts = void 0;
const axios_1 = __importDefault(require("axios"));
const fetchToken_1 = require("./fetchToken");
const fetchProducts = async (retries = 3 // Limite de tentativas para evitar recursão infinita
) => {
    var _a, _b;
    try {
        let token = await (0, fetchToken_1.fetchToken)();
        const response = await axios_1.default.get("http://ms-ecommerce.hiper.com.br/api/v1/produtos/pontoDeSincronizacao?pontoDeSincronizacao=0", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            timeout: 10000,
        });
        return response.data;
    }
    catch (error) {
        if (axios_1.default.isAxiosError(error)) {
            // Trata erros de autenticação
            if (((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) === 401 && retries > 0) {
                console.warn("Token expirado. Tentando obter um novo token...");
                const newToken = await (0, fetchToken_1.fetchToken)();
                fetchToken_1.tokenCache.set("token", newToken);
                return (0, exports.fetchProducts)(retries - 1); // Reduz o número de tentativas restantes
            }
            else {
                console.error("Erro de API Hiper:", ((_b = error.response) === null || _b === void 0 ? void 0 : _b.data) || error.message);
            }
        }
        else {
            console.error("Erro inesperado:", error);
        }
        // Retorna um objeto vazio em caso de falha (evita quebrar o fluxo no servidor)
        return {
            pontoDeSincronizacao: 0,
            produtos: [],
            errors: [error],
            message: "Erro ao buscar produtos",
        };
    }
};
exports.fetchProducts = fetchProducts;
