import knex from './knexfile.mjs';

try {
  console.log('🔄 Adicionando coluna tipoDocumento à tabela treinamentos...');
  
  // Verificar se a coluna já existe
  const hasColumn = await knex.schema.hasColumn('treinamentos', 'tipoDocumento');
  
  if (hasColumn) {
    console.log('✅ Coluna tipoDocumento já existe na tabela treinamentos');
  } else {
    // Adicionar a coluna tipoDocumento
    await knex.schema.alterTable('treinamentos', (table) => {
      table.enum('tipoDocumento', ['cpf', 'cnpj']).defaultTo('cnpj').after('cnpj');
    });
    
    console.log('✅ Coluna tipoDocumento adicionada à tabela treinamentos com sucesso!');
  }

  console.log('🎉 Migration de tipoDocumento para treinamentos executada com sucesso!');
  process.exit(0);
} catch (error) {
  console.error('❌ Erro ao executar migration de tipoDocumento para training:', error);
  process.exit(1);
}