// TODO: github.com/tsconfig/bases

import crypto from 'crypto';
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
		const salt = crypto.randomBytes(16).toString('base64');
		// Based on recommendations by OWASP:
		// https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
		const hash = crypto.pbkdf2Sync(password, salt, 310000, 32, 'sha256').toString('base64');

		const data = await pool.query(
			'INSERT INTO "user" (name, password, salt) VALUES ($1, $2, $3) RETURNING *',
			[name, hash, salt]
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

		// Based on recommendations by OWASP:
		// https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
		const hash = crypto.pbkdf2Sync(password, user.salt, 310000, 32, 'sha256');
		const db_hash = Buffer.from(user.password, 'base64');

		const validPassword = crypto.timingSafeEqual(db_hash, hash);

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
			response.json({ data: results.rows });
		}
	});
});

app.get('/users/:id', async (request, response, next) => {
	const id = parseInt(request.params.id);

	pool.query('SELECT id, name, admin FROM "user" where id = $1', [id], (error, results) => {
		if (error) {
			next(error);
		} else {
			response.json({ data: results.rows });
		}
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
