"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const fetchCEP = async (cep) => {
    try {
<<<<<<< HEAD
        console.log(`Buscando CEP: ${cep}`);
=======
        console.log("Iniciando busca Api ViaCEP: ", cep);
>>>>>>> 996dbd642f3f52aede412ceefcb568ea416f67e5
        const response = await axios_1.default.get(`https://viacep.com.br/ws/${cep}/json/`);
        console.log("Resultado ViaCEP: ", response.data);
        if (response.data.erro) {
            console.warn("CEP não encontrado.");
            return null;
        }
        const data = {
            ibge: response.data.ibge ? parseInt(response.data.ibge, 10) : null,
            logradouro: response.data.logradouro || "",
            bairro: response.data.bairro || "",
            localidade: response.data.localidade || "",
            uf: response.data.uf || "",
        };
        return data;
    }
    catch (error) {
        console.error("Erro ao buscar o CEP:", error);
        return null;
    }
};
exports.default = fetchCEP;
