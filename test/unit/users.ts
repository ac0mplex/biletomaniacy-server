import pool from '../../src/data/pool.js';
import { expect } from 'chai';
import * as users from '../../src/data/users.js';

const exampleUser = {
	name: 'testuser',
	password: 'Zaq12wsx'
};

describe('Users module', () => {
	beforeEach('Create temporary tables', async () => {
		await pool.query(
			'CREATE TEMPORARY TABLE "user" (LIKE "user" INCLUDING ALL)'
		);
	});

	afterEach('Drop temporary tables', async () => {
		await pool.query('DROP TABLE IF EXISTS pg_temp."user"');
	});

	describe('Create default admin if necessary', function () {
		it('Create default admin if necessary', async () => {
			await users.createDefaultAdminIfNecessary();

			const { rows } = await pool.query('SELECT * FROM "user"');
			expect(rows).lengthOf(1);
			expect(rows[0].name).equal('admin');
		});

		it('Only one default admin', async () => {
			await users.createDefaultAdminIfNecessary();
			await users.createDefaultAdminIfNecessary();

			const { rows } = await pool.query('SELECT * FROM "user"');
			expect(rows).lengthOf(1);
			expect(rows[0].name).equal('admin');
		});
	});

	describe('User creation', function () {
		it('Create new user', async () => {
			await users.createUser(exampleUser.name, exampleUser.password);

			const { rows } = await pool.query('SELECT * FROM "user"');
			expect(rows).lengthOf(1);
			expect(rows[0].name).equal(exampleUser.name);
		});
	});

	describe('User modification', function () {
		it('Create and edit user', async () => {
			await users.createUser(exampleUser.name, exampleUser.password);

			const { rows } = await pool.query('SELECT * FROM "user"');
			expect(rows).lengthOf(1);
			expect(rows[0].name).equal(exampleUser.name);

			await users.editUser(rows[0].id, "userName", exampleUser.password, false);

			const result = await pool.query('SELECT * FROM "user"');
			const rows2 = result.rows;
			expect(rows2).lengthOf(1);
			expect(rows2[0].name).equal("userName");
		});
	});
});
