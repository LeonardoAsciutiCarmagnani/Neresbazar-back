"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.passwordRecovery = void 0;
const auth_1 = require("firebase-admin/auth");
const auth = (0, auth_1.getAuth)();
const passwordRecovery = async (email) => {
    try {
        if (!email) {
            return { success: false, message: "O email é obrigatório" };
        }
        // Verificar se o usuário existe, usando getUserByEmail()
        const user = await auth.getUserByEmail(email);
        const link = await auth.generatePasswordResetLink(email);
        console.log("Link de redefinição de senha:", link);
        return { success: true, message: "Email enviado com sucesso!", link };
    }
    catch (error) {
        // Lidar com erros
        if (error instanceof auth_1.FirebaseAuthError) {
            switch (error.code) {
                case "auth/user-not-found":
                    return { success: false, message: "E-mail não encontrado." };
                case "auth/invalid-email":
                    return { success: false, message: "E-mail inválido." };
                default:
                    return {
                        success: false,
                        message: "Erro ao processar a recuperação de senha.",
                    };
            }
        }
        else {
            console.error("Erro ao processar a recuperação de senha:", error);
            return {
                success: false,
                message: "Ocorreu um erro ao processar sua solicitação.",
            };
        }
    }
};
exports.passwordRecovery = passwordRecovery;
