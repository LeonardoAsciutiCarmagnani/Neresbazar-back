import axios from "axios";
import { firestore } from "../../firebaseConfig";
import { fetchToken } from "./fetchToken";

const getLastOrderCode = async () => {
  const collectionRef = firestore.collection("sales_orders");

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

const storeOrderInFirestore = async (
  order: any,
  codeHiper: string,
  userId: string
) => {
  const orderWithClientId = {
    ...order,
    IdClient: userId,
    order_code: codeHiper,
  };

  const docRef = firestore.collection("sales_orders").doc(order.id);
  await docRef.set(orderWithClientId);
};

const fetchOrderSaleData = async (generatedId: string) => {
  let token = await fetchToken();
  try {
    const getOrderSaleHiper = await axios.get(
      `http://ms-ecommerce.hiper.com.br/api/v1/pedido-de-venda/eventos/${generatedId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );
    return getOrderSaleHiper.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      console.error("Erro ao buscar dados da venda:", error.response.data);
    } else {
      console.error("Erro desconhecido:", error);
    }
    throw error;
  }
};

const postOrderSale = async (orderData: any, userId: string): Promise<any> => {
  let token = await fetchToken();

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  try {
    const response = await axios.post(
      "http://ms-ecommerce.hiper.com.br/api/v1/pedido-de-venda/",
      orderData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    const generatedId = response.data.id;
    const updatedOrderData = { ...orderData, id: generatedId };

    // Tentativa de buscar o código da venda até que ele não esteja em branco, com limite de 3 tentativas
    let codeOrderHiper = "";
    let attempts = 0;
    const maxAttempts = 3; // Limite de tentativas

    while (
      (codeOrderHiper === "" || codeOrderHiper.trim() === "") &&
      attempts < maxAttempts
    ) {
      const orderSaleData = await fetchOrderSaleData(generatedId);
      console.log("Retorno do objeto: ", orderSaleData);
      codeOrderHiper = orderSaleData?.codigoDoPedidoDeVenda || ""; // Garante que pegamos o código ou uma string vazia

      if (codeOrderHiper === "" || codeOrderHiper.trim() === "") {
        attempts++;
        console.log(
          `Tentativa ${attempts} de ${maxAttempts}: código vazio. Aguardando 3 segundos...`
        );
        await delay(3000);
      }
    }

    if (codeOrderHiper === "" || codeOrderHiper.trim() === "") {
      console.log(
        "Não foi possível obter o código do pedido de venda. Gerando manualmente..."
      );
      codeOrderHiper = await getLastOrderCode();
    }

    console.log("Código do pedido de venda obtido ou gerado:", codeOrderHiper);

    await storeOrderInFirestore(updatedOrderData, codeOrderHiper, userId);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      console.error("Erro na resposta:", error.response.data);
    } else {
      console.error("Erro desconhecido:", error);
    }
    throw error;
  }
};

export default postOrderSale;
