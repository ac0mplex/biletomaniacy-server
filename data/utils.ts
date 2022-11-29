export function update(
	obj: any,
	property: string,
	value: any,
	validator: (value: any) => boolean,
): boolean {
	return getIfValid(value, validator, (validValue) => {
		obj[property] = validValue;
	});
}

export function getIfValid(
	value: any,
	validator: (value: any) => boolean,
	customSetter: (value: any) => void,
): boolean {
	if (value != null) {
		if (validator(value)) {
			customSetter(value);
			return true;
		} else {
			return false;
		}
	}

	return true;
}
