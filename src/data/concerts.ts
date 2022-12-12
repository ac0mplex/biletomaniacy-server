import pool from './pool.js';
import { getIfValid, update } from './utils.js';

export async function createConcert(
	name: string,
	date: Date,
	location: string,
): Promise<any> {
	return new Promise((resolve, reject) => {
		if (!validateName(name) || !validateDate(date)) {
			return reject();
		}

		if (location == null) {
			location = "";
		}

		pool.query(
			'INSERT INTO concert (name, date, location) ' +
			'VALUES ($1, $2, $3) RETURNING *',
			[name, date.toISOString(), location],
			(error, results) => {
				if (error || results.rows.length == 0) {
					reject(error);
				} else {
					const concert = convertDate(results.rows[0]);
					resolve(concert);
				}
			}
		);
	});
}

export async function getConcerts(): Promise<any> {
	return new Promise((resolve, reject) => {
		pool.query(
			'SELECT * FROM concert',
			(error, results) => {
				if (error) {
					reject(error);
				} else {
					const concerts = results.rows.map(
						(concert) => convertDate(concert)
					);
					resolve(concerts);
				}
			}
		);
	});
}

export async function getConcertByID(id: number): Promise<any> {
	return new Promise((resolve, reject) => {
		pool.query(
			'SELECT * FROM concert where id = $1',
			[id],
			(error, results) => {
				if (error || results.rows.length == 0) {
					reject();
				} else {
					const concert = convertDate(results.rows[0]);
					resolve(concert);
				}
			}
		);
	});
}

export async function editConcert(
	id: number,
	name: string,
	date: Date,
	location: string,
): Promise<void> {
	return new Promise(async (resolve, reject) => {
		pool.query(
			'SELECT * FROM concert where id = $1',
			[id], (error, results) => {
				if (error || results.rows.length == 0) {
					return reject();
				}

				var concert = results.rows[0]

				if (!update(concert, "name", name, validateName)) {
					return reject();
				}

				const isDateValid = getIfValid(date, validateDate, (validDate) => {
					concert.date = validDate.toISOString();
				});
				if (!isDateValid) {
					return reject();
				}

				if (!update(concert, "location", location, validateLocation)) {
					return reject();
				}

				pool.query(
					'UPDATE concert SET name = $1, date = $2, location = $3 ' +
					'WHERE id = $4',
					[ concert.name, concert.date, concert.location, id ],
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

function validateDate(date: Date): boolean {
	return date != null;
}

function validateLocation(location: string): boolean {
	return location != null && location.length > 0;
}

function convertDate(concert: any): any {
	concert.date = new Date(concert.date).getTime();
	return concert;
}
