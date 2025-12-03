import express from "express";
import cors from 'cors';
import 'dotenv/config';

console.log('🔍 Testando importações...');

try {
  console.log('📁 Importando rotas...');
  
  // Testar cada rota individualmente
  console.log('  - Schedule...');
  const ScheduleRoute = await import('./src/routes/Schedule.js');
  console.log('  ✅ Schedule OK');
  
  console.log('  - Users...');
  const UsersRoute = await import('./src/routes/Users.js');
  console.log('  ✅ Users OK');
  
  console.log('  - Training...');
  const TrainingRoute = await import('./src/routes/Training.js');
  console.log('  ✅ Training OK');
  
  console.log('  - ComissaoTemplate...');
  const ComissaoTemplateRoute = await import('./src/routes/ComissaoTemplate.js');
  console.log('  ✅ ComissaoTemplate OK');
  
  const app = express();
  app.use(express.json());
  app.use(cors());
  
  // Log de requisições
  app.use((req, res, next) => {
    console.log(`📨 ${req.method} ${req.path}`);
    next();
  });
  
  // Configurar rotas
  app.use('/schedule', ScheduleRoute.default);
  app.use('/users', UsersRoute.default);
  app.use('/training', TrainingRoute.default);
  app.use('/comissao-template', ComissaoTemplateRoute.default);
  
  // Rota de teste
  app.get('/test', (req, res) => {
    res.json({ message: 'Servidor funcionando!', timestamp: new Date() });
  });
  
  // Middleware de erro
  app.use((error, req, res, next) => {
    console.error('❌ Erro na aplicação:', error);
    res.status(500).json({ message: 'Erro interno do servidor', error: error.message });
  });
  
  console.log('🚀 Iniciando servidor...');
  const server = app.listen(3000, () => {
    console.log('✅ Servidor rodando na porta 3000');
    console.log('🌐 Rotas disponíveis:');
    console.log('  - GET /test');
    console.log('  - /schedule/*');
    console.log('  - /users/*'); 
    console.log('  - /training/*');
    console.log('  - /comissao-template/*');
  });
  
  server.on('error', (error) => {
    console.error('❌ Erro no servidor:', error);
  });
  
} catch (error) {
  console.error('❌ Erro na inicialização:', error);
  process.exit(1);
}