import { fetchProducts } from "./services/hiper/fetchProducts";
import { Request, Response, NextFunction } from "express";
import z from "zod";
import postUser from "./services/others/postUser";

export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Obtemos a categoria da query string
    const { categoria } = req.query;
    console.log("Categoria:", categoria);

    // Fazemos o fetch dos produtos a partir de uma função externa
    const getProductsHiper = await fetchProducts();
    console.log("FetchProducts:", getProductsHiper);

    // Extraímos os produtos retornados pela API do Hiper
    const productsHiper = getProductsHiper?.produtos;
    console.log("Produtos Hiper:", productsHiper);

    // Verificamos se a categoria foi passada e filtramos os produtos
    const filteredProducts = categoria
      ? productsHiper.filter((product: any) => product.categoria === categoria)
      : productsHiper; // Caso não tenha categoria, retornamos todos os produtos

    console.log("Produtos filtrados:", filteredProducts);

    // Retornamos os produtos filtrados para o front-end
    res.json({ filteredProducts });
  } catch (e) {
    // Log de erro para facilitar o debug
    console.error("Error in getProducts:", e);
    next(e);
  }
};

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const createUserSchema = z.object({
    name: z.string(),
    email: z.string(),
    cpf: z.string(),
    password: z.string(),
  });

  try {
    const userBody = createUserSchema.parse(req.body);

    const userData = {
      ...userBody,
    };

    await postUser(userData);

    console.log("Usuário criado com sucesso:", userData);

    return res.status(200).send(userData);
  } catch (e) {
    console.error("Error in createUser:", e);
    next(e);
  }
};
