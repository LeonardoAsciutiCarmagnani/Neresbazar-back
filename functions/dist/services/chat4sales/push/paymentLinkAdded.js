"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const fetchPaymentLinkAdded = async (props) => {
    try {
        console.log("Enviando push (paymentLinkAdded) ", props);
        const response = await axios_1.default.post("https://enterprise-112api.chat4sales.com.br/w/f72a077a-801d-4235-94e7-a2b0a0873d46", props);
        console.log("Resposta chat4Sales ", response);
        return response;
    }
    catch (error) {
        console.error("Erro ao enviar push:", error);
        return null;
    }
};
exports.default = fetchPaymentLinkAdded;
