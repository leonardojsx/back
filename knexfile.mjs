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
    timezone: '-03:00'
  },
  pool: {
    afterCreate: function (conn, done) {
      conn.query("SET time_zone='-03:00';", function (err) {
        done(err, conn);
      });
    }
  }
}

export default knexConfig