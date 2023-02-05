import {
	type ArgumentType,
	type CommandOptions,
	type Argument,
	type Client,
} from '@typings/bot';
import {type CommandContext} from '@structures/context';

export class BaseCommand {
	public name!: string;
	public description!: string;
	public args: Array<Argument<ArgumentType>> = [];
	public cooldown!: number;
	public aliases: string[] = [];

	#client!: Client;

	/**
	 * @constructor
	 * @param {CommandOptions} options Command options to apply
	 */
	constructor(options: CommandOptions) {
		if (typeof options.name !== 'string')
			throw new TypeError('Invalid options.name');
		this.name = options.name;
		this.description = options.description || '';
		this.args = Array.isArray(options.args) ? options.args : [];
		this.cooldown =
			typeof options.cooldown === 'number' && options.cooldown >= 1_000
				? options.cooldown
				: 5_000;
		this.aliases = Array.isArray(options.aliases) ? options.aliases : [];
	}

	async run(context: CommandContext): Promise<void> {
		await context.reply(`It's a default message for ${this.name} command`);
	}

	async init(context: CommandContext): Promise<void> {
		if (typeof this.run === 'function') {
			await this.run(context);
		}
	}

	/**
	 * Override client
	 * @param {Client} client WhatsApp Bot Client
	 * @return {BaseCommand}
	 */
	setClient(client: Client): this {
		this.#client = client;
		return this;
	}
}
