import * as password_utils from '../password_utils.js';
import pool from './pool.js';

export async function createUser(name: string, password: string): Promise<any> {
	return new Promise((resolve, reject) => {
		const result = password_utils.hash(password);
		const id = crypto.randomUUID();

		pool.query(
			'INSERT INTO "user" (id, name, password, salt) ' +
			'VALUES ($1, $2, $3, $4) RETURNING *',
			[id, name, result.hash, result.salt],
			(error, results) => {
				if (error || results.rows.length == 0) {
					reject(error);
				} else {
					resolve(results.rows[0]);
				}
			}
		);
	});
}

export async function logInAs(name: string, password: string): Promise<any> {
	return new Promise((resolve, reject) => {
		pool.query(
			'SELECT id, name, password, salt FROM "user" WHERE name = $1',
			[name],
			(error, results) => {
				if (error || results.rows.length == 0) {
					return reject(error);
				} 

				const user = results.rows[0];
				const validPassword = password_utils.compare(
					password, user.salt, user.password
				);

				if (validPassword) {
					resolve(user);
				} else {
					reject();
				}
			}
		);
	});
}

export async function getUsers(): Promise<any> {
	return new Promise((resolve, reject) => {
		pool.query(
			'SELECT id, name, admin FROM "user"',
			(error, results) => {
				if (error) {
					reject(error);
				} else {
					resolve(results.rows);
				}
			}
		);
	});
}

export async function getUserByID(id: string): Promise<any> {
	return new Promise((resolve, reject) => {
		pool.query(
			'SELECT id, name, admin FROM "user" where id = $1',
			[id],
			(error, results) => {
				if (error || results.rows.length == 0) {
					reject();
				} else {
					resolve(results.rows[0]);
				}
			}
		);
	});
}

export async function editUser(
	id: string,
	name: string,
	password: string,
): Promise<void> {
	return new Promise(async (resolve, reject) => {
		pool.query(
			'SELECT id, name, password, salt FROM "user" where id = $1',
			[id], (error, results) => {
				if (error || results.rows.length == 0) {
					return reject();
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
					'UPDATE "user" SET name = $1, password = $2, salt = $3 ' +
					'WHERE id = $4',
					[ user.name, user.password, user.salt, id ],
					(error, _results) => {
						if (error) {
							reject(error);
						} else {
							resolve();
						}
					}
				);
			}
		);
	});
}
