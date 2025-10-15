import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('usuarios', (table) => {
    table.uuid('id').primary()
    table.string('nome').notNullable()
    table.enum('role', ['admin', 'sup'])
    table.string('email').notNullable()
    table.string('senha').notNullable()
  })
}


export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('usuarios')
}

