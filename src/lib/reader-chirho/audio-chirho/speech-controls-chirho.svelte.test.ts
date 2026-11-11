// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import {
	afterEach as afterEachChirho,
	expect as expectChirho,
	test as testChirho,
	vi as viChirho
} from 'vitest';
import { installSpeechChirho } from './speech-controls-chirho';
import { AUDIO_MESSAGES_CHIRHO } from './audio-messages-chirho';

// The media clock is deliberately independent of timers, as it is during network buffering.
class ControlledAudioChirho {
	static instancesChirho: ControlledAudioChirho[] = [];
	currentTime = 0;
	playbackRate = 1;
	readyState = 4;
	paused = true;
	preservesPitch = true;
	onended: (() => void) | null = null;
	onerror: (() => void) | null = null;
	onplaying: (() => void) | null = null;
	onratechange: (() => void) | null = null;
	onloadedmetadata: (() => void) | null = null;
	onwaiting: (() => void) | null = null;
	onstalled: (() => void) | null = null;
	onseeking: (() => void) | null = null;
	onseeked: (() => void) | null = null;
	ontimeupdate: (() => void) | null = null;
	onpause: (() => void) | null = null;
	constructor(public src: string) {
		ControlledAudioChirho.instancesChirho.push(this);
	}
	play() {
		this.paused = false;
		this.onplaying?.();
		return Promise.resolve();
	}
	pause() {
		this.paused = true;
		this.onpause?.();
	}
	removeAttribute(nameChirho: string) {
		if (nameChirho === 'src') this.src = '';
	}
	load() {}
}

let cleanupChirho: (() => void) | undefined;
afterEachChirho(() => {
	cleanupChirho?.();
	cleanupChirho = undefined;
	viChirho.useRealTimers();
	viChirho.unstubAllGlobals();
	ControlledAudioChirho.instancesChirho = [];
});

function setupChirho(completeWordChirho = false) {
	viChirho.useFakeTimers();
	viChirho.stubGlobal('Audio', ControlledAudioChirho);
	const rootChirho = document.createElement('div');
	rootChirho.innerHTML =
		'<div data-speech-recordings-chirho></div><select data-speech-rate-chirho><option value="1">Normal</option></select><button class="word-speech-chirho" data-pronounce-chirho="first" data-speech-token-chirho="first-chirho" data-speech-language-chirho="he">First</button><button class="word-speech-chirho" data-pronounce-chirho="second" data-speech-token-chirho="second-chirho" data-speech-language-chirho="he">Second</button><button data-speech-stop-chirho>Stop</button>';
	rootChirho.querySelector('[data-speech-recordings-chirho]')!.setAttribute(
		'data-speech-recordings-chirho',
		JSON.stringify(
			['first', 'second'].map((nameChirho, indexChirho) => ({
				text_chirho: nameChirho,
				token_id_chirho: `${nameChirho}-chirho`,
				language_chirho: 'he',
				asset_path_chirho: `/audio-chirho/sha256-chirho/${String(indexChirho + 1).repeat(64)}-chirho.mp3`,
				voice_name_chirho: 'Test',
				bytes_chirho: 100,
				start_offset_chirho: 0,
				end_offset_chirho: 0.9
			}))
		)
	);
	if (!completeWordChirho) {
		const clipsChirho = JSON.parse(
			rootChirho
				.querySelector('[data-speech-recordings-chirho]')!
				.getAttribute('data-speech-recordings-chirho')!
		);
		for (const clipChirho of clipsChirho) clipChirho.token_id_chirho = null;
		rootChirho
			.querySelector('[data-speech-recordings-chirho]')!
			.setAttribute('data-speech-recordings-chirho', JSON.stringify(clipsChirho));
		for (const buttonChirho of rootChirho.querySelectorAll('[data-pronounce-chirho]')) {
			buttonChirho.classList.remove('word-speech-chirho');
			buttonChirho.removeAttribute('data-speech-token-chirho');
		}
	}
	document.body.appendChild(rootChirho);
	const controlsChirho = installSpeechChirho(rootChirho);
	cleanupChirho = () => {
		controlsChirho.destroyChirho();
		rootChirho.remove();
	};
	return [...rootChirho.querySelectorAll<HTMLButtonElement>('[data-pronounce-chirho]')];
}

