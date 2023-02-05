import {BaseCommand} from '@structures/command';
import {type CommandContext} from '@structures/context';
import {registerCommand} from '@utils';

export class MenuCommand extends BaseCommand {
	async run(context: CommandContext): Promise<void> {
		await context.reply('Hello world!');
	}
}

registerCommand(
	{
		name: 'menu',
		description: 'Show menu',
		aliases: ['help'],
		args: [],
	},
	MenuCommand,
);
