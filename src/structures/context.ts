import {type AnyMessageContent, type proto} from '@adiwajshing/baileys';
import {
	Lexer,
	Parser,
	type ParserResult,
	PrefixedStrategy,
} from '@sapphire/lexure';
import {type Client} from '@typings/bot';
import {type BaseCommand} from '@structures/command';
import {waCommands} from '@utils';

export class CommandContext {
	public client!: Readonly<Client>;

	#parser = new Parser(new PrefixedStrategy(['--'], ['=', ':']));

	#lexer = new Lexer({
		quotes: [
			['"', '"'],
			['“', '”'],
			['「', '」'],
		],
	});

	/**
	 * @constructor
	 * @param {proto.IWebMessageInfo} msg Raw message (proto.IWebMessageInfo)
	 * @param {string[]} prefixes Command prefixes
	 */
	constructor(
		public readonly msg: proto.IWebMessageInfo,
		private readonly prefixes: string[],
	) {}

	get content(): string {
		return (
			this.msg.message?.extendedTextMessage?.text ??
			this.msg.message?.conversation ??
			''
		);
	}

	get caption(): string {
		return (
			this.msg.message?.documentMessage?.caption ??
			this.msg.message?.imageMessage?.caption ??
			this.msg.message?.videoMessage?.caption ??
			''
		);
	}

	get flags(): string[] {
		return [...this.#data.flags];
	}

	get args(): string[] {
		return this.#data.ordered.map((order) => order.value).slice(1);
	}

	get isCommand(): boolean {
		for (const prefix of this.prefixes) {
			if (this.content.toLowerCase().startsWith(prefix)) {
				return true;
			}
		}

		return false;
	}

	get prefixMatch(): string | undefined {
		for (const prefix of this.prefixes) {
			if (this.content.toLowerCase().startsWith(prefix)) {
				return prefix;
			}
		}

		return undefined;
	}

	get command(): string | undefined {
		return this.#data.ordered
			.at(0)
			?.value.slice(this.prefixMatch?.length ?? 0);
	}

	getCommand<T extends BaseCommand>(): T {
		return waCommands.find(
			(cmd) =>
				cmd.name === this.command || cmd.aliases.includes(this.command!),
		) as T;
	}

	getOption(option: string): string[] {
		return this.#data.options.get(option) ?? [];
	}

	get #data(): ParserResult {
		return this.#parser.run(
			this.#lexer.run(this.caption.length ? this.caption : this.content),
		);
	}

	async reply(content: AnyMessageContent): Promise<void> {
		await this.client?.sendMessage(this.msg.key.remoteJid!, content, {
			quoted: this.msg,
		});
	}
}
