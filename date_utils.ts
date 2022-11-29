export function parseDate(timestamp: string): Date {
	if (timestamp == null) {
		return null;
	}

	const parsedTimestamp = parseInt(timestamp);

	if (isNaN(parsedTimestamp)) {
		return null;
	}

	return new Date(parsedTimestamp);
}
