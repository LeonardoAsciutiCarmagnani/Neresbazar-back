"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const firebaseConfig_1 = require("../../firebaseConfig");
async function checkCpfExists(cpf) {
    const usersRef = firebaseConfig_1.firestore.collection("clients");
    const querySnapshot = await usersRef.where("cpf", "==", cpf).get();
    return !querySnapshot.empty;
}
const postUser = async (user) => {
    try {
        // Verifica se o usuário já existe
        const userExists = await checkCpfExists(user.cpf);
        if (userExists) {
            return { success: false, message: "Usuário já cadastrado." };
        }
        const userRef = firebaseConfig_1.firestore.collection("clients").doc(user.user_id);
        await userRef.set(user);
        return { success: true, message: "Usuário criado com sucesso." };
    }
    catch (error) {
        console.error("Erro ao criar usuário:", error);
        return { success: false, message: "Erro ao criar usuário." };
    }
};
exports.default = postUser;
