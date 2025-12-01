import Knex from "knex";
import knexConfig from "./knexfile.mjs";

const knex = Knex(knexConfig);

async function runMigration() {
  try {
    console.log('🔄 Executando migration para adicionar campos de nível...');
    
    // Verificar se as colunas já existem
    const hasNivel = await knex.schema.hasColumn('usuarios', 'nivel');
    const hasPorcentagem = await knex.schema.hasColumn('usuarios', 'porcentagem_aumento');
    
    if (hasNivel && hasPorcentagem) {
      console.log('✅ Campos de nível já existem na tabela usuarios');
      return;
    }
    
    await knex.schema.alterTable('usuarios', (table) => {
      if (!hasNivel) {
        table.enum('nivel', ['01', '02', '03', '04', '05']).nullable().comment('Nível do usuário de suporte');
        console.log('✅ Campo "nivel" adicionado');
      }
      if (!hasPorcentagem) {
        table.decimal('porcentagem_aumento', 5, 2).nullable().comment('Porcentagem de aumento sobre o salário bruto');
        console.log('✅ Campo "porcentagem_aumento" adicionado');
      }
    });
    
    console.log('🎉 Migration executada com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao executar migration:', error);
  } finally {
    await knex.destroy();
  }
}

runMigration();