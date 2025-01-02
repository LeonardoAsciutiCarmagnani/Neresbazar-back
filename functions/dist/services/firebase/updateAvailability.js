"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProductAvailability = void 0;
const firebaseConfig_1 = require("../../firebaseConfig");
const updateProductAvailability = async (productId, disponivel) => {
    try {
        const disponibilityRef = firebaseConfig_1.admin.firestore().collection("productsConfig");
        await disponibilityRef.doc(productId).set({
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
};
exports.updateProductAvailability = updateProductAvailability;
