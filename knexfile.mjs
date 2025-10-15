import Knex from "knex";

const knexConfig = {
  client: 'mysql2',
  connection: {
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '@Kact#9453',
    database: 'treinamentos'
  }
}

export default knexConfig