import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('usuarios', (table) => {
    table.decimal('salarioBruto', 10, 2).defaultTo(0)
  })
}


export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('usuarios', (table) => {
    table.dropColumn('salarioBruto')
  })
}