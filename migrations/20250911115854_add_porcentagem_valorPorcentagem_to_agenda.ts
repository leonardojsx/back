import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('agenda', (table) => {
    table.decimal('porcentegem', 4, 2)
    table.decimal('valorPorcentagem', 4, 2)
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('agenda', (table) => {
    table.dropColumn('porcentagem')
    table.dropColumn('valorPorcentagem')
  })
}