testChirho(
	'verse trimming follows the media clock through buffering, rather than cutting off on wall time',
	() => {
		const buttonsChirho = setupChirho();
		buttonsChirho[0].click();
		const audioChirho = ControlledAudioChirho.instancesChirho[0];
		audioChirho.currentTime = 0.2;
		viChirho.advanceTimersByTime(1500);
		expectChirho(audioChirho.paused).toBe(false);
		expectChirho(buttonsChirho[0].getAttribute('aria-busy')).toBe('true');
		audioChirho.onwaiting?.();
		viChirho.advanceTimersByTime(2000);
		expectChirho(audioChirho.paused).toBe(false);
		audioChirho.onplaying?.();
		audioChirho.currentTime = 0.91;
		audioChirho.ontimeupdate?.();
		viChirho.advanceTimersByTime(900);
		expectChirho(audioChirho.paused).toBe(true);
		expectChirho(buttonsChirho[0].hasAttribute('aria-busy')).toBe(false);
	}
);

testChirho(
	'an individual word keeps its complete recording through native ended, including at a slower rate',
	() => {
		const buttonsChirho = setupChirho(true);
		buttonsChirho[0].click();
		const audioChirho = ControlledAudioChirho.instancesChirho[0];
		audioChirho.playbackRate = 0.85;
		audioChirho.currentTime = 0.92;
		viChirho.advanceTimersByTime(2000);
		expectChirho(audioChirho.paused).toBe(false);
		expectChirho(buttonsChirho[0].getAttribute('aria-busy')).toBe('true');
		audioChirho.currentTime = 1.04;
		audioChirho.onended?.();
		expectChirho(audioChirho.paused).toBe(true);
		expectChirho(buttonsChirho[0].hasAttribute('aria-busy')).toBe(false);
	}
);

testChirho('late events from a replaced word cannot cancel the next word or its trim timer', () => {
	const buttonsChirho = setupChirho();
	buttonsChirho[0].click();
	const firstChirho = ControlledAudioChirho.instancesChirho[0];
	const lateEndedChirho = firstChirho.onended;
	const latePlayingChirho = firstChirho.onplaying;
	buttonsChirho[1].click();
	const secondChirho = ControlledAudioChirho.instancesChirho[1];
	lateEndedChirho?.();
	latePlayingChirho?.();
	expectChirho(firstChirho.paused).toBe(true);
	expectChirho(secondChirho.paused).toBe(false);
	secondChirho.currentTime = 0.91;
	viChirho.advanceTimersByTime(1000);
	expectChirho(secondChirho.paused).toBe(true);
	expectChirho(buttonsChirho[1].hasAttribute('aria-busy')).toBe(false);
});

async function setupVerseChirho(naturalChirho = false) {
	const deviceChirho = {
		getVoices: () => [{ lang: 'he-IL', name: 'Local Hebrew', localService: true, default: true }],
		cancel: viChirho.fn(),
		speak: viChirho.fn(),
		addEventListener: viChirho.fn(),
		removeEventListener: viChirho.fn()
	};
	viChirho.stubGlobal('speechSynthesis', deviceChirho);
	viChirho.stubGlobal(
		'SpeechSynthesisUtterance',
		class {
			constructor(public text: string) {}
		}
	);
	const wordButtonsChirho = setupChirho(true);
	const rootChirho = wordButtonsChirho[0].parentElement!;
	const buttonChirho = document.createElement('button');
	buttonChirho.dataset.pronounceChirho = 'first second';
	buttonChirho.dataset.speechLanguageChirho = 'he';
	buttonChirho.dataset.speechSavedOnlyChirho = 'true';
	rootChirho.insertBefore(buttonChirho, rootChirho.firstChild);
	const hostChirho = rootChirho.querySelector('[data-speech-recordings-chirho]')!;
	hostChirho.setAttribute(
		'data-speech-words-chirho',
		JSON.stringify(
			['first', 'second'].map((nameChirho) => ({
				token_id_chirho: nameChirho + '-chirho',
				text_chirho: nameChirho,
				pause_after_chirho: 60
			}))
		)
	);
	if (naturalChirho) {
		const clipsChirho = JSON.parse(hostChirho.getAttribute('data-speech-recordings-chirho')!);
		clipsChirho.push({
			text_chirho: 'first second',
			token_id_chirho: null,
			language_chirho: 'he',
			asset_path_chirho: '/audio-chirho/sha256-chirho/' + '3'.repeat(64) + '-chirho.mp3',
			voice_name_chirho: 'Verse',
			bytes_chirho: 100
		});
		hostChirho.setAttribute('data-speech-recordings-chirho', JSON.stringify(clipsChirho));
	}
	await viChirho.advanceTimersByTimeAsync(0);
	return { buttonChirho, hostChirho, rootChirho, wordButtonsChirho, deviceChirho };
}

