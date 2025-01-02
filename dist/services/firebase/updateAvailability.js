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
exports.updateProductAvailability = void 0;
const firebaseConfig_1 = require("../../firebaseConfig");
const updateProductAvailability = (productId, disponivel) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const disponibilityRef = firebaseConfig_1.admin.firestore().collection("productsConfig");
        yield disponibilityRef.doc(productId).set({
            disponivel,
            ultimaAtualizacao: new Date(),
        }, { merge: true });
        return { success: true, message: "Disponibilidade atualizada com sucesso" };
    }
    catch (error) {
        console.error("Erro ao atualizar disponibilidade", error);
        return {
            success: false,
            message: "Falha ao alterar a disponibilidade do produto",
        };
    }
});
exports.updateProductAvailability = updateProductAvailability;
