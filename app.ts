// TODO: github.com/tsconfig/bases

import express from 'express';
import pg from 'pg';

const app = express();
const port = 3019;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const pool = new pg.Pool({
	database: 'biletomaniacy'
});

app.get('/', async (_request, response, next) => {
	pool.query('SELECT name FROM "user"', (error, results) => {
		if (error) {
			next(error);
		} else {
			response.json({ data: results.rows });
		}
	});
});

app.listen(port, () => {
	console.log(`I'm listening on port ${port}`);
});
