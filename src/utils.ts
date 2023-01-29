export const capitalCase = (text: string): string =>
	text
		.split(/\s+/g)
		.map((x) => x[0].toUpperCase() + x.slice(1))
		.join(' ');

export const cleanSpace = (text: string): string =>
	text.trim().replace(/\s+/g, '');
