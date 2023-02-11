import {downloadEncryptedContent, getMediaKeys} from '@adiwajshing/baileys';
import {BaseCommand} from '@structures/command';
import {type CommandContext} from '@structures/context';
import {registerCommand} from '@utils';
import gm from 'gm';

export class StickerToMediaCommand extends BaseCommand {
	async run(context: CommandContext): Promise<void> {
		const replySticker =
			context.msg.message?.extendedTextMessage?.contextInfo?.quotedMessage
				?.stickerMessage;

		if (!replySticker?.url?.length) {
			await context.reply({
				text: 'Reply a sticker :)',
			});
			return;
		}

		const imageOnly = context.flags.find((flag) =>
			Boolean(flag.toLowerCase().match(/^(im(?:a)?g(?:e)?only)$/gi)),
		);
		const sticker = await downloadEncryptedContent(
			replySticker?.url ?? '',
			getMediaKeys(replySticker?.mediaKey, 'sticker'),
		);

		gm(sticker).toBuffer(
			replySticker?.isAnimated && !imageOnly ? 'gif' : 'png',
			async (err, buff) => {
				if (err) {
					await context.reply({
						text: 'Fail to convert the sticker, because ' + err.message,
					});
				} else {
					await context.reply({
						image: buff,
						caption: 'sticker converted at ' + Date.now().toString(),
					});
				}
			},
		);
	}
}

registerCommand(
	{
		name: 'sticker-to-media',
		description: 'Convert sticker to media (photo/video)',
		aliases: ['stm', 'stom', 's2m'],
		cooldown: 5000,
		args: [],
	},
	StickerToMediaCommand,
);
