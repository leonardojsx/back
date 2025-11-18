import Knex from "knex";
import 'dotenv/config'

const knexConfig = {
  client: 'mysql2',
  connection: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    timezone: 'Z'
  },
  pool: {
    afterCreate: function (conn, done) {
      // Configurar timezone e modo SQL para compatibilidade
      conn.query("SET time_zone='+00:00'; SET sql_mode='';", function (err) {
        done(err, conn);
      });
    }
  }
}

export default knexConfig