testChirho('a recorded verse takes priority over its saved word sequence', async () => {
	const { buttonChirho } = await setupVerseChirho(true);
	buttonChirho.click();
	expectChirho(ControlledAudioChirho.instancesChirho).toHaveLength(1);
	expectChirho(ControlledAudioChirho.instancesChirho[0].src).toContain('3'.repeat(64));
	expectChirho(ControlledAudioChirho.instancesChirho[0].playbackRate).toBe(1);
	ControlledAudioChirho.instancesChirho[0].onended?.();
	expectChirho(buttonChirho.hasAttribute('aria-busy')).toBe(false);
});

testChirho(
	'an assembled verse plays every saved word in order and completes at the final word',
	async () => {
		const { buttonChirho } = await setupVerseChirho();
		buttonChirho.click();
		const [firstChirho, secondChirho] = ControlledAudioChirho.instancesChirho;
		expectChirho(firstChirho.paused).toBe(false);
		expectChirho(secondChirho.paused).toBe(true);
		firstChirho.onended?.();
		await viChirho.advanceTimersByTimeAsync(60);
		expectChirho(secondChirho.paused).toBe(false);
		secondChirho.onended?.();
		expectChirho(buttonChirho.hasAttribute('aria-busy')).toBe(false);
	}
);

testChirho(
	'missing or different word text refuses a full verse without borrowing device speech',
	async () => {
		const { buttonChirho, hostChirho, wordButtonsChirho, deviceChirho } = await setupVerseChirho();
		const clipsChirho = JSON.parse(hostChirho.getAttribute('data-speech-recordings-chirho')!);
		clipsChirho[1].text_chirho = 'different';
		hostChirho.setAttribute('data-speech-recordings-chirho', JSON.stringify(clipsChirho));
		await viChirho.advanceTimersByTimeAsync(0);
		expectChirho(buttonChirho.disabled).toBe(true);
		expectChirho(wordButtonsChirho[0].disabled).toBe(false);
		buttonChirho.click();
		expectChirho(ControlledAudioChirho.instancesChirho).toHaveLength(0);
		expectChirho(deviceChirho.speak).not.toHaveBeenCalled();
	}
);

testChirho(
	'Stop cancels a saved-word verse and a late first-word ending cannot resume it',
	async () => {
		const { buttonChirho, rootChirho } = await setupVerseChirho();
		buttonChirho.click();
		const [firstChirho, secondChirho] = ControlledAudioChirho.instancesChirho;
		const lateChirho = firstChirho.onended;
		rootChirho.querySelector<HTMLButtonElement>('[data-speech-stop-chirho]')!.click();
		lateChirho?.();
		await viChirho.advanceTimersByTimeAsync(3000);
		expectChirho(secondChirho.paused).toBe(true);
		expectChirho(buttonChirho.hasAttribute('aria-busy')).toBe(false);
	}
);

