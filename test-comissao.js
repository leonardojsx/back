import express from "express";
import cors from 'cors';
import ComissaoTemplateRoute from './src/routes/ComissaoTemplate.js';

const app = express();
app.use(express.json());
app.use(cors());

// Middleware de log para debug
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Usar apenas a rota de templates
app.use('/comissao-template', ComissaoTemplateRoute);

// Middleware de tratamento de erro
app.use((error, req, res, next) => {
  console.error('Erro na aplicação:', error);
  res.status(500).json({ message: 'Erro interno do servidor', error: error.message });
});

console.log('🚀 Iniciando servidor de teste...');
const server = app.listen(3001, () => {
  console.log('✅ Servidor de teste rodando na porta 3001');
  console.log('🌐 Acesse: http://localhost:3001');
});

server.on('error', (error) => {
  console.error('❌ Erro no servidor:', error);
});