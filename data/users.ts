import * as password_utils from '../password_utils.js';
import pool from './pool.js';
import { getIfValid, update } from './utils.js';

export async function createUser(name: string, password: string): Promise<any> {
	return new Promise((resolve, reject) => {
		if (!validateName(name) || !validatePassword(password)) {
			return reject();
		}

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
		if (!validateName(name) || !validatePassword(password)) {
			return reject();
		}

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
	admin: boolean
): Promise<void> {
	return new Promise(async (resolve, reject) => {
		pool.query(
			'SELECT * FROM "user" where id = $1',
			[id], (error, results) => {
				if (error || results.rows.length == 0) {
					return reject();
				}

				var user = results.rows[0]

				if (!update(user, "name", name, validateName)) {
					return reject();
				}

				if (!update(user, "password", password, validatePassword)) {
					return reject();
				}

				const isPasswordValid = getIfValid(
					password,
					validatePassword,
					(validPassword) => {
						const result = password_utils.hash(validPassword);
						user.password = result.hash;
						user.salt = result.salt;
					}
				);
				if (!isPasswordValid) {
					return reject();
				}

				if (!update(user, "admin", admin, validateAdmin)) {
					return reject();
				}

				pool.query(
					'UPDATE "user" SET name = $1, password = $2, salt = $3, admin = $4 ' +
					'WHERE id = $5',
					[ user.name, user.password, user.salt, user.admin, id ],
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

function validateName(name: string): boolean {
	return name != null && name.length > 0;
}

function validatePassword(password: string): boolean {
	return password != null && password.length > 0;
}

function validateAdmin(admin: boolean): boolean {
	return admin != null;
}
