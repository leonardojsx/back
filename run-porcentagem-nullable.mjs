import knex from './knexfile.mjs';

console.log('🔄 Executando migration para tornar porcentagem nullable...');

try {
  await knex.migrate.latest();
  console.log('✅ Migration executada com sucesso!');
} catch (error) {
  console.error('❌ Erro ao executar migration:', error);
} finally {
  await knex.destroy();
  process.exit(0);
}