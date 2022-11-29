import pool from './pool.js';

export async function getConcerts(): Promise<any> {
	return new Promise((resolve, reject) => {
		pool.query(
			'SELECT * FROM concert',
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

export async function getConcertByID(id: number): Promise<any> {
	return new Promise((resolve, reject) => {
		pool.query(
			'SELECT * FROM concert where id = $1',
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
