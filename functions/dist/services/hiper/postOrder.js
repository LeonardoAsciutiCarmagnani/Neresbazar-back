"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const firebaseConfig_1 = require("../../firebaseConfig");
const fetchToken_1 = require("./fetchToken");
const getLastOrderCode = async () => {
    const collectionRef = firebaseConfig_1.firestore.collection("sales_orders");
    // Consulta ordenada e limitada ao último documento
    const querySnapshot = await collectionRef
        .orderBy("order_code", "desc")
        .limit(1)
        .get();
    let lastOrderNumber = 0;
    if (!querySnapshot.empty) {
        const lastOrder = querySnapshot.docs[0].data();
        const lastOrderCode = lastOrder.order_code || "LV0";
        // Extraindo o número do código (assumindo formato "LV<number>")
        const match = lastOrderCode.match(/LV(\d+)/);
        lastOrderNumber = match ? parseInt(match[1], 10) : 0;
    }
    // Incrementa o número para gerar o próximo código
    const nextOrderCode = `LV${lastOrderNumber + 1}`;
    return nextOrderCode;
};
const storeOrderInFirestore = async (order, codeHiper, userId) => {
    const orderWithClientId = Object.assign(Object.assign({}, order), { IdClient: userId, order_code: codeHiper });
    const docRef = firebaseConfig_1.firestore.collection("sales_orders").doc(order.id);
    await docRef.set(orderWithClientId);
};
const fetchOrderSaleData = async (generatedId) => {
    let token = await (0, fetchToken_1.fetchToken)();
    try {
        const getOrderSaleHiper = await axios_1.default.get(`http://ms-ecommerce.hiper.com.br/api/v1/pedido-de-venda/eventos/${generatedId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        });
        return getOrderSaleHiper.data;
    }
    catch (error) {
        if (axios_1.default.isAxiosError(error) && error.response) {
            console.error("Erro ao buscar dados da venda:", error.response.data);
        }
        else {
            console.error("Erro desconhecido:", error);
        }
        throw error;
    }
};
const postOrderSale = async (orderData, userId) => {
    let token = await (0, fetchToken_1.fetchToken)();
    console.log("OrderData: ", orderData);
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    try {
        console.log("tentando enviar os dados para a hiper");
        const response = await axios_1.default.post("http://ms-ecommerce.hiper.com.br/api/v1/pedido-de-venda/", orderData, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        });
        const generatedId = response.data.id;
        const updatedOrderData = Object.assign(Object.assign({}, orderData), { id: generatedId });
        // Tentativa de buscar o código da venda até que ele não esteja em branco, com limite de 3 tentativas
        let codeOrderHiper = "";
        let attempts = 0;
        const maxAttempts = 3; // Limite de tentativas
        while ((codeOrderHiper === "" || codeOrderHiper.trim() === "") &&
            attempts < maxAttempts) {
            const orderSaleData = await fetchOrderSaleData(generatedId);
            console.log("Retorno do objeto: ", orderSaleData);
            codeOrderHiper = (orderSaleData === null || orderSaleData === void 0 ? void 0 : orderSaleData.codigoDoPedidoDeVenda) || ""; // Garante que pegamos o código ou uma string vazia
            if (codeOrderHiper === "" || codeOrderHiper.trim() === "") {
                attempts++;
                console.log(`Tentativa ${attempts} de ${maxAttempts}: código vazio. Aguardando 3 segundos...`);
                await delay(3000);
            }
        }
        if (codeOrderHiper === "" || codeOrderHiper.trim() === "") {
            console.log("Não foi possível obter o código do pedido de venda. Gerando manualmente...");
            codeOrderHiper = await getLastOrderCode();
        }
        console.log("Código do pedido de venda obtido ou gerado:", codeOrderHiper);
        await storeOrderInFirestore(updatedOrderData, codeOrderHiper, userId);
        return response.data;
    }
    catch (error) {
        if (axios_1.default.isAxiosError(error) && error.response) {
            console.error("Erro na resposta:", error.response.data);
        }
        else {
            console.error("Erro desconhecido:", error);
        }
        throw error;
    }
};
exports.default = postOrderSale;
