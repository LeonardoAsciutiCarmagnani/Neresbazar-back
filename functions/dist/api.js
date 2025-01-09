"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = exports.getProducts = void 0;
const fetchProducts_1 = require("./services/hiper/fetchProducts");
const zod_1 = __importDefault(require("zod"));
const postUser_1 = __importDefault(require("./services/others/postUser"));
const getProducts = async (req, res, next) => {
    try {
        // Obtemos a categoria da query string
        const { categoria } = req.query;
        console.log("Categoria requisitada: ", categoria);
        // Fazemos o fetch dos produtos a partir de uma função externa
        const getProductsHiper = await (0, fetchProducts_1.fetchProducts)();
        // Extraímos os produtos retornados pela API do Hiper
        const productsHiper = getProductsHiper === null || getProductsHiper === void 0 ? void 0 : getProductsHiper.produtos;
        console.log("Quantidade de produtos Hiper", productsHiper.length);
        // Verificamos se a categoria foi passada e filtramos os produtos
        const filteredProducts = categoria
            ? productsHiper.filter((product) => product.categoria === categoria)
            : productsHiper; // Caso não tenha categoria, retornamos todos os produtos
        console.log("Quantidade de produtos filtrados:", filteredProducts.length);
        console.log("Produtos filtrados:", filteredProducts);
        // Retornamos os produtos filtrados para o front-end
        res.json({ filteredProducts });
    }
    catch (e) {
        // Log de erro para facilitar o debug
        console.error("Error in getProducts:", e);
        next(e);
    }
};
exports.getProducts = getProducts;
const createUser = async (req, res, next) => {
    const createUserSchema = zod_1.default.object({
        name: zod_1.default.string(),
        email: zod_1.default.string(),
        cpf: zod_1.default.string(),
        password: zod_1.default.string(),
    });
    try {
        const userBody = createUserSchema.parse(req.body);
        const userData = Object.assign({}, userBody);
        await (0, postUser_1.default)(userData);
        console.log("Usuário criado com sucesso:", userData);
        return res.status(200).send(userData);
    }
    catch (e) {
        console.error("Error in createUser:", e);
        next(e);
    }
};
exports.createUser = createUser;
