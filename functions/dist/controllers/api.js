"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.OrderController = exports.UserController = exports.ProductController = void 0;
const zod_1 = require("zod");
const fetchProducts_1 = require("../services/hiper/fetchProducts");
const postUser_1 = __importDefault(require("../services/firebase/postUser"));
const checkEmail_1 = require("../services/firebase/checkEmail");
// Schemas
const createUserSchema = zod_1.z.object({
    user_id: zod_1.z.string(),
    name: zod_1.z.string().min(1, "Nome é obrigatório"),
    email: zod_1.z.string().email("Email inválido"),
    cpf: zod_1.z.string().min(11, "CPF inválido"),
    password: zod_1.z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
    CEP: zod_1.z.string().min(8, "CEP inválido"),
    numberHouse: zod_1.z.string().min(1, "Número da casa inválido"),
    phoneNumber: zod_1.z.string().min(11, "Telefone inválido"),
    type_user: zod_1.z.string().min(1, "Tipo de usuário é obrigatório"),
});
// Controllers
class ProductController {
    static async getProducts(req, res, next) {
        try {
            const { categoria } = req.query;
            console.log("Categoria requisitada:", categoria);
            const productsResponse = await fetchProducts_1.productService.fetchProducts();
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
        }
        catch (error) {
            console.error("Erro ao buscar produtos:", error);
            next(error);
        }
    }
}
exports.ProductController = ProductController;
class UserController {
    static async createUser(req, res, next) {
        try {
            const userData = createUserSchema.parse(req.body);
            console.log("Dados do usuário a ser cadastrado: ", userData);
            const result = await (0, postUser_1.default)(userData);
            console.log("Usuário criado com sucesso:", Object.assign(Object.assign({}, result), { password: "[REDACTED]" }));
            res.status(201).json({
                success: true,
                message: "Usuário criado com sucesso",
                data: {
                    name: userData.name,
                    email: userData.email,
                    cpf: userData.cpf,
                },
            });
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
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
    static async checkEmail(req, res, next) {
        try {
            // Validação do email
            const emailSchema = zod_1.z.object({
                email: zod_1.z.string().email("Email inválido"),
            });
            const { email } = emailSchema.parse(req.body);
            const emailExists = await (0, checkEmail_1.checkEmailExists)(email);
            if (emailExists.success) {
                res.status(200).json({
                    success: true,
                    message: "E-mail encontrado com sucesso",
                });
            }
            else {
                res.status(400).json({
                    success: false,
                    message: "E-mail não encontrado",
                });
            }
        }
        catch (error) {
            // Tipagem do erro
            if (error instanceof zod_1.z.ZodError) {
                res.status(400).json({
                    success: false,
                    errors: error.errors,
                });
                return;
            }
            else if (error.message === "Email não encontrado") {
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
exports.UserController = UserController;
class OrderController {
    static async postOrderSale(req, res, next) {
        try {
            const orderData = req.body;
            const userId = orderData.id_user;
            console.log("Venda que será enviada ao Hiper: ", orderData);
            // const result = await postOrder(orderData, userId);
            // console.log(result);
            res.status(201).json({
                success: true,
                message: "Venda enviada com sucesso",
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: "Erro ao enviar venda",
            });
            next(error);
        }
    }
}
exports.OrderController = OrderController;
// Error Handler Middleware
const errorHandler = (err, req, res, next) => {
    console.error("Error Handler:", err);
    res.status(500).json({
        success: false,
        message: "Erro interno do servidor",
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
};
exports.errorHandler = errorHandler;
