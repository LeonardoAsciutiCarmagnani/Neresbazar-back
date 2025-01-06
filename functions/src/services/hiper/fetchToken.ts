import axios from "axios";
import { tokenCache } from "../others/tokenCache";
let tokenPromise: Promise<string> | null = null;

export const fetchToken = async (): Promise<string> => {
  let token = tokenCache.get("token");

  if (!token) {
    if (!tokenPromise) {
      tokenPromise = new Promise(async (resolve, reject) => {
        try {
          const response = await axios.get(
            "https://ms-ecommerce.hiper.com.br/api/v1/auth/gerar-token/21f9820401efd62607d47a0152438ba907f5f732ea4a704e1348700b7b23d8a8"
          );

          token = response.data.token;
          if (typeof token === "string") {
            tokenCache.set("token", token);
            console.log("Novo token gerado e armazenado no cache.");
            resolve(token);
          } else {
            reject("Token gerado não é uma string válida.");
          }
        } catch (error) {
          reject("Erro ao gerar o token.");
        } finally {
          tokenPromise = null;
        }
      });
    }
    token = await tokenPromise;
  } else {
    console.log("Token recuperado do cache.");
  }

  return token as string;
};

export { tokenCache };
