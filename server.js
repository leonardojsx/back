import app from "./app.js";

// Capturar erros não tratados
process.on('uncaughtException', (error) => {
  console.error('❌ Erro não capturado:', error);
  console.error('Stack:', error.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promise rejeitada não tratada:', reason);
  console.error('Promise:', promise);
});

// Log de inicialização mais detalhado
console.log('🚀 Iniciando servidor...');
console.log('📁 Diretório atual:', process.cwd());
console.log('🔧 Versão do Node:', process.version);

try {
  const server = app.listen(3000, () => {
    console.log('✅ Servidor ligado na porta 3000');
    console.log('🌐 Acesse: http://localhost:3000');
  });

  // Manter o processo vivo
  server.on('error', (error) => {
    console.error('❌ Erro no servidor:', error);
  });

  server.on('close', () => {
    console.log('🔴 Servidor fechado');
  });

  console.log('📊 Processo iniciado com PID:', process.pid);
  
  // Impedir que o processo saia automaticamente
  process.stdin.resume();
  
} catch (error) {
  console.error('❌ Erro ao inicializar servidor:', error);
  process.exit(1);
}