testChirho(
	'a human verse reading plays before a synthesized one, whole, under human wording, until a word speaker stops it',
	async () => {
		const { buttonChirho, hostChirho, rootChirho, wordButtonsChirho } =
			await setupVerseChirho(true);
		const statusChirho = document.createElement('p');
		statusChirho.dataset.audioStatusChirho = '';
		rootChirho.appendChild(statusChirho);
		hostChirho.setAttribute(
			'data-speech-messages-chirho',
			JSON.stringify(AUDIO_MESSAGES_CHIRHO.en)
		);
		const clipsChirho = JSON.parse(hostChirho.getAttribute('data-speech-recordings-chirho')!);
		clipsChirho.push({
			text_chirho: 'first second',
			token_id_chirho: null,
			language_chirho: 'he',
			asset_path_chirho: '/audio-chirho/sha256-chirho/' + '4'.repeat(64) + '-chirho.mp3',
			voice_name_chirho: "Rabbi Dan Be'eri",
			bytes_chirho: 100,
			reading_source_chirho: { kind_chirho: 'human' }
		});
		hostChirho.setAttribute('data-speech-recordings-chirho', JSON.stringify(clipsChirho));
		await viChirho.advanceTimersByTimeAsync(0);
		expectChirho(statusChirho.textContent).toMatch(/Human.*verse.*Rabbi Dan Be/u);
		buttonChirho.click();
		const humanChirho = ControlledAudioChirho.instancesChirho[0];
		expectChirho(humanChirho.src).toContain('4'.repeat(64));
		expectChirho(statusChirho.textContent).toMatch(/Playing.*verse.*Rabbi Dan Be/u);
		humanChirho.currentTime = 30;
		viChirho.advanceTimersByTime(30_000);
		expectChirho(humanChirho.paused).toBe(false);
		wordButtonsChirho[0].click();
		expectChirho(humanChirho.paused).toBe(true);
		expectChirho(humanChirho.src).toBe('');
		expectChirho(ControlledAudioChirho.instancesChirho[1].paused).toBe(false);
		expectChirho(buttonChirho.hasAttribute('aria-busy')).toBe(false);
	}
);

testChirho(
	'an aspirated Greek verse can combine aspirated rough words with compatible modern non-rough words',
	async () => {
		const { buttonChirho, hostChirho, rootChirho } = await setupVerseChirho();
		buttonChirho.dataset.speechLanguageChirho = 'grc';
		buttonChirho.dataset.pronounceChirho = 'ὁ λόγος';
		const selectChirho = document.createElement('select');
		selectChirho.dataset.greekRenditionChirho = '';
		selectChirho.innerHTML = '<option value="modern_aspirates">Modern with Aspirates</option>';
		rootChirho.insertBefore(selectChirho, rootChirho.firstChild);
		const clipsChirho = JSON.parse(hostChirho.getAttribute('data-speech-recordings-chirho')!);
		for (const [indexChirho, clipChirho] of clipsChirho.entries()) {
			clipChirho.text_chirho = indexChirho === 0 ? 'ὁ' : 'λόγος';
			clipChirho.language_chirho = 'el';
			clipChirho.pronunciation_chirho =
				indexChirho === 0 ? 'modern_greek_aspirates' : 'modern_greek';
		}
		hostChirho.setAttribute('data-speech-recordings-chirho', JSON.stringify(clipsChirho));
		hostChirho.setAttribute(
			'data-speech-words-chirho',
			JSON.stringify(
				clipsChirho.map((clipChirho: { token_id_chirho: string; text_chirho: string }) => ({
					token_id_chirho: clipChirho.token_id_chirho,
					text_chirho: clipChirho.text_chirho,
					pause_after_chirho: 60
				}))
			)
		);
		await viChirho.advanceTimersByTimeAsync(0);
		expectChirho(buttonChirho.disabled).toBe(false);
		clipsChirho[0].pronunciation_chirho = 'modern_greek';
		hostChirho.setAttribute('data-speech-recordings-chirho', JSON.stringify(clipsChirho));
		await viChirho.advanceTimersByTimeAsync(0);
		expectChirho(buttonChirho.disabled).toBe(true);
	}
);

