import {Collection} from '@discordjs/collection';
import {type CommandContext} from '@structures/context';
import type {Argument, ArgumentType} from '@typings/bot';
import {isValidUrl} from '@utils';

export class ArgumentContext {
	#data!: Collection<
	string,
	Argument<ArgumentType> | Array<Argument<ArgumentType>>
	>;

	#inputs!: string[];

	constructor(
		private readonly ctx: CommandContext,
		private readonly args: Array<Argument<ArgumentType>>,
	) {
		this.#inputs = ctx.args;
		this.#data = new Collection();
		this.#init();
	}

	get<V extends Argument<ArgumentType>>(name: string): V | undefined {
		return this.#data.get(name) as V;
	}

	async throwNoExistsRequiredArgs(sent = false): Promise<void> {
		const required = this.fails
			.map((fail) => this.args.find((a) => a.name === fail && a.required))
			.filter((fail) => typeof fail !== 'undefined')
			.shift();

		if (required) {
			if (sent) {
				await this.ctx.reply({
					text: required.error
						? required.error instanceof Error
							? required.error.message
							: required.error
						: `Missing ${required.name} argument, the datatype for this argument is ${required.type}`,
				});
			} else {
				throw required.error instanceof Error
					? required.error
					: new Error(
						required.error ??
								`Missing ${required.name} argument, the datatype for this argument is ${required.type}`,
					  );
			}
		}
	}

	#initArgument(argument: Argument<ArgumentType>, value?: string): boolean {
		const valueOfArg = value ?? this.#inputs.shift();

		if (valueOfArg)
			switch (argument.type) {
				case 'number':
					if (/[0-9]+/gi.test(valueOfArg)) {
						argument.value = parseInt(valueOfArg.trim(), 10);
						break;
					} else {
						if (argument.default) {
							argument.value = argument.default;
							break;
						}

						return false;
					}

				case 'url':
					if (isValidUrl(valueOfArg)) {
						argument.value = valueOfArg.trim();
						break;
					} else {
						if (argument.default) {
							argument.value = argument.default;
							break;
						}

						break;
					}

				default:
					argument.value = valueOfArg.trim();
					break;
			}

		if (this.#data.has(argument.name)) {
			const values = this.#data.get(argument.name);
			if (Array.isArray(values)) {
				values.push(argument);

				this.#data.set(argument.name, values);
			} else {
				this.#data.set(argument.name, [values!, argument]);
			}
		} else if (argument.value) {
			this.#data.set(argument.name, argument);
		}

		return true;
	}

	#init(): void {
		for (const argument of this.args) {
			if (argument.value) {
				Reflect.deleteProperty(argument, 'value');
			}

			if (argument.isOption) {
				const valueFromOption = this.ctx.getOption(argument.name);
				valueFromOption.forEach((valueOption) => {
					this.#initArgument(argument, valueOption);
				});
			}

			this.#initArgument(argument);
		}

		this.#inputs = [];
	}

	get fails(): string[] {
		return this.args
			.filter((arg) => !this.#data.has(arg.name))
			.map((x) => x.name);
	}
}
