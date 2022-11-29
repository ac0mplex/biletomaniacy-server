import pool from './pool.js';

export async function getTicketsByConcertID(concertID: number): Promise<any> {
	return new Promise((resolve, reject) => {
		pool.query(
			'SELECT * FROM ticket',
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
