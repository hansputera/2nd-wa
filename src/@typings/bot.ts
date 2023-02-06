import type makeWaSocket from '@adiwajshing/baileys';

export type Client = ReturnType<typeof makeWaSocket>;
export type ArgumentType = 'text' | 'url' | 'number';
export type Argument<T extends ArgumentType> = {
	type: T;
	default?: T extends 'number' ? number : string;
	value?: Argument<T>['default'];
	name: string;
	required?: boolean;
	isOption?: boolean;
	error?: Error | string;
};

export type CommandOptions = {
	name: string;
	description: string;
	args: Array<Argument<ArgumentType>>;
	cooldown?: number;
	aliases: string[];
};
