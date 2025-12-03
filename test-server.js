import app from "./app.js";

// Teste das rotas
app._router.stack.forEach((middleware) => {
  if (middleware.route) {
    console.log('Rota:', middleware.route.path, Object.keys(middleware.route.methods));
  } else if (middleware.name === 'router') {
    middleware.handle.stack.forEach((handler) => {
      if (handler.route) {
        console.log('Sub-rota:', handler.route.path, Object.keys(handler.route.methods));
      }
    });
  }
});

console.log('🚀 Iniciando servidor de teste...');
const server = app.listen(3000, () => {
  console.log('✅ Servidor rodando na porta 3000');
  console.log('🔍 Testando rotas...');
  
  // Fazer uma requisição de teste
  import('node-fetch').then(({ default: fetch }) => {
    fetch('http://localhost:3000/comissao-template', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer test-token'
      }
    })
    .then(response => {
      console.log('Status da rota GET /comissao-template:', response.status);
      return response.text();
    })
    .then(data => {
      console.log('Resposta:', data);
    })
    .catch(error => {
      console.error('Erro na requisição:', error.message);
    });
  });
});