// Workflow: verse-media-chirho.md. A same-reading verse video is the shared player's clock.
async function setupVideoChirho(matchChirho = true, syntheticChirho = false) {
	const parts = await setupVerseChirho(true);
	const { buttonChirho, hostChirho, rootChirho } = parts;
	const wrapChirho = document.createElement('span');
	wrapChirho.className = 'verse-play-chirho';
	rootChirho.insertBefore(wrapChirho, buttonChirho);
	wrapChirho.appendChild(buttonChirho);
	const statusChirho = document.createElement('p');
	statusChirho.dataset.audioStatusChirho = '';
	const figureChirho = document.createElement('figure');
	figureChirho.innerHTML =
		'<img data-scene-chirho alt=""><video data-scene-video-chirho data-verse-video-play-chirho data-video-sha-chirho="' +
		'v'.repeat(64) +
		'" hidden></video><button data-verse-video-play-chirho>Play verse video</button>';
	rootChirho.appendChild(statusChirho);
	rootChirho.appendChild(figureChirho);
	const videoChirho = figureChirho.querySelector('video')!;
	const playedChirho = viChirho.fn(() => {
		Object.defineProperty(videoChirho, 'paused', { configurable: true, value: false });
		return Promise.resolve();
	});
	videoChirho.play = playedChirho;
	videoChirho.pause = () =>
		Object.defineProperty(videoChirho, 'paused', { configurable: true, value: true });
	hostChirho.setAttribute('data-speech-messages-chirho', JSON.stringify(AUDIO_MESSAGES_CHIRHO.en));
	const clipsChirho = JSON.parse(hostChirho.getAttribute('data-speech-recordings-chirho')!);
	clipsChirho.push({
		text_chirho: 'first second',
		token_id_chirho: null,
		language_chirho: syntheticChirho ? 'el' : 'he',
		pronunciation_chirho: syntheticChirho ? 'modern_greek' : 'israeli_hebrew',
		asset_path_chirho: '/audio-chirho/sha256-chirho/' + '4'.repeat(64) + '-chirho.mp3',
		sha256_chirho: '4'.repeat(64),
		voice_name_chirho: "Rabbi Dan Be'eri",
		bytes_chirho: 100,
		...(syntheticChirho ? {} : { reading_source_chirho: { kind_chirho: 'human' } })
	});
	if (syntheticChirho) {
		buttonChirho.dataset.speechLanguageChirho = 'grc';
		const renditionChirho = document.createElement('select');
		renditionChirho.dataset.greekRenditionChirho = '';
		renditionChirho.innerHTML =
			'<option value="modern">Modern</option><option value="modern_aspirates">Aspirates</option><option value="erasmian">Erasmian</option>';
		rootChirho.appendChild(renditionChirho);
	}
	hostChirho.setAttribute('data-speech-recordings-chirho', JSON.stringify(clipsChirho));
	hostChirho.setAttribute('data-verse-video-sha-chirho', 'v'.repeat(64));
	hostChirho.setAttribute('data-verse-video-clip-sha-chirho', (matchChirho ? '4' : '5').repeat(64));
	await viChirho.advanceTimersByTimeAsync(0);
	const stillChirho = figureChirho.querySelector('img')!;
	const captionChirho = figureChirho.querySelector('button')!;
	return { ...parts, statusChirho, videoChirho, playedChirho, stillChirho, captionChirho };
}

testChirho(
	"a same-reading verse video plays unmuted in the still's place, and Stop restores the still",
	async () => {
		const { buttonChirho, rootChirho, statusChirho, videoChirho, playedChirho, stillChirho } =
			await setupVideoChirho();
		expectChirho(videoChirho.hidden).toBe(true);
		buttonChirho.click();
		expectChirho(playedChirho).toHaveBeenCalledTimes(1);
		expectChirho(ControlledAudioChirho.instancesChirho).toHaveLength(0);
		expectChirho([videoChirho.hidden, stillChirho.hidden, videoChirho.muted]).toEqual([
			false,
			true,
			false
		]);
		expectChirho(statusChirho.textContent).toBe(
			"Playing the verse video with the reading by Rabbi Dan Be'eri."
		);
		expectChirho(buttonChirho.getAttribute('aria-busy')).toBe('true');
		rootChirho.querySelector<HTMLButtonElement>('[data-speech-stop-chirho]')!.click();
		expectChirho([videoChirho.hidden, stillChirho.hidden, videoChirho.paused]).toEqual([
			true,
			false,
			true
		]);
		expectChirho(buttonChirho.hasAttribute('aria-busy')).toBe(false);
	}
);

