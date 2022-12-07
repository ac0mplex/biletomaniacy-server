import pool from './pool.js';
import { Mutex } from 'async-mutex';

const reservations: Reservation[] = []
const mutex = new Mutex();

const maxReservationTimeSeconds = 300;

class Reservation {
	ticketID: number;
	userID: string;
	timestamp: number;
};

removeExpiredReservations();


export async function reserveTicketForUser(ticketID: any, userID: string): Promise<void> {
	if (!await checkIfTicketReadyToReserve(ticketID)) {
		return Promise.reject();
	}

	if (!await checkIfUserExists(userID)) {
		return Promise.reject();
	}


	return mutex.runExclusive(async() => {
		const found = reservations.find(
			reservation => reservation.ticketID == ticketID
		);

		if (found != undefined) {
			return Promise.reject();
		}

		reservations.push({
			ticketID: ticketID,
			userID: userID,
			timestamp: Date.now()
		});

		try {
			await pool.query(
				'UPDATE ticket SET user_id = $1 WHERE id = $2',
				[ userID, ticketID ]
			);
		} catch (e) {
			return Promise.reject();
		}
	});
}

export async function payForTicketByUser(ticketID: number, userID: string): Promise<void> {
	if (!await checkIfTicketReadyToPay(ticketID, userID)) {
		return Promise.reject();
	}

	if (!await checkIfUserExists(userID)) {
		return Promise.reject();
	}

	return mutex.runExclusive(async() => {
		const found = reservations.find(reservation =>
				reservation.ticketID == ticketID && reservation.userID == userID
		);

		if (found == null) {
			return Promise.reject();
		}

		const index = reservations.indexOf(found);
		reservations.splice(index, 1);

		try {
			await pool.query(
				'UPDATE ticket SET payed = true WHERE id = $1',
				[ ticketID ]
			);
		} catch (e) {
			return Promise.reject();
		}
	});
}

async function removeExpiredReservations() {
	await mutex.runExclusive(async () => {
		let i = 0, j = 0;
		let ticketIDsToRelease = []

		while (i < reservations.length) {
			const reservation = reservations[i];
			const timeDiff = Date.now() - reservation.timestamp;
			const seconds = timeDiff / 1000;

			if (seconds <= maxReservationTimeSeconds) {
				reservations[j] = reservation;
				j++;
			} else {
				ticketIDsToRelease.push(reservation.ticketID);
			}

			i++;
		}

		reservations.length = j;

		console.log(`removeExpiredReservations: ${ticketIDsToRelease.length} removed`);

		try {
			await pool.query(
				'UPDATE ticket SET user_id = null WHERE id = ANY($1)',
				[ticketIDsToRelease]
			);
		} catch (e) {
			return mutex.cancel();
		}
	});

	setTimeout(removeExpiredReservations, 5000);
}

async function checkIfTicketReadyToReserve(ticketID: number): Promise<boolean> {
	const result = await pool.query(
		'SELECT * FROM ticket WHERE id = $1 AND user_id IS null',
		[ticketID]
	);
	return result.rows.length > 0;
}

async function checkIfTicketReadyToPay(ticketID: number, userID: string): Promise<boolean> {
	const result = await pool.query(
		'SELECT * FROM ticket WHERE id = $1 AND user_id = $2',
		[ticketID, userID]
	);
	return result.rows.length > 0;
}

async function checkIfUserExists(userID: string): Promise<boolean> {
	const result = await pool.query(
		'SELECT * FROM "user" WHERE id = $1',
		[userID]
	);
	return result.rows.length > 0;
}
