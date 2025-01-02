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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchProducts = void 0;
const axios_1 = __importDefault(require("axios"));
const fetchToken_1 = require("../hiper/fetchToken");
const firebaseConfig_1 = require("../../firebaseConfig");
const fetchProducts = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        let token = yield (0, fetchToken_1.fetchToken)();
        const response = yield axios_1.default.get("http://ms-ecommerce.hiper.com.br/api/v1/produtos/pontoDeSincronizacao?pontoDeSincronizacao=0", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        const disponibilityRef = firebaseConfig_1.admin.firestore().collection("productsConfig");
        const disponibilitySnapshot = yield disponibilityRef.get();
        const existingConfigurations = disponibilitySnapshot.docs.map((doc) => (Object.assign({ id: doc.id }, doc.data())));
        const productsWithDisponibility = response.data.produtos.map((product) => {
            const productConfig = existingConfigurations.find((config) => config.id === product.id);
            if (!productConfig) {
                disponibilityRef.doc(product.id).set({
                    disponivel: false,
                    ultimaAtualizacao: new Date(),
                });
            }
            return Object.assign(Object.assign({}, product), { disponivel: productConfig ? productConfig.disponivel : false });
        });
        return Object.assign(Object.assign({}, response.data), { produtos: productsWithDisponibility });
    }
    catch (error) {
        if (axios_1.default.isAxiosError(error) && ((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) === 401) {
            const newToken = yield (0, fetchToken_1.fetchToken)();
            fetchToken_1.tokenCache.set("token", newToken);
            return (0, exports.fetchProducts)();
        }
        else {
            throw error;
        }
    }
});
exports.fetchProducts = fetchProducts;
