// TODO: github.com/tsconfig/bases

import * as concerts from './data/concerts.js';
import * as tickets from './data/tickets.js';
import * as users from './data/users.js';
import connect_pg_simple from 'connect-pg-simple';
import cors from 'cors';
import express from 'express';
import fs from 'fs';
import pool from './data/pool.js';
import session from 'express-session';
import { parseDate } from './date_utils.js';

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
app.use(cors());

const PGStore = connect_pg_simple(session);

app.use(
	session({
		store: new PGStore({ pool: pool }),
		secret: env.secret,
	})
);

app.post('/register', async (request, response) => {
	response.set('Access-Control-Allow-Origin', 'http://localhost:3000');

	if (request.body.data == null) {
		return response.sendStatus(403);
	}

	const { name, password } = request.body.data;

	users.createUser(name, password)
		.then((user) => {
			request.session.user = {
				id: user.id,
				name: user.name,
			};
			response.status(200);
			response.json({ user: request.session.user });
		})
		.catch(() => { response.sendStatus(403); });
});

app.post('/login', async (request, response) => {
	response.set('Access-Control-Allow-Origin', 'http://localhost:3000');

	if (request.body.data == null) {
		return response.sendStatus(403);
	}

	const { name, password } = request.body.data;

	users.logInAs(name, password)
		.then((user) => {
			request.session.user = {
				id: user.id,
				name: user.name
			};
			response.status(200);
			response.json({ user: request.session.user });
		})
		.catch(() => { response.sendStatus(403); });
});

app.post('/logout', async (request, response, next) => {
	response.set('Access-Control-Allow-Origin', 'http://localhost:3000');

	request.session.destroy((error) => {
		if (error) {
			next(error);
		} else {
			response.sendStatus(200);
		}
	});
});

app.get('/users', async (_request, response) => {
	response.set('Access-Control-Allow-Origin', 'http://localhost:3000');

	users.getUsers()
		.then((users) => { response.json(users); })
		.catch(() => { response.sendStatus(403); });
});

app.get('/users/:id', async (request, response) => {
	response.set('Access-Control-Allow-Origin', 'http://localhost:3000');

	const id = request.params.id;

	users.getUserByID(id)
		.then((user) => { response.json(user); })
		.catch(() => { response.sendStatus(403); });
});

app.patch('/users/:id', async (request, response) => {
	response.set('Access-Control-Allow-Origin', 'http://localhost:3000');

	if (request.body.data == null) {
		return response.sendStatus(403);
	}

	const id = request.params.id;
	const { admin, name, password } = request.body.data;

	if (typeof admin != "boolean") return response.sendStatus(403);

	users.editUser(id, name, password, admin)
		.then(() => { response.sendStatus(200); })
		.catch(() => { response.sendStatus(403); });
});

app.get('/concerts', async (_request, response) => {
	response.set('Access-Control-Allow-Origin', 'http://localhost:3000');

	concerts.getConcerts()
		.then((concerts) => { response.json(concerts); })
		.catch(() => { response.sendStatus(403); });
});

app.post('/concerts', async (request, response) => {
	response.set('Access-Control-Allow-Origin', 'http://localhost:3000');

	if (request.body.data == null) {
		return response.sendStatus(403);
	}

	const { name, date, location } = request.body.data;
	const parsedDate = parseDate(date);

	if (parsedDate == null) {
		return response.sendStatus(403);
	}

	concerts.createConcert(name, parsedDate, location)
		.then((concert) => { response.json(concert); })
		.catch(() => { response.sendStatus(403); });
});

app.get('/concerts/:id', async (request, response) => {
	response.set('Access-Control-Allow-Origin', 'http://localhost:3000');

	const id = parseInt(request.params.id);

	if (isNaN(id)) {
		return response.sendStatus(403);
	}

	concerts.getConcertByID(id)
		.then((concert) => { response.json(concert); })
		.catch(() => { response.sendStatus(403); });
});


app.patch('/concerts/:id', async (request, response) => {
	response.set('Access-Control-Allow-Origin', 'http://localhost:3000');

	const id = parseInt(request.params.id);

	if (isNaN(id)) {
		return response.sendStatus(403);
	}

	if (request.body.data == null) {
		return response.sendStatus(403);
	}

	const { name, date, location } = request.body.data;

	let parsedDate = null;

	if (date != null) {
		parsedDate = parseDate(date);

		if (parsedDate == null) {
			return response.sendStatus(403);
		}
	}

	concerts.editConcert(id, name, parsedDate, location)
		.then(() => { response.sendStatus(200); })
		.catch(() => { response.sendStatus(403); });
});

app.get('/tickets', async (_request, response) => {
	response.set('Access-Control-Allow-Origin', 'http://localhost:3000');

	tickets.getTickets()
		.then((tickets) => { response.json(tickets); })
		.catch(() => { response.sendStatus(403); });
});

app.post('/tickets', async (request, response) => {
	response.set('Access-Control-Allow-Origin', 'http://localhost:3000');

	if (request.body.data == null) {
		return response.sendStatus(403);
	}

	const { concert_id, row, column } = request.body.data;

	if (typeof concert_id != "number") {
		return response.sendStatus(403);
	}
	if (typeof row != "number") {
		return response.sendStatus(403);
	}
	if (typeof column != "number") {
		return response.sendStatus(403);
	}

	tickets.createTicket(concert_id, row, column)
		.then((ticket) => { response.json(ticket); })
		.catch(() => { response.sendStatus(403); });
});

app.get('/tickets/:id', async (request, response) => {
	response.set('Access-Control-Allow-Origin', 'http://localhost:3000');

	const id = parseInt(request.params.id);

	if (isNaN(id)) {
		return response.sendStatus(403);
	}

	tickets.getTicketByID(id)
		.then((ticket) => { response.json(ticket); })
		.catch(() => { response.sendStatus(403); });
});

app.listen(port, () => {
	console.log(`I'm listening on port ${port}`);
});
