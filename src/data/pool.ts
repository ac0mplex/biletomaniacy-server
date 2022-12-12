import pg from 'pg';
import { env } from '../env.js';

const pool = new pg.Pool({
	database: 'biletomaniacy',
	user: env.dbUser,
	password: env.dbPassword,
});
export default pool;
