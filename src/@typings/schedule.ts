export type Teacher = {
	nama: string;
	mapel: string[];
	jam_mengajar: number;
	keterangan: string;
};

export type Schedule = {
	urutan: number;
	beginAt: string;
	endAt: string;
	teacher?: Teacher;
	code: number;
};

export type DayUnion = 'senin' | 'selasa' | 'rabu' | 'kamis' | 'jumat';
