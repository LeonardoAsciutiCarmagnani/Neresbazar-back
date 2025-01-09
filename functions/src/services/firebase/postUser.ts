import { admin, firestore } from "../../firebaseConfig";

const auth = admin.auth();

async function checkCpfExists(cpf: number): Promise<boolean> {
  const usersRef = firestore.collection("clients");
  const querySnapshot = await usersRef.where("cpf", "==", cpf).get();

  return !querySnapshot.empty;
}

const postUser = async (user: any) => {
  try {
    // Verifica se o usuário já existe
    const userExists = await checkCpfExists(user.cpf);

    if (userExists) {
      return { success: false, message: "Usuário já cadastrado." };
    }

    // Cria o usuário na autenticação do Firebase
    const userCredential = await auth.createUser({
      email: user.email,
      password: user.password,
    });

    // Adiciona o user_id ao objeto user
    user.user_id = userCredential.uid;

    // Armazena os dados do usuário no Firestore
    const userRef = firestore.collection("clients").doc(user.user_id);
    await userRef.set(user);

    return { success: true, message: "Usuário criado com sucesso." };
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    return { success: false, message: "Erro ao criar usuário." };
  }
};

export default postUser;
