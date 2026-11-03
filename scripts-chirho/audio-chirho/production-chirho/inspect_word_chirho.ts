// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: reusable-word-audio-chirho.md. Preserve the MP3; skip only measured quiet at playback.
import {
	execFileSync as execFileSyncChirho,
	spawnSync as spawnSyncChirho
} from 'node:child_process';

export function inspectWordChirho(pathChirho: string) {
	const infoChirho = JSON.parse(
		execFileSyncChirho(
			'ffprobe',
			[
				'-v',
				'error',
				'-show_entries',
				'format=duration:stream=codec_name',
				'-of',
				'json',
				pathChirho
			],
			{ encoding: 'utf8', timeout: 30000 }
		)
	);
	const durationChirho = Number(infoChirho.format.duration);
	if (
		infoChirho.streams.length !== 1 ||
		infoChirho.streams[0].codec_name !== 'mp3' ||
		!Number.isFinite(durationChirho) ||
		durationChirho <= 0 ||
		durationChirho > 30
	)
		throw new Error('Word recording duration/codec refused');
	const decodedChirho = spawnSyncChirho(
		'ffmpeg',
		['-v', 'info', '-i', pathChirho, '-af', 'silencedetect=noise=-50dB:d=0.07', '-f', 'null', '-'],
		{ encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 30000 }
	);
	if (decodedChirho.error || decodedChirho.status !== 0)
		throw new Error('Word audio decode failed');
	const spansChirho: { start_chirho: number; end_chirho: number }[] = [];
	let startChirho: number | undefined;
	for (const matchChirho of decodedChirho.stderr.matchAll(/silence_(start|end): ([\d.]+)/gu)) {
		if (matchChirho[1] === 'start') startChirho = Number(matchChirho[2]);
		else if (startChirho !== undefined) {
			spansChirho.push({ start_chirho: startChirho, end_chirho: Number(matchChirho[2]) });
			startChirho = undefined;
		}
	}
	if (startChirho !== undefined)
		spansChirho.push({ start_chirho: startChirho, end_chirho: durationChirho });
	const leadingChirho = spansChirho.find((spanChirho) => spanChirho.start_chirho <= 0.02);
	const trailingChirho = spansChirho.findLast(
		(spanChirho) => spanChirho.end_chirho >= durationChirho - 0.08
	);
	const beginningChirho = Math.max(0, (leadingChirho?.end_chirho ?? 0) - 0.08);
	const endingChirho = Math.min(
		durationChirho,
		(trailingChirho?.start_chirho ?? durationChirho) + 0.12
	);
	if (endingChirho - beginningChirho < 0.1)
		throw new Error('Word audio has no usable voiced interval');
	return {
		duration_chirho: durationChirho,
		start_offset_chirho: beginningChirho,
		end_offset_chirho: endingChirho
	};
}
