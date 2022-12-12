import pool from './pool.js';

export async function getTickets(): Promise<any> {
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

export async function getTicketByID(id: number): Promise<any> {
	return new Promise((resolve, reject) => {
		pool.query(
			'SELECT * FROM ticket where id = $1',
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

export async function createTicket(
	concertID: number,
	row: number,
	column: number,
): Promise<any> {
	return new Promise(async (resolve, reject) => {
		if (!validateConcertID(concertID) || !validateRow(row) || !validateColumn(column)) {
			return reject();
		}

		const searchResult = await pool.query(
			'SELECT * FROM ticket WHERE "row" = $1 AND "column" = $2',
			[row, column]
		);

		if (searchResult.rows.length > 0) {
			// Ticket already exists
			reject();
		}

		pool.query(
			'INSERT INTO ticket ("row", "column", concert_id) ' +
			'VALUES ($1, $2, $3) RETURNING *',
			[row, column, concertID],
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

function validateConcertID(id: number): boolean {
	return id != null;
}

function validateRow(row: number): boolean {
	return row != null && row >= 0;
}

function validateColumn(column: number): boolean {
	return column != null && column >= 0;
}
