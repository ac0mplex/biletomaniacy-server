import crypto from 'crypto';

export class HashResult {
	hash: string;
	salt: string;
};

export function hash(password: string): HashResult {
	const salt = crypto.randomBytes(16).toString('base64');
	// Based on recommendations by OWASP:
	// https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
	const hash = crypto.pbkdf2Sync(password, salt, 310000, 32, 'sha256').toString('base64');

	return {
		hash: hash,
		salt: salt
	};
}

export function compare(
	password: string,
	salt: string,
	precalculated_hash: string
): boolean {
	// Based on recommendations by OWASP:
	// https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
	const hash = crypto.pbkdf2Sync(password, salt, 310000, 32, 'sha256');
	const hash_to_compare = Buffer.from(precalculated_hash, 'base64');
	const validPassword = crypto.timingSafeEqual(hash_to_compare, hash);

	return validPassword;
}
