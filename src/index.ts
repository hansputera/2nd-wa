import 'dotenv/config';
import {messagesHandler} from './messages';
import {type Client} from '@typings/bot';
import makeWASocket, {Browsers, DisconnectReason} from '@adiwajshing/baileys';
import rimraf from 'rimraf';
import './commands';

import {
	generateKey,
	type Types,
	useSafeMultiAuthState,
} from 'safe-usemultiauthstate';
import qrImage from 'qr-image';
import {resolve as pathResolve} from 'node:path';
import {createWriteStream, existsSync} from 'node:fs';

const [sessionSecret, sessionSalt] = [
	Reflect.get(process.env, 'SESSION_KEY'),
	Reflect.get(process.env, 'SESSION_SALT'),
];

if (!sessionSecret || !sessionSalt) {
	throw new Error('Missing SESSION_KEY or SESSION_SALT !');
}

async function launchBot(key: Types.GeneratedKey, client?: Client) {
	const auth = await useSafeMultiAuthState(key, 'sessions');

	client ??= makeWASocket({
		auth: auth.state,
		markOnlineOnConnect: true,
		browser: Browsers.ubuntu('Firefox'),
	});

	client.ev.on('connection.update', async (conn) => {
		if (conn.qr) {
			qrImage
				.image(conn.qr, {type: 'png'})
				.pipe(createWriteStream('qr.png'));
		}

		if (conn.isNewLogin && conn.connection === 'open') {
			if (existsSync(pathResolve(__dirname, 'qr.png'))) {
				await rimraf(pathResolve(__dirname, 'qr.png'));
			}
		}

		if (conn.lastDisconnect?.error) {
			switch (
				(
					conn.lastDisconnect?.error as unknown as {
						output: {statusCode: number};
					}
				).output.statusCode
			) {
				case DisconnectReason.loggedOut:
					await rimraf(pathResolve(__dirname, 'sessions'));
					break;
				case DisconnectReason.restartRequired:
					client = undefined;
					void launchBot(key);
					break;
				case DisconnectReason.badSession:
					await rimraf(pathResolve(__dirname, 'sessions'));
					client = undefined;
					void launchBot(key);
					break;
				default:
					client = undefined;
					void launchBot(key);
			}
		}

		await auth.saveCreds();
	});

	client.ev.on('messages.upsert', ({messages}) => {
		void messagesHandler(client!, messages);
	});
}

async function launch() {
	const key = await generateKey(sessionSecret!, sessionSalt!);
	return launchBot(key);
}

void launch();
