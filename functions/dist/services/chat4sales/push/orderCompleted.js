"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const fetchOrderCompleted = async (props) => {
    try {
        console.log("Enviando push (OrderCompleted) ", props);
        const response = await axios_1.default.post("https://enterprise-112api.chat4sales.com.br/w/42d9bc92-b7d2-46cd-8b24-4f029708116a", props);
        console.log("Resposta chat4Sales ", response);
        return response;
    }
    catch (error) {
        console.error("Erro ao enviar push:", error);
        return null;
    }
};
exports.default = fetchOrderCompleted;
