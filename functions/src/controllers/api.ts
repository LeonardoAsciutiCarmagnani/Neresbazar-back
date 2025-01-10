import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { productService } from "../services/hiper/fetchProducts";
import postUser from "../services/firebase/postUser";
import { checkEmailExists } from "../services/firebase/checkEmail";

// Types
interface ProductQuery {
  categoria?: string;
}

// Schemas
const createUserSchema = z.object({
  user_id: z.string(),
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  cpf: z.string().min(11, "CPF inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

// Controllers
export class ProductController {
  public static async getProducts(
    req: Request<{}, {}, {}, ProductQuery>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { categoria } = req.query;
      console.log("Categoria requisitada:", categoria);

      const productsResponse = await productService.fetchProducts();

      if (!productsResponse.produtos) {
        throw new Error("Falha ao obter produtos da API");
      }

      const products = productsResponse.produtos;
      console.log("Total de produtos:", products.length);

      const filteredProducts = categoria
        ? products.filter((product) => product.categoria === categoria)
        : products;

      console.log("Produtos filtrados:", filteredProducts.length);

      res.status(200).json({
        success: true,
        data: filteredProducts,
        total: filteredProducts.length,
      });
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
      next(error);
    }
  }
}

export class UserController {
  public static async createUser(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userData = createUserSchema.parse(req.body);

      console.log("Dados do usuário a ser cadastrado: ", userData);

      const result = await postUser(userData);

      console.log("Usuário criado com sucesso:", {
        ...result,
        password: "[REDACTED]",
      });

      res.status(201).json({
        success: true,
        message: "Usuário criado com sucesso",
        data: {
          name: userData.name,
          email: userData.email,
          cpf: userData.cpf,
        },
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          errors: error.errors,
        });
        return;
      }

      console.error("Erro ao criar usuário:", error);
      res.status(500).json({
        success: false,
        message: "Erro interno do servidor",
      });
      next(error);
    }
  }

  public static async checkEmail(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // Validação do email
      const emailSchema = z.object({
        email: z.string().email("Email inválido"),
      });
      const { email } = emailSchema.parse(req.body);

      const emailExists = await checkEmailExists(email);

      if (emailExists.success) {
        res.status(200).json({
          success: true,
          message: "E-mail encontrado com sucesso",
        });
      } else {
        res.status(400).json({
          success: false,
          message: "E-mail não encontrado",
        });
      }
    } catch (error: any) {
      // Tipagem do erro
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          errors: error.errors,
        });
        return;
      } else if (error.message === "Email não encontrado") {
        res.status(404).json({
          success: false,
          message: error.message,
        });
        return;
      }

      console.error("Erro ao recuperar senha:", error);
      next(error); // Passar o erro para o errorHandler
    }
  }
}
// Error Handler Middleware
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error("Error Handler:", err);

  res.status(500).json({
    success: false,
    message: "Erro interno do servidor",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
};
