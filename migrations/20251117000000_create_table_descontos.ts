import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('descontos', (table) => {
    table.uuid('id').primary()
    table.uuid('idUsuario').references('id').inTable('usuarios').notNullable()
    table.string('descricao').notNullable()
    table.decimal('valor', 10, 2).notNullable()
    table.dateTime('data').notNullable()
    table.timestamp('created_at').defaultTo(knex.fn.now())
  })
}


export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('descontos')
}