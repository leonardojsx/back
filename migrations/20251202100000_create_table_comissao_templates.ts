import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('comissao_templates', (table) => {
    table.uuid('id').primary();
    table.string('titulo').notNullable();
    table.decimal('valor', 10, 2).nullable();
    table.decimal('porcentagem', 4, 2).notNullable();
    table.boolean('temTaxa').notNullable().defaultTo(true);
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('comissao_templates');
}