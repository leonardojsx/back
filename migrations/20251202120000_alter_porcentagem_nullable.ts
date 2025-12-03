export async function up(knex) {
  return knex.schema.alterTable('comissao_templates', (table) => {
    table.decimal('porcentagem', 5, 2).nullable().alter();
  });
}

export async function down(knex) {
  return knex.schema.alterTable('comissao_templates', (table) => {
    table.decimal('porcentagem', 5, 2).notNullable().alter();
  });
}