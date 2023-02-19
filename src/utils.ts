import {Collection} from '@discordjs/collection';
import {type BaseCommand} from '@structures/command';
import {type CommandOptions} from '@typings/bot';

export const capitalCase = (text: string): string =>
	text
		.split(/\s+/g)
		.map((x) => x[0].toUpperCase() + x.slice(1))
		.join(' ');

export const cleanSpace = (text: string): string =>
	text.trim().replace(/\s+/g, '');

export const waCommands = new Collection<string, BaseCommand>();
export const registerCommand = <T extends typeof BaseCommand>(
	options: CommandOptions,
	Target: T,
) => {
	const instance = new Target(options);

	waCommands.set(options.name, instance);
};

export const isValidUrl = (url: string): boolean => {
	try {
		return Boolean(new URL(url));
	} catch {
		return false;
	}
};

export const chunkArray = <T>(arr: T[], size: number): T[][] =>
	arr.reduce(
		(acc, _, i) => (i % size ? (acc as T[]) : [...acc, arr.slice(i, i + size)]),
		[],
	) as T[][];
