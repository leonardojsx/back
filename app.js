import express from "express";
import { router } from "./src/routes/routes.js";
import cors from 'cors'
import 'dotenv/config'

const app = express()
app.use(express.json())

app.use(cors())

app.use(router)

// Middleware de tratamento de erro global
app.use((error, req, res, next) => {
  console.error('Erro na aplicação:', error);
  res.status(500).json({ message: 'Erro interno do servidor' });
});

export default app
