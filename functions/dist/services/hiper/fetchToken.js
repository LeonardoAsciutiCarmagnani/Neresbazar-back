"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenCache = exports.fetchToken = void 0;
const axios_1 = __importDefault(require("axios"));
const tokenCache_1 = require("../others/tokenCache");
Object.defineProperty(exports, "tokenCache", { enumerable: true, get: function () { return tokenCache_1.tokenCache; } });
let tokenPromise = null;
const fetchToken = async () => {
    let token = tokenCache_1.tokenCache.get("token");
    if (!token) {
        if (!tokenPromise) {
            tokenPromise = new Promise(async (resolve, reject) => {
                try {
                    const response = await axios_1.default.get("https://ms-ecommerce.hiper.com.br/api/v1/auth/gerar-token/10403c54fb456c6559b1f36ce3c9468bfcba012afc80ccb791d0144a3e917b3e");
                    token = response.data.token;
                    if (typeof token === "string") {
                        tokenCache_1.tokenCache.set("token", token);
                        console.log("Novo token gerado e armazenado no cache.");
                        resolve(token);
                    }
                    else {
                        reject("Token gerado não é uma string válida.");
                    }
                }
                catch (error) {
                    reject("Erro ao gerar o token.");
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
