import {type proto} from '@adiwajshing/baileys';
import {BaseCommand} from '@structures/command';
import {type CommandContext} from '@structures/context';
import {chunkArray, registerCommand, waCommands} from '@utils';

export class MenuCommand extends BaseCommand {
	async run(context: CommandContext): Promise<void> {
		const commandOnRequest = this.argsInstance.get('command');
		if (typeof commandOnRequest?.value === 'string') {
			const command = waCommands.find(
				(cmd) =>
					cmd.name === (commandOnRequest.value as string).toLowerCase() ||
					cmd.aliases.includes(
						(commandOnRequest.value as string).toLowerCase(),
					),
			);

			if (!command) {
				await context.reply({
					text: 'I couldn\'t find that command!',
				});
				return;
			}

			await context.reply({
				text: `${command.name} - ${command.description}\nAliases: ${
					command.aliases.length ? command.aliases.join(', ') : '-'
				}`,
			});
			return;
		}

		const sections: proto.Message.ListMessage.ISection[] = chunkArray(
			[...waCommands.entries()],
			10,
		).map((entry1, index) => ({
			title: 'Commands Section #' + (index + 1).toString(),
			rows: entry1.map((entries) => ({
				title: entries[0].toUpperCase() + ' Command',
				description: entries[1].description,
				rowId: entries[0],
			})),
		}));
		await context.reply({
			sections,
			text: 'Here is the list of registered commands',
			title: 'Command List',
			buttonText: 'Click me to view commands',
		});
	}
}

registerCommand(
	{
		name: 'menu',
		description: 'Show menu',
		aliases: ['help'],
		args: [
			{
				name: 'command',
				type: 'text',
			},
		],
	},
	MenuCommand,
);
