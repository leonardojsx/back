import knex from './knexfile.mjs';

console.log('🔄 Alterando coluna porcentagem para permitir NULL...');

try {
  // Executar ALTER TABLE diretamente
  await knex.raw('ALTER TABLE comissao_templates MODIFY porcentagem DECIMAL(5,2) NULL');
  console.log('✅ Coluna porcentagem alterada com sucesso!');
} catch (error) {
  console.error('❌ Erro ao alterar coluna:', error);
} finally {
  await knex.destroy();
  process.exit(0);
}