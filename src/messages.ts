import {type proto} from '@adiwajshing/baileys';
import {type Client} from '@typings/bot';

import {schedulesRegex, schedulesHandler} from '@actions/school-schedules';
import {CommandContext} from '@structures/context';

export const messagesHandler = async (
	client: Client,
	messages: proto.IWebMessageInfo[],
): Promise<void> => {
	const msg = messages.at(0);
	if (msg) {
		const text =
			msg.message?.conversation ?? msg.message?.extendedTextMessage?.text;

		if (text) {
			if (schedulesRegex.test(text)) {
				schedulesRegex.exec(text); // I don't know why, but it works
				await schedulesHandler(
					client,
					msg,
					schedulesRegex.exec(text) ?? [],
				);
			}
		}

		const commandContext = new CommandContext(
			msg,
			process.env.PREFIXES?.split(/\s+/g) ?? ['.'],
		);

		if (commandContext.isCommand) {
			Reflect.set(commandContext, 'client', client);

			await commandContext.getCommand()?.init(commandContext);
		}
	}
};
