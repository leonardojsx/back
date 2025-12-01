import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('usuarios', (table) => {
    table.enum('nivel', ['01', '02', '03', '04', '05']).nullable().comment('Nível do usuário de suporte');
    table.decimal('porcentagem_aumento', 5, 2).nullable().comment('Porcentagem de aumento sobre o salário bruto');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('usuarios', (table) => {
    table.dropColumn('nivel');
    table.dropColumn('porcentagem_aumento');
  });
}