"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const fetchAdminOrderCompleted = async (props) => {
    try {
        console.log("Enviando push (adminOrderCompleted) ", props);
        const response = await axios_1.default.post("https://enterprise-112api.chat4sales.com.br/w/a14f4536-ce06-4a38-821b-869e1d4fadf3", props);
        console.log("Resposta chat4Sales ", response);
        return response;
    }
    catch (error) {
        console.error("Erro ao buscar o CEP:", error);
        return null;
    }
};
exports.default = fetchAdminOrderCompleted;
