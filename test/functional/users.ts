import pool from '../../src/data/pool.js';
import { expect } from 'chai';
import request from 'supertest';

const exampleUser = {
	data: {
		name: 'testuser',
		password: 'Zaq12wsx'
	},
};

describe('Users route', () => {
	let app: Express.Application

	before('Initialize app', async () => {
		let importedApp = await import('../../src/app.js');
		app = importedApp.app;
	});

	beforeEach('Create temporary tables', async () => {
		await pool.query(
			'CREATE TEMPORARY TABLE "user" (LIKE "user" INCLUDING ALL)'
		);
	});

	afterEach('Drop temporary tables', async () => {
		await pool.query('DROP TABLE IF EXISTS pg_temp."user"');
	});

	describe('Register a new user', function () {
		it('Should create a new user', async () => {
			await postUser(exampleUser);

			const { rows } = await pool.query('SELECT * FROM "user"');
			expect(rows).lengthOf(1);
			expect(rows[0].name).equal(exampleUser.data.name);
		});

		it('Should fail if user already exists', async () => {
			await postUser(exampleUser);
			await postUser(exampleUser, 403);
		});

		it('Should fail if no params specified', async () => {
			await postUser({}, 403);
		});
	});

	async function postUser(data: any, status = 200) {
		const { body } = await request(app)
			.post('/register')
			.send(data)
			.expect(status);

		return body;
	}
});
