// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: hosting-chirho/public-site-chirho.md (optional, additive word IPA).
// Broad word-level teaching transcription, not an acoustic transcription or reconstructed pitch.
// Rules: https://blogs.sch.gr/4dimgala/kanones-proforas-tis-ellinikis-glossas/
// Breathing: https://dcc.dickinson.edu/grammar/age/breathing-marks
export type GreekIpaProfileChirho = 'modern' | 'modern_aspirates' | 'erasmian';
const MODERN_LETTERS_CHIRHO: Record<string, string> = {
	α: 'a',
	ε: 'e',
	η: 'i',
	ι: 'i',
	ο: 'o',
	υ: 'i',
	ω: 'o',
	β: 'v',
	γ: 'ɣ',
	δ: 'ð',
	ζ: 'z',
	θ: 'θ',
	κ: 'k',
	λ: 'l',
	μ: 'm',
	ν: 'n',
	ξ: 'ks',
	π: 'p',
	ρ: 'r',
	σ: 's',
	ς: 's',
	τ: 't',
	φ: 'f',
	χ: 'x',
	ψ: 'ps'
};
const ERASMIAN_LETTERS_CHIRHO: Record<string, string> = {
	...MODERN_LETTERS_CHIRHO,
	η: 'eː',
	ω: 'oː',
	υ: 'y',
	β: 'b',
	γ: 'ɡ',
	δ: 'd',
	φ: 'pʰ',
	χ: 'kʰ'
};
const MODERN_PAIRS_CHIRHO: Record<string, string> = { αι: 'e', ει: 'i', οι: 'i', υι: 'i', ου: 'u' };
const ERASMIAN_PAIRS_CHIRHO: Record<string, string> = {
	αι: 'ai',
	ει: 'ei',
	οι: 'oi',
	υι: 'yi',
	ου: 'uː',
	αυ: 'au',
	ευ: 'eu',
	ηυ: 'eːu'
};
const ONSETS_CHIRHO = new Set([
	'pr',
	'tr',
	'kr',
	'ɡr',
	'br',
	'dr',
	'fr',
	'vr',
	'θr',
	'ðr',
	'xr',
	'ɣr',
	'kʰr',
	'pʰr',
	'pl',
	'kl',
	'ɡl',
	'bl',
	'fl',
	'vl',
	'θl',
	'xl',
	'ɣl',
	'kʰl',
	'pʰl',
	'sp',
	'st',
	'sk',
	'sf',
	'sθ',
	'sx',
	'sm',
	'sn',
	'sl',
	'str',
	'spr',
	'skr',
	'ps',
	'ks'
]);
interface PieceChirho {
	sound_chirho: string;
	vowel_chirho: boolean;
	stress_chirho: boolean;
}
/** Analysis uses an NFD copy. The supplied source and all lookup keys stay untouched. */
export function greekWordIpaChirho(
	sourceChirho: string,
	profileChirho: GreekIpaProfileChirho
): string | null {
	if (!sourceChirho || sourceChirho.length > 200) return null;
	const clustersChirho =
		sourceChirho
			.toLocaleLowerCase('el')
			.normalize('NFD')
			.match(/\p{L}\p{M}*/gu) ?? [];
	if (
		!clustersChirho.length ||
		clustersChirho.some((clusterChirho) => !MODERN_LETTERS_CHIRHO[clusterChirho[0]])
	)
		return null;
	const erasmianChirho = profileChirho === 'erasmian';
	const mapChirho = erasmianChirho ? ERASMIAN_LETTERS_CHIRHO : MODERN_LETTERS_CHIRHO;
	const partsChirho: PieceChirho[] = [];
	const frontChirho = (indexChirho: number) => {
		const firstChirho = clustersChirho[indexChirho]?.[0] ?? '';
		const pairChirho = firstChirho + (clustersChirho[indexChirho + 1]?.[0] ?? '');
		return /[ειηυ]/u.test(firstChirho) || pairChirho === 'αι' || pairChirho === 'οι';
	};
	if (
		profileChirho !== 'modern' &&
		clustersChirho.slice(0, 2).some((clusterChirho) => clusterChirho.includes('\u0314'))
	) {
		if (clustersChirho[0]?.[0] !== 'ρ')
			partsChirho.push({ sound_chirho: 'h', vowel_chirho: false, stress_chirho: false });
	}
	for (let indexChirho = 0; indexChirho < clustersChirho.length; indexChirho++) {
		const clusterChirho = clustersChirho[indexChirho],
			letterChirho = clusterChirho[0];
		const nextChirho = clustersChirho[indexChirho + 1],
			pairChirho = letterChirho + (nextChirho?.[0] ?? '');
		const vowelChirho = /[αεηιουω]/u.test(letterChirho);
		let soundChirho = mapChirho[letterChirho],
			stressChirho = /[\u0300\u0301\u0342]/u.test(clusterChirho);
		const pairsChirho = erasmianChirho ? ERASMIAN_PAIRS_CHIRHO : MODERN_PAIRS_CHIRHO;
		if (
			nextChirho &&
			!nextChirho.includes('\u0308') &&
			!stressChirho &&
			(pairsChirho[pairChirho] || (!erasmianChirho && ['αυ', 'ευ', 'ηυ'].includes(pairChirho)))
		) {
			soundChirho =
				pairsChirho[pairChirho] ??
				({ αυ: 'a', ευ: 'e', ηυ: 'i' } as Record<string, string>)[pairChirho] +
					(!clustersChirho[indexChirho + 2] ||
					/[κπτθχφσςξψ]/u.test(clustersChirho[indexChirho + 2][0])
						? 'f'
						: 'v');
			stressChirho = /[\u0300\u0301\u0342]/u.test(nextChirho);
			indexChirho++;
		} else if (
			!erasmianChirho &&
			['μπ', 'ντ', 'γκ', 'γγ', 'γχ', 'γξ', 'τσ', 'τζ'].includes(pairChirho)
		) {
			const frontNextChirho = frontChirho(indexChirho + 2);
			const consonantsChirho: Record<string, string> = {
				μπ: indexChirho === 0 ? 'b' : 'mb',
				ντ: indexChirho === 0 ? 'd' : 'nd',
				γκ: indexChirho === 0 ? 'ɡ' : 'ŋɡ',
				γγ: 'ŋɡ',
				γχ: 'ŋx',
				γξ: 'ŋks',
				τσ: 't͡s',
				τζ: 'd͡z'
			};
			soundChirho = consonantsChirho[pairChirho];
			if (frontNextChirho && pairChirho !== 'γξ')
				soundChirho = soundChirho.replaceAll('ŋ', 'ɲ').replaceAll('ɡ', 'ɟ').replaceAll('x', 'ç');
			indexChirho++;
		} else if (!erasmianChirho) {
			if (frontChirho(indexChirho + 1))
				soundChirho =
					letterChirho === 'γ'
						? 'ʝ'
						: letterChirho === 'χ'
							? 'ç'
							: letterChirho === 'κ'
								? 'c'
								: soundChirho;
			if (letterChirho === 'σ' && nextChirho && /[βγδζλμνρ]/u.test(nextChirho[0]))
				soundChirho = 'z';
			if (
				letterChirho === 'ρ' &&
				profileChirho === 'modern_aspirates' &&
				clusterChirho.includes('\u0314')
			)
				soundChirho = 'r̥';
			// Modern doubles are one consonant; the nasal digraphs above remain distinct.
			if (!vowelChirho && nextChirho?.[0] === letterChirho) indexChirho++;
		} else {
			if (letterChirho === 'γ' && nextChirho && /[γκξχ]/u.test(nextChirho[0])) soundChirho = 'ŋ';
			if (letterChirho === 'ρ' && clusterChirho.includes('\u0314')) soundChirho = 'r̥';
		}
		if (!vowelChirho && /^[mnŋɲ].+/u.test(soundChirho)) {
			partsChirho.push({ sound_chirho: soundChirho[0], vowel_chirho: false, stress_chirho: false });
			soundChirho = soundChirho.slice(1);
		}
		partsChirho.push({
			sound_chirho: soundChirho,
			vowel_chirho: vowelChirho,
			stress_chirho: stressChirho
		});
	}
	const nucleiChirho = partsChirho.flatMap((partChirho, indexChirho) =>
		partChirho.vowel_chirho ? [indexChirho] : []
	);
	const accentsChirho = new Set<number>();
	if (nucleiChirho.length > 1)
		for (const indexChirho of nucleiChirho) {
			if (!partsChirho[indexChirho].stress_chirho) continue;
			const previousChirho = nucleiChirho.filter((valueChirho) => valueChirho < indexChirho).at(-1);
			let onsetChirho = previousChirho === undefined ? 0 : indexChirho;
			if (previousChirho !== undefined && indexChirho > previousChirho + 1) {
				onsetChirho = indexChirho - 1;
				for (let startChirho = previousChirho + 1; startChirho < indexChirho; startChirho++)
					if (
						ONSETS_CHIRHO.has(
							partsChirho
								.slice(startChirho, indexChirho)
								.map((partChirho) => partChirho.sound_chirho)
								.join('')
						)
					) {
						onsetChirho = startChirho;
						break;
					}
			}
			accentsChirho.add(onsetChirho);
		}
	return partsChirho
		.map(
			(partChirho, indexChirho) =>
				(accentsChirho.has(indexChirho) ? 'ˈ' : '') + partChirho.sound_chirho
		)
		.join('');
}
