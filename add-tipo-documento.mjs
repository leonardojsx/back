import knex from './knexfile.mjs';

try {
  console.log('🔄 Adicionando coluna tipoDocumento à tabela agenda...');
  
  // Verificar se a coluna já existe
  const hasColumn = await knex.schema.hasColumn('agenda', 'tipoDocumento');
  
  if (hasColumn) {
    console.log('✅ Coluna tipoDocumento já existe na tabela agenda');
  } else {
    // Adicionar a coluna tipoDocumento
    await knex.schema.alterTable('agenda', (table) => {
      table.enum('tipoDocumento', ['cpf', 'cnpj']).defaultTo('cnpj').after('cnpj');
    });
    
    console.log('✅ Coluna tipoDocumento adicionada à tabela agenda com sucesso!');
  }

  console.log('🎉 Migration de tipoDocumento executada com sucesso!');
  process.exit(0);
} catch (error) {
  console.error('❌ Erro ao executar migration de tipoDocumento:', error);
  process.exit(1);
}