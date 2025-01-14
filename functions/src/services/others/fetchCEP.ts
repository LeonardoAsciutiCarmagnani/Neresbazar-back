import axios from "axios";

interface CepData {
  ibge: number | null;
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
}

const fetchCEP = async (cep: string): Promise<CepData | null> => {
  try {
    console.log(`Buscando CEP: ${cep}`);
    const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);

    if (response.data.erro) {
      console.warn("CEP não encontrado.");
      return null;
    }

    const data: CepData = {
      ibge: response.data.ibge ? parseInt(response.data.ibge, 10) : null,
      logradouro: response.data.logradouro || "",
      bairro: response.data.bairro || "",
      localidade: response.data.localidade || "",
      uf: response.data.uf || "",
    };

    return data;
  } catch (error) {
    console.error("Erro ao buscar o CEP:", error);
    return null;
  }
};

export default fetchCEP;
