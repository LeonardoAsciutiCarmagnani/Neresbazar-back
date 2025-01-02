"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProducts = void 0;
const fetchProducts_1 = require("./services/hiper/fetchProducts");
const getProducts = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const getProductsHiper = yield (0, fetchProducts_1.fetchProducts)();
        const productsHiper = getProductsHiper.produtos;
        console.log("Produtos Hiper", productsHiper);
        res.json({ productsHiper });
    }
    catch (e) {
        next(e);
    }
});
exports.getProducts = getProducts;
