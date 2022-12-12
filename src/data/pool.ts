import pg from 'pg';

const pool = new pg.Pool({
	database: 'biletomaniacy'
});
export default pool;
