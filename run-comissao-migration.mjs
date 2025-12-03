import Knex from 'knex';
import knexConfig from './knexfile.mjs';

const knex = Knex(knexConfig);

async function runMigration() {
  try {
    console.log('🔄 Executando migration para tabela de templates de comissão...');
    
    // Verificar se a tabela já existe
    const tableExists = await knex.schema.hasTable('comissao_templates');
    if (tableExists) {
      console.log('✅ Tabela comissao_templates já existe');
      return;
    }

    // Criar a tabela
    await knex.schema.createTable('comissao_templates', (table) => {
      table.uuid('id').primary();
      table.string('titulo').notNullable();
      table.decimal('valor', 10, 2).nullable();
      table.decimal('porcentagem', 4, 2).notNullable();
      table.boolean('temTaxa').notNullable().defaultTo(true);
      table.timestamps(true, true);
    });

    console.log('✅ Tabela comissao_templates criada com sucesso!');
    
    // Inserir alguns templates padrão
    const templatesPadrao = [
      {
        id: knex.raw('UUID()'),
        titulo: 'Comissão Padrão 10%',
        valor: null,
        porcentagem: 10,
        temTaxa: true
      },
      {
        id: knex.raw('UUID()'),
        titulo: 'Comissão Fixa R$ 100',
        valor: 100,
        porcentagem: 0,
        temTaxa: false
      },
      {
        id: knex.raw('UUID()'),
        titulo: 'Comissão Premium 15%',
        valor: null,
        porcentagem: 15,
        temTaxa: true
      }
    ];

    await knex('comissao_templates').insert(templatesPadrao);
    console.log('✅ Templates padrão inseridos!');
    
    console.log('🎉 Migration executada com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao executar migration:', error);
  } finally {
    await knex.destroy();
  }
}

runMigration();