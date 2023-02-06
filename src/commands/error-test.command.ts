import {BaseCommand} from '@structures/command';
import {type CommandContext} from '@structures/context';
import {registerCommand} from '@utils';

export class ErrorTestCommand extends BaseCommand {
	async run(_context: CommandContext): Promise<void> {
		throw new Error('Error test works!');
	}
}

registerCommand(
	{
		name: 'error-test',
		description: 'Error test command',
		aliases: ['errtest', 'error-debug', 'errdbg'],
		args: [],
	},
	ErrorTestCommand,
);
