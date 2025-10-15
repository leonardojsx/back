import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("agenda", (table) => {
    table.string("titulo").notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("agenda", (table) => {
    table.dropColumn("titulo");
  });
}