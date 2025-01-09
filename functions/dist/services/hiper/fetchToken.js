"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenCache = exports.fetchToken = void 0;
const axios_1 = __importDefault(require("axios"));
const tokenCache_1 = require("../others/tokenCache");
Object.defineProperty(exports, "tokenCache", { enumerable: true, get: function () { return tokenCache_1.tokenCache; } });
const env_1 = __importDefault(require("../../config/env"));
let tokenPromise = null;
const fetchToken = async () => {
    let token = tokenCache_1.tokenCache.get("token");
    if (!token) {
        if (!tokenPromise) {
            tokenPromise = new Promise(async (resolve, reject) => {
                try {
                    const response = await axios_1.default.get(`${env_1.default.HIPER_API_URL}/auth/gerar-token/${env_1.default.API_SECRET_KEY}`);
                    token = response.data.token;
                    if (typeof token === "string") {
                        tokenCache_1.tokenCache.set("token", token);
                        console.log("Novo token gerado e armazenado no cache.");
                        resolve(token);
                    }
                    else {
                        reject(new Error("Token gerado não é uma string válida."));
                    }
                }
                catch (error) {
                    reject(new Error(`Erro ao gerar o token: ${error.message || error}`));
                }
                finally {
                    tokenPromise = null;
                }
            });
        }
        token = await tokenPromise;
    }
    else {
        console.log("Token recuperado do cache.");
    }
    return token;
};
exports.fetchToken = fetchToken;
