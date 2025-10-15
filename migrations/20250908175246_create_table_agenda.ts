import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('agenda', (table) => {
    table.uuid('id').primary()
    table.string('cnpj').notNullable()
    table.dateTime('data').notNullable()
    table.uuid('idUsuario').references('id').inTable('usuarios')
    table.boolean('temTaxa').notNullable()
    table.decimal('valor', 10, 2)
    table.decimal('porcentegem', 4, 2)
    table.decimal('valorPorcentagem', 10, 2)
  })
}


export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('agenda')
}

