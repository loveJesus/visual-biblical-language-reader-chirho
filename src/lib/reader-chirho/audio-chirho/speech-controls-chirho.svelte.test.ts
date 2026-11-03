// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import {
	afterEach as afterEachChirho,
	expect as expectChirho,
	test as testChirho,
	vi as viChirho
} from 'vitest';
import { installSpeechChirho } from './speech-controls-chirho';

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
