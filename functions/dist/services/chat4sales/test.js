"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testMessage = void 0;
const axios_1 = __importDefault(require("axios"));
async function testMessage(req, res) {
    const reponse = axios_1.default.post("https://enterprise-112api.chat4sales.com.br/w/29aecdc3-3524-4ae0-9a64-d9d8efce70b4", {
        body: {
            cpf: "12345678912",
            pedido: "ABC123",
            whatsapp: "11994217053",
        },
    });
    return res;
}
exports.testMessage = testMessage;
