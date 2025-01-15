"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.PushController = exports.validateCEP = exports.CEPController = exports.OrderController = exports.UserController = exports.ProductController = void 0;
const zod_1 = require("zod");
const fetchProducts_1 = require("../services/hiper/fetchProducts");
const postUser_1 = __importDefault(require("../services/firebase/postUser"));
const checkEmail_1 = require("../services/firebase/checkEmail");
const postOrder_1 = __importDefault(require("../services/hiper/postOrder"));
const fetchCEP_1 = __importDefault(require("../services/others/fetchCEP"));
const adminOrderCompleted_1 = __importDefault(require("../services/chat4sales/push/adminOrderCompleted"));
const paymentLinkAdded_1 = __importDefault(require("../services/chat4sales/push/paymentLinkAdded"));
const orderCompleted_1 = __importDefault(require("../services/chat4sales/push/orderCompleted"));
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
    IBGE: zod_1.z.number().min(7, "Código IBGE inválido"),
    bairro: zod_1.z.string().min(1, "Bairro inválido"),
    localidade: zod_1.z.string().min(1, "Cidade inválida"),
    logradouro: zod_1.z.string().min(1, "Logradouro inválido"),
    uf: zod_1.z.string().min(1, "UF inválida"),
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
            const userId = orderData.IdClient;
            console.log("Valor em userId: ", userId);
            // console.log("Venda que será enviada ao Hiper: ", dataForHiper);
            const result = await (0, postOrder_1.default)(orderData, userId);
            console.log("result: ", result);
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
class CEPController {
    static async getCEP(req, res, next) {
        const { cep } = req.body;
        console.log("Body recebido:", req.body);
        if (!cep) {
            return res.status(400).json({ error: "CEP é obrigatório." });
        }
        try {
            const resultCEP = await (0, fetchCEP_1.default)(cep);
            if (resultCEP === null) {
                return res
                    .status(201)
                    .json({ success: false, message: "CEP não encontrado." });
            }
            res.status(201).json({
                success: true,
                message: "CEP encontrado com sucesso",
                dataAddress: resultCEP,
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: "Erro ao buscar CEP",
                dataAddress: null,
            });
            next(error);
        }
    }
}
exports.CEPController = CEPController;
const validateCEP = async (req, res, next) => {
    const { cep } = req.body;
    if (!cep) {
        return res.status(400).json({ error: "CEP é obrigatório." });
    }
    try {
        const data = await (0, fetchCEP_1.default)(cep);
        if (!data) {
            return res.status(404).json({ error: "CEP não encontrado." });
        }
        return res.status(200).json(data);
    }
    catch (error) {
        console.error("Erro ao validar o CEP:", error);
        return res.status(500).json({ error: "Erro interno do servidor." });
    }
};
exports.validateCEP = validateCEP;
class PushController {
    static async postAdminOrderCompleted(req, res, next) {
        const body = req.body;
        console.log("Body recebido:", req.body);
        if (!body) {
            return res.status(400).json({ error: "Corpo da requisição inválido" });
        }
        try {
            const resultPush = await (0, adminOrderCompleted_1.default)(body);
            console.log("Resultado retornado após envio do push: ", resultPush === null || resultPush === void 0 ? void 0 : resultPush.data);
            res.status(201).json({
                success: true,
                message: "Push enviado com sucesso",
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: "Erro ao enviar push",
            });
            next(error);
        }
    }
    static async postOrderCompleted(req, res, next) {
        const body = req.body;
        console.log("Body recebido:", req.body);
        if (!body) {
            return res
                .status(400)
                .json({ error: "Corpo da requisição é obrigatório" });
        }
        try {
            const resultPush = await (0, orderCompleted_1.default)(body);
            console.log("Resultado retornado após envio do push: ", resultPush);
            res.status(201).json({
                success: true,
                message: "Push enviado com sucesso",
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: "Erro ao enviar push",
            });
            next(error);
        }
    }
    static async postPaymentLinkAdded(req, res, next) {
        const body = req.body;
        console.log("Body recebido:", req.body);
        if (!body) {
            return res
                .status(400)
                .json({ error: "Corpo da requisição é obrigatório" });
        }
        try {
            const resultPush = await (0, paymentLinkAdded_1.default)(body);
            console.log("Resultado retornado após envio do push: ", resultPush);
            res.status(201).json({
                success: true,
                message: "Push enviado com sucesso",
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: "Erro ao enviar push",
            });
            next(error);
        }
    }
}
exports.PushController = PushController;
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