testChirho(
	'the caption control starts the video; a word speaker or navigation stops it',
	async () => {
		const { buttonChirho, hostChirho, videoChirho, stillChirho, captionChirho, wordButtonsChirho } =
			await setupVideoChirho();
		captionChirho.click();
		expectChirho(videoChirho.hidden).toBe(false);
		expectChirho(buttonChirho.getAttribute('aria-busy')).toBe('true');
		wordButtonsChirho[0].click();
		expectChirho([videoChirho.hidden, stillChirho.hidden, videoChirho.paused]).toEqual([
			true,
			false,
			true
		]);
		expectChirho(ControlledAudioChirho.instancesChirho.at(-1)!.paused).toBe(false);
		captionChirho.click();
		expectChirho(videoChirho.hidden).toBe(false);
		hostChirho.setAttribute('data-speech-pending-chirho', 'true');
		await viChirho.advanceTimersByTimeAsync(0);
		expectChirho([videoChirho.hidden, videoChirho.paused]).toEqual([true, true]);
		expectChirho(buttonChirho.hasAttribute('aria-busy')).toBe(false);
	}
);

testChirho(
	'a failed video is not retried, its late events cannot stop the next reading, which plays over the still',
	async () => {
		const { buttonChirho, statusChirho, videoChirho, stillChirho } = await setupVideoChirho();
		buttonChirho.click();
		const lateEndedChirho = videoChirho.onended;
		videoChirho.onerror?.(new Event('error'));
		expectChirho(statusChirho.textContent).toBe(
			'The video could not be played. Press Play again to hear the reading.'
		);
		expectChirho([videoChirho.hidden, stillChirho.hidden]).toEqual([true, false]);
		buttonChirho.click();
		const readingChirho = ControlledAudioChirho.instancesChirho.at(-1)!;
		expectChirho(readingChirho.src).toContain('4'.repeat(64));
		lateEndedChirho?.call(videoChirho, new Event('ended'));
		expectChirho(readingChirho.paused).toBe(false);
		expectChirho(buttonChirho.getAttribute('aria-busy')).toBe('true');
	}
);

testChirho('without a same-reading match, the reading plays over the still', async () => {
	const { buttonChirho, videoChirho, playedChirho } = await setupVideoChirho(false);
	buttonChirho.click();
	expectChirho(playedChirho).not.toHaveBeenCalled();
	expectChirho(videoChirho.hidden).toBe(true);
	expectChirho(ControlledAudioChirho.instancesChirho.at(-1)!.src).toContain('4'.repeat(64));
});

testChirho(
	'a browser policy refusal keeps the matching video available for manual retry',
	async () => {
		const { buttonChirho, statusChirho, videoChirho, playedChirho, stillChirho } =
			await setupVideoChirho();
		buttonChirho.innerHTML = '<span data-verse-action-label-chirho></span>';
		playedChirho.mockRejectedValueOnce(
			new DOMException('User gesture required', 'NotAllowedError')
		);
		buttonChirho.click();
		await viChirho.advanceTimersByTimeAsync(0);
		expectChirho(videoChirho.dataset.videoFailedChirho).toBeUndefined();
		expectChirho([videoChirho.hidden, stillChirho.hidden]).toEqual([true, false]);
		expectChirho(buttonChirho.hasAttribute('aria-busy')).toBe(false);
		expectChirho(buttonChirho.textContent).toBe(AUDIO_MESSAGES_CHIRHO.en.play_verse_video_chirho);
		expectChirho(statusChirho.textContent).toBe(AUDIO_MESSAGES_CHIRHO.en.playback_blocked_chirho);
		buttonChirho.click();
		expectChirho(playedChirho).toHaveBeenCalledTimes(2);
		expectChirho(ControlledAudioChirho.instancesChirho).toHaveLength(0);
		expectChirho([videoChirho.hidden, videoChirho.paused]).toEqual([false, false]);
	}
);

