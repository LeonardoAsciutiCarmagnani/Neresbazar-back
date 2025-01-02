import axios from "axios";
import { fetchToken, tokenCache } from "./fetchToken";
import { admin, firestore } from "../../firebaseConfig";

interface Product {
  id: string;
  preco: number;
  nome: string;
  imagem?: string;
  categoria?: string;
}

interface ApiResponse {
  pontoDeSincronizacao: number;
  produtos: Product[];
  errors: any[];
  message: string | null;
}

export const fetchProducts = async (
  retries: number = 3 // Limite de tentativas para evitar recursão infinita
): Promise<ApiResponse> => {
  try {
    let token = await fetchToken();

    const response = await axios.get(
      "http://ms-ecommerce.hiper.com.br/api/v1/produtos/pontoDeSincronizacao?pontoDeSincronizacao=0",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 10000,
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Trata erros de autenticação
      if (error.response?.status === 401 && retries > 0) {
        console.warn("Token expirado. Tentando obter um novo token...");
        const newToken = await fetchToken();
        tokenCache.set("token", newToken);
        return fetchProducts(retries - 1); // Reduz o número de tentativas restantes
      } else {
        console.error(
          "Erro de API Hiper:",
          error.response?.data || error.message
        );
      }
    } else {
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
