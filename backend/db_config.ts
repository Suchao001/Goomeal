import type { Knex } from 'knex';
import dotenv from 'dotenv';
import knex from 'knex';

dotenv.config();

const config: {[key:string]: Knex.Config} = {
  development: {
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      port: Number(process.env.DB_PORT),
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      charset: 'utf8mb4'
    },
  } 
}

const db = knex(config.development);

export default db;
