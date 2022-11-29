// TODO: github.com/tsconfig/bases

import * as password_utils from './password_utils.js';
import connect_pg_simple from 'connect-pg-simple';
import express from 'express';
import fs from 'fs';
import pg from 'pg';
import session from 'express-session';

interface User {
	id: number;
	name: string;
};

declare module 'express-session' {
    interface SessionData {
        user: User;
    }
}

const env = JSON.parse(fs.readFileSync('./env.json', 'utf8'));
const app = express();
const port = 3019;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const pool = new pg.Pool({
	database: 'biletomaniacy'
});
const PGStore = connect_pg_simple(session);

app.use(
	session({
		store: new PGStore({ pool: pool }),
		secret: env.secret,
	})
);

app.post('/register', async (request, response) => {
	const { name, password } = request.body;

	if (name == null || password == null) {
		return response.sendStatus(403);
	}

	try {
		const result = password_utils.hash(password);

		const data = await pool.query(
			'INSERT INTO "user" (name, password, salt) VALUES ($1, $2, $3) RETURNING *',
			[name, result.hash, result.salt]
		);

		if (data.rows.length == 0) {
			return response.sendStatus(403);
		}

		const user = data.rows[0];

		request.session.user = {
			id: user.id,
			name: user.name,
		};

		response.status(200);
		return response.json({ user: request.session.user });
	} catch (e) {
		console.error(e);
		return response.sendStatus(403);
	}
});

app.post('/login', async (request, response) => {
	const { name, password } = request.body;

	if (name == null || password == null) {
		return response.sendStatus(403);
	}

	try {
		const data = await pool.query(
			'SELECT id, name, password, salt FROM "user" WHERE name = $1',
			[name]
		);

		if (data.rows.length == 0) {
			return response.sendStatus(403);
		}

		const user = data.rows[0];
		const validPassword = password_utils.compare(
			password, user.salt, user.password
		);

		if (!validPassword) {
			return response.sendStatus(403);
		}

		request.session.user = {
			id: user.id,
			name: user.name
		};

		response.status(200);
		return response.json({ user: request.session.user });
	} catch(e) {
		console.error(e);
		return response.sendStatus(403);
	};
});

app.post('/logout', async (request, response, next) => {
	request.session.destroy((error) => {
		if (error) {
			next(error);
		} else {
			response.sendStatus(200);
		}
	});
});

app.get('/users', async (_request, response, next) => {
	pool.query('SELECT id, name, admin FROM "user"', (error, results) => {
		if (error) {
			next(error);
		} else {
			response.json(results.rows);
		}
	});
});

app.get('/users/:id', async (request, response, _next) => {
	const id = parseInt(request.params.id);

	pool.query('SELECT id, name, admin FROM "user" where id = $1', [id], (error, results) => {
		if (error || results.rows.length == 0) {
			response.sendStatus(403);
		} else {
			response.json(results.rows[0]);
		}
	});
});

app.put('/users/:id', async (request, response, next) => {
	const id = parseInt(request.params.id);
	const { name, password } = request.body;

	pool.query('SELECT id, name, password, salt FROM "user" where id = $1', [id], (error, results) => {
		if (error || results.rows.length == 0) {
			return response.sendStatus(403);
		}

		var user = results.rows[0]

		if (name != null) {
			user.name = name;
		}

		if (password != null) {
			const result = password_utils.hash(password);
			user.password = result.hash;
			user.salt = result.salt;
		}

		pool.query(
			'UPDATE "user" SET name = $1, password = $2, salt = $3 WHERE id = $4',
			[ user.name, user.password, user.salt, id ],
			(error, _results) => {
				if (error) {
					next(error);
				} else {
					response.sendStatus(200);
				}
			}
		);
	});
});

app.get('/concerts', async (_request, response, next) => {
	pool.query('SELECT * FROM concert', (error, results) => {
		if (error) {
			next(error);
		} else {
			response.json({ data: results.rows });
		}
	});
});

app.get('/concerts/:id', async (request, response, next) => {
	const id = parseInt(request.params.id);

	pool.query('SELECT * FROM concert where id = $1', [id], (error, results) => {
		if (error) {
			next(error);
		} else {
			response.json({ data: results.rows });
		}
	});
});

app.get('/tickets/:concert_id', async (_request, response, next) => {
	pool.query('SELECT * FROM ticket', (error, results) => {
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
