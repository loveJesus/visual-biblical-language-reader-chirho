// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import {
	test as testChirho,
	expect as expectChirho,
	vi as viChirho,
	afterEach as afterEachChirho
} from 'vitest';
import {
	contextRecordingChirho,
	installContextPlaybackChirho,
	playContextOriginalChirho,
	stopContextPlaybackChirho,
	localInterfaceVoiceChirho,
	playContextTranslationChirho,
	subscribeContextPlaybackChirho
} from './context-playback-chirho';
import type { RecordingChirho } from '../audio-chirho/recordings-chirho';
const lessonChirho = {
	id_chirho: 'John.1.1',
	language_chirho: 'grc',
	canonical_text_chirho: 'ὁ λόγος',
	tokens_chirho: []
} as unknown as Parameters<typeof contextRecordingChirho>[1];
const clipChirho = {
	token_id_chirho: null,
	text_chirho: 'ὁ λόγος',
	pronunciation_chirho: 'modern_greek',
	asset_path_chirho: '/audio-chirho/test-chirho.mp3'
} as RecordingChirho;
let cleanupChirho: (() => void) | undefined;
afterEachChirho(() => {
	cleanupChirho?.();
	cleanupChirho = undefined;
	stopContextPlaybackChirho();
	viChirho.useRealTimers();
	viChirho.unstubAllGlobals();
});
testChirho('saved pronunciation never substitutes Modern for rough Aspirates or Erasmian', () => {
	expectChirho(contextRecordingChirho([clipChirho], lessonChirho, 'modern')).toBe(clipChirho);
	expectChirho(
		contextRecordingChirho([clipChirho], lessonChirho, 'modern_aspirates')
	).toBeUndefined();
	expectChirho(contextRecordingChirho([clipChirho], lessonChirho, 'erasmian')).toBeUndefined();
	const wordChirho = { ...clipChirho, token_id_chirho: 'word-chirho' };
	expectChirho(contextRecordingChirho([wordChirho], lessonChirho, 'modern')).toBeUndefined();
});
class AudioFixtureChirho {
	static playersChirho: AudioFixtureChirho[] = [];
	paused = true;
	currentTime = 0;
	playbackRate = 1;
	readyState = 0;
	onloadedmetadata: (() => void) | null = null;
	onended: (() => void) | null = null;
	onerror: (() => void) | null = null;
	onplaying: (() => void) | null = null;
	ontimeupdate: (() => void) | null = null;
	constructor(public src: string) {
		AudioFixtureChirho.playersChirho.push(this);
	}
	play() {
		this.paused = false;
		this.onplaying?.();
		return Promise.resolve();
	}
	pause() {
		this.paused = true;
	}
	removeAttribute() {
		this.src = '';
	}
	load() {}
}
testChirho(
	'context audio honors source windows, replaces prior playback and ignores stale completion',
	() => {
		viChirho.stubGlobal('Audio', AudioFixtureChirho);
		cleanupChirho = installContextPlaybackChirho();
		AudioFixtureChirho.playersChirho = [];
		const statesChirho: string[] = [];
		const removeChirho = subscribeContextPlaybackChirho((keyChirho) =>
			statesChirho.push(keyChirho)
		);
		try {
			playContextOriginalChirho(
				'first-chirho',
				{ ...clipChirho, start_offset_chirho: 4, end_offset_chirho: 6 },
				0.85
			);
			const firstChirho = AudioFixtureChirho.playersChirho[0];
			expectChirho(firstChirho.paused).toBe(true);
			firstChirho.onloadedmetadata?.();
			expectChirho(firstChirho.currentTime).toBe(4);
			expectChirho(firstChirho.playbackRate).toBe(0.85);
			playContextOriginalChirho('second-chirho', clipChirho, 1);
			const secondChirho = AudioFixtureChirho.playersChirho[1];
			expectChirho(firstChirho.paused).toBe(true);
			firstChirho.onended?.();
			expectChirho(secondChirho.paused).toBe(false);
			playContextOriginalChirho('second-chirho', clipChirho, 1);
			expectChirho(secondChirho.paused).toBe(true);
			expectChirho(statesChirho.at(-1)).toBe('');
		} finally {
			removeChirho();
		}
	}
);
testChirho('a stalled context start fails after a bounded wait and can be stopped', () => {
	viChirho.useFakeTimers();
	viChirho.stubGlobal('Audio', AudioFixtureChirho);
	cleanupChirho = installContextPlaybackChirho();
	const failuresChirho: string[] = [];
	const removeChirho = subscribeContextPlaybackChirho((keyChirho, errorChirho) => {
		if (errorChirho) failuresChirho.push(keyChirho);
	});
	try {
		playContextOriginalChirho('stalled-chirho', { ...clipChirho, start_offset_chirho: 4 }, 1);
		viChirho.advanceTimersByTime(15001);
		expectChirho(failuresChirho).toEqual(['stalled-chirho']);
	} finally {
		removeChirho();
	}
});
testChirho(
	'interface playback chooses only an installed local voice and explicit activation',
	() => {
		const speakChirho = viChirho.fn();
		const cancelChirho = viChirho.fn();
		const remoteChirho = { lang: 'es-ES', localService: false };
		const localChirho = { lang: 'en-US', localService: true };
		viChirho.stubGlobal('speechSynthesis', {
			getVoices: () => [remoteChirho, localChirho],
			speak: speakChirho,
			cancel: cancelChirho
		});
		viChirho.stubGlobal(
			'SpeechSynthesisUtterance',
			class {
				constructor(public text: string) {}
			}
		);
		cleanupChirho = installContextPlaybackChirho();
		expectChirho(localInterfaceVoiceChirho('es')).toBeUndefined();
		expectChirho(speakChirho).not.toHaveBeenCalled();
		playContextTranslationChirho('es-chirho', 'palabra', 'es');
		expectChirho(speakChirho).not.toHaveBeenCalled();
		playContextTranslationChirho('en-chirho', 'word', 'en');
		expectChirho(speakChirho).toHaveBeenCalledTimes(1);
		expectChirho(speakChirho.mock.calls[0][0].voice).toBe(localChirho);
		document.dispatchEvent(new Event('hinneh-stop-playback-chirho'));
		expectChirho(cancelChirho).toHaveBeenCalled();
	}
);
