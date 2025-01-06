import express from "express";
import cors from "cors";
import { createUser, getProducts } from "./api";
import { onRequest } from "firebase-functions/v2/https";

const app = express();

// Configuração específica do CORS para Firebase Functions
const corsOptions = {
  origin: "*",
  // methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
console.log("Oi");
// Aplicar CORS como middleware
app.use(express.json());
app.use(cors(corsOptions));

// Middleware para logs
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Adicionar headers CORS em todas as rotas
/* app.use((req, res, next) => {
  res.set("Access-Control-Allow-Origin", corsOptions.origin);
  res.set("Access-Control-Allow-Methods", corsOptions.methods.join(","));
  res.set("Access-Control-Allow-Headers", corsOptions.allowedHeaders.join(","));
  res.set("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    res.status(200).send();
    return;
  }
  next();
}); */

app.get("/v1/products", getProducts);
app.post("/v1/create-user", createUser);

export const api = onRequest(app);

console.log("API initialization started");
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection:", reason);
});
