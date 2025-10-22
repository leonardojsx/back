import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('treinamentos', (table) => {
    table.uuid('id').primary()
    table.string('titulo').notNullable()
    table.uuid('usuario_id').references('id').inTable('usuarios')
    table.string('cnpj').notNullable()
    table.dateTime('data_inicio').notNullable()
    table.dateTime('data_fim').notNullable()
    table.enum('status', ['planejado', 'concluido', 'cancelado']).defaultTo('planejado')
  })
}


export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('treinamentos')
}