testChirho('a non-policy video rejection retains the failed-video reading fallback', async () => {
	const { buttonChirho, statusChirho, videoChirho, playedChirho } = await setupVideoChirho();
	playedChirho.mockRejectedValueOnce(new DOMException('Unsupported source', 'NotSupportedError'));
	buttonChirho.click();
	await viChirho.advanceTimersByTimeAsync(0);
	expectChirho(videoChirho.dataset.videoFailedChirho).toBe('true');
	expectChirho(statusChirho.textContent).toBe(AUDIO_MESSAGES_CHIRHO.en.video_failed_chirho);
	buttonChirho.click();
	expectChirho(playedChirho).toHaveBeenCalledTimes(1);
	expectChirho(ControlledAudioChirho.instancesChirho.at(-1)!.src).toContain('4'.repeat(64));
});

testChirho('a policy-blocked recording is idle and can be retried manually', async () => {
	const { buttonChirho, statusChirho } = await setupVideoChirho(false);
	const nativePlayChirho = ControlledAudioChirho.prototype.play;
	const deniedPlayChirho = viChirho
		.spyOn(ControlledAudioChirho.prototype, 'play')
		.mockRejectedValueOnce(new DOMException('User gesture required', 'NotAllowedError'));
	try {
		buttonChirho.click();
		await viChirho.advanceTimersByTimeAsync(0);
		expectChirho(buttonChirho.hasAttribute('aria-busy')).toBe(false);
		expectChirho(statusChirho.textContent).toBe(AUDIO_MESSAGES_CHIRHO.en.playback_blocked_chirho);
		deniedPlayChirho.mockImplementation(nativePlayChirho);
		buttonChirho.click();
		expectChirho(ControlledAudioChirho.instancesChirho.at(-1)!.paused).toBe(false);
	} finally {
		deniedPlayChirho.mockRestore();
	}
});

testChirho(
	'a synthetic video uses the selected compatible clip, and a rendition switch stops its clock',
	async () => {
		const { buttonChirho, hostChirho, rootChirho, videoChirho, playedChirho, stillChirho } =
			await setupVideoChirho(true, true);
		const renditionChirho = rootChirho.querySelector(
			'[data-greek-rendition-chirho]'
		) as unknown as HTMLSelectElement;
		buttonChirho.click();
		expectChirho(playedChirho).toHaveBeenCalledTimes(1);
		expectChirho(ControlledAudioChirho.instancesChirho).toHaveLength(0);
		videoChirho.onended?.(new Event('ended'));
		expectChirho([
			videoChirho.hidden,
			stillChirho.hidden,
			buttonChirho.hasAttribute('aria-busy')
		]).toEqual([true, false, false]);
		renditionChirho.value = 'modern_aspirates';
		renditionChirho.dispatchEvent(new Event('change', { bubbles: true }));
		buttonChirho.click();
		expectChirho(playedChirho).toHaveBeenCalledTimes(2); // Non-rough Modern remains the same permitted recording.
		const clipsChirho = JSON.parse(hostChirho.getAttribute('data-speech-recordings-chirho')!);
		clipsChirho.push({
			...clipsChirho.at(-1),
			sha256_chirho: '5'.repeat(64),
			asset_path_chirho: '/audio-chirho/sha256-chirho/' + '5'.repeat(64) + '-chirho.mp3',
			pronunciation_chirho: 'erasmian_greek'
		});
		hostChirho.setAttribute('data-speech-recordings-chirho', JSON.stringify(clipsChirho));
		renditionChirho.value = 'erasmian';
		renditionChirho.dispatchEvent(new Event('change', { bubbles: true }));
		expectChirho(videoChirho.hidden).toBe(true);
		buttonChirho.click();
		expectChirho(playedChirho).toHaveBeenCalledTimes(2);
		expectChirho(ControlledAudioChirho.instancesChirho.at(-1)!.src).toContain('5'.repeat(64));
	}
);
testChirho(
	'a synthetic video never supplies a held rough rendition or missing source clip',
	async () => {
		const { buttonChirho, hostChirho, rootChirho, playedChirho } = await setupVideoChirho(
			true,
			true
		);
		const clipsChirho = JSON.parse(hostChirho.getAttribute('data-speech-recordings-chirho')!);
		clipsChirho.at(-1).text_chirho = 'ὁ λόγος';
		buttonChirho.dataset.pronounceChirho = 'ὁ λόγος';
		hostChirho.setAttribute('data-speech-recordings-chirho', JSON.stringify(clipsChirho));
		const renditionChirho = rootChirho.querySelector(
			'[data-greek-rendition-chirho]'
		) as unknown as HTMLSelectElement;
		renditionChirho.value = 'modern_aspirates';
		renditionChirho.dispatchEvent(new Event('change', { bubbles: true }));
		buttonChirho.click();
		expectChirho(playedChirho).not.toHaveBeenCalled();
		renditionChirho.value = 'modern';
		renditionChirho.dispatchEvent(new Event('change', { bubbles: true }));
		buttonChirho.click();
		expectChirho(playedChirho).toHaveBeenCalledTimes(1);
		rootChirho.querySelector<HTMLButtonElement>('[data-speech-stop-chirho]')!.click();
		hostChirho.setAttribute('data-speech-recordings-chirho', '[]');
		await viChirho.advanceTimersByTimeAsync(0);
		buttonChirho.click();
		expectChirho(playedChirho).toHaveBeenCalledTimes(1);
	}
);
testChirho('a failed synthetic video returns to its same MP3 without retrying motion', async () => {
	const { buttonChirho, videoChirho, playedChirho, stillChirho } = await setupVideoChirho(
		true,
		true
	);
	buttonChirho.click();
	videoChirho.onerror?.(new Event('error'));
	expectChirho([videoChirho.hidden, stillChirho.hidden]).toEqual([true, false]);
	buttonChirho.click();
	expectChirho(playedChirho).toHaveBeenCalledTimes(1);
	expectChirho(ControlledAudioChirho.instancesChirho.at(-1)!.src).toContain('4'.repeat(64));
});

