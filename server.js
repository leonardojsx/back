import app from "./app.js";

// Capturar erros não tratados
process.on('uncaughtException', (error) => {
  console.error('Erro não capturado:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Promise rejeitada não tratada:', reason);
});

const server = app.listen(3000, () => {
  console.log('servidor ligado na porta 3000')
});

// Manter o processo vivo
server.on('error', (error) => {
  console.error('Erro no servidor:', error);
});

console.log('Processo iniciado com PID:', process.pid);