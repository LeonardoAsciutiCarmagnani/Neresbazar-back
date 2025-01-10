"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const firebaseConfig_1 = require("../../firebaseConfig");
const saveUserToFirestore = async (user) => {
    try {
        const usersRef = firebaseConfig_1.firestore.collection("clients");
        const userRef = usersRef.doc(user.user_id);
        const userToSave = Object.assign({}, user);
        delete userToSave.password;
        await userRef.set(userToSave);
        return {
            success: true,
            message: "Usuário criado no firebase com sucesso.",
            userId: userRef.id,
        };
    }
    catch (error) {
        console.error("Erro ao salvar usuário:", error);
        return {
            success: false,
            message: error.message || "Erro ao salvar usuário.",
        };
    }
};
exports.default = saveUserToFirestore;