testChirho(
	'a word sharing verse MP3 bytes still plays as a word rather than starting the video',
	async () => {
		const { hostChirho, wordButtonsChirho, playedChirho } = await setupVideoChirho(true, true);
		const clipsChirho = JSON.parse(hostChirho.getAttribute('data-speech-recordings-chirho')!);
		delete clipsChirho[0].start_offset_chirho;
		delete clipsChirho[0].end_offset_chirho;
		clipsChirho[0].sha256_chirho = '4'.repeat(64);
		clipsChirho[0].asset_path_chirho =
			'/audio-chirho/sha256-chirho/' + '4'.repeat(64) + '-chirho.mp3';
		hostChirho.setAttribute('data-speech-recordings-chirho', JSON.stringify(clipsChirho));
		wordButtonsChirho[0].click();
		expectChirho(playedChirho).not.toHaveBeenCalled();
		expectChirho(ControlledAudioChirho.instancesChirho.at(-1)!.src).toContain('4'.repeat(64));
	}
);

testChirho(
	'the active word control becomes Stop and cancels without adding a separate control',
	() => {
		const buttonsChirho = setupChirho(true);
		const rootChirho = buttonsChirho[0].parentElement!;
		rootChirho.querySelector('[data-speech-stop-chirho]')!.remove();
		const messagesChirho = document.createElement('span');
		messagesChirho.setAttribute(
			'data-speech-messages-chirho',
			JSON.stringify(AUDIO_MESSAGES_CHIRHO.en)
		);
		rootChirho.appendChild(messagesChirho);
		const countChirho = rootChirho.querySelectorAll('button').length;
		buttonsChirho[0].click();
		expectChirho(buttonsChirho[0].getAttribute('aria-label')).toMatch(/stop/i);
		expectChirho(rootChirho.querySelectorAll('button').length).toBe(countChirho);
		buttonsChirho[0].click();
		expectChirho(ControlledAudioChirho.instancesChirho[0].paused).toBe(true);
		expectChirho(buttonsChirho[0].getAttribute('aria-label')).toMatch(/pronounce/i);
		expectChirho(rootChirho.querySelectorAll('button').length).toBe(countChirho);
	}
);
