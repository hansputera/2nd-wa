import axios from 'axios';
import {type Client} from '@typings/bot';
import {proto} from '@adiwajshing/baileys';
import {type DayUnion, type Schedule} from '@typings/schedule';
import {cleanSpace, capitalCase} from '@utils';

const $schedules = axios.create({
	// eslint-disable-next-line @typescript-eslint/naming-convention
	baseURL: 'https://smanti01.hanifs.tech',
});
export const schedulesRegex = /^jadwal (x(?:i|ii)? ip(?:a|s) [0-9]+)$/gi;
export const schedulesHandler = async (
	client: Client,
	msg: proto.IWebMessageInfo,
	matches: string[],
): Promise<void> => {
	const classTarget = matches?.at(1)?.replace(/\s+/g, '-');

	if (classTarget) {
		const response = await $schedules
			.get('/schedules/'.concat(classTarget.toLowerCase()), {
				params: {
					teachers: '1',
				},
			})
			.catch(() => undefined);
		if (response && response.status === 200) {
			const data = response.data.data as Record<DayUnion, Schedule[]>;

			if (Reflect.has(data, 'senin') || Reflect.has(data, 'rabu')) {
				await client.sendMessage(
					msg.key.remoteJid!,
					{
						text: 'Berikut merupakan jadwal dari kelas '.concat(
							classTarget.replace(/-/g, ' ').toUpperCase(),
						),
						title: 'Jadwal '.concat(
							classTarget.replace(/-/g, ' ').toUpperCase(),
						),
						buttonText: 'Klik untuk melihat',
						sections: Object.entries(data).map((entry) =>
							proto.Message.ListMessage.Section.create({
								title: 'Hari '.concat(
									entry[0].toUpperCase(),
									' - ',
									classTarget.toUpperCase().replace(/-/g, ' '),
								),
								rows: entry[1]
									.sort((a, b) => a.urutan - b.urutan)
									.map((r) =>
										proto.Message.ListMessage.Row.create({
											title: r.code
												? r
														.teacher!.mapel.map((x) =>
															capitalCase(x.replace(/_/g, ' ')),
														)
														.join(', ')
												: 'Istirahat',
											rowId: `${entry[0]}_${classTarget}_${r.urutan}`,
											description: `Dari ${cleanSpace(
												r.beginAt,
											)} hingga ${cleanSpace(
												r.endAt,
											)}, dengan nama pengajar ${r.teacher!.nama}`,
										}),
									),
							}),
						),
						footer: '© 2023 hansputera',
					},
					{
						quoted: msg,
					},
				);
			}
		}
	}
};
