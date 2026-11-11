// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: hosting-chirho/word-study-chirho.md. One explicit study playback owner; published clips or installed local voices only.
import {
	automaticVerseRecordingChirho,
	type RecordingChirho,
	type recordingsForLessonChirho
} from '../audio-chirho/recordings-chirho';
import { bibleBookChirho } from '$lib/bible-chirho/books-chirho';
import { spokenVerseChirho } from '$lib/domain-chirho/pronunciation-chirho';
export function contextRecordingChirho(
	clipsChirho: RecordingChirho[],
	lessonChirho: Parameters<typeof recordingsForLessonChirho>[0],
	renditionChirho: string | null
): RecordingChirho | undefined {
	if (
		!['modern', 'modern_aspirates', 'erasmian'].includes(renditionChirho ?? '') ||
		bibleBookChirho(lessonChirho.id_chirho.split('.')[0]).language_chirho === 'he'
	)
		return automaticVerseRecordingChirho(clipsChirho, lessonChirho);
	const textChirho = spokenVerseChirho(lessonChirho);
	return clipsChirho.find(
		(clipChirho) =>
			clipChirho.token_id_chirho === null &&
			clipChirho.text_chirho === textChirho &&
			(renditionChirho === 'modern'
				? clipChirho.pronunciation_chirho === 'modern_greek'
				: renditionChirho === 'erasmian'
					? clipChirho.pronunciation_chirho === 'erasmian_greek'
					: clipChirho.pronunciation_chirho === 'modern_greek_aspirates' ||
						(clipChirho.pronunciation_chirho === 'modern_greek' &&
							!textChirho.normalize('NFD').includes('\u0314')))
	);
}
let activeChirho = '';
let generationChirho = 0;
let audioChirho: HTMLAudioElement | null = null;
let utteranceChirho: SpeechSynthesisUtterance | null = null;
let deadlineChirho: ReturnType<typeof setTimeout> | undefined;
const listenersChirho = new Set<(keyChirho: string, errorChirho: boolean) => void>();
function notifyChirho(errorChirho = false, keyChirho = activeChirho) {
	for (const listenerChirho of listenersChirho) listenerChirho(keyChirho, errorChirho);
}
export function stopContextPlaybackChirho(errorChirho = false): void {
	generationChirho++;
	clearTimeout(deadlineChirho);
	deadlineChirho = undefined;
	const stoppedKeyChirho = activeChirho;
	if (audioChirho) {
		audioChirho.pause();
		audioChirho.removeAttribute('src');
		audioChirho.load();
		audioChirho = null;
	}
	if (utteranceChirho) {
		speechSynthesis.cancel();
		utteranceChirho = null;
	}
	activeChirho = '';
	notifyChirho(errorChirho, errorChirho ? stoppedKeyChirho : '');
}
export function subscribeContextPlaybackChirho(
	listenerChirho: (keyChirho: string, errorChirho: boolean) => void
): () => void {
	listenersChirho.add(listenerChirho);
	listenerChirho(activeChirho, false);
	return () => {
		listenersChirho.delete(listenerChirho);
	};
}
export function installContextPlaybackChirho(): () => void {
	const stopChirho = () => stopContextPlaybackChirho();
	const manualChirho = (eventChirho: Event) => {
		if (
			eventChirho.target instanceof Element &&
			eventChirho.target.closest(
				'[data-pronounce-chirho],[data-verse-video-play-chirho],[data-greek-rendition-chirho]'
			)
		)
			stopChirho();
	};
	const visibilityChirho = () => {
		if (document.visibilityState !== 'visible') stopChirho();
	};
	document.addEventListener('hinneh-stop-playback-chirho', stopChirho);
	document.addEventListener('click', manualChirho, true);
	document.addEventListener('change', manualChirho, true);
	document.addEventListener('visibilitychange', visibilityChirho);
	return () => {
		stopChirho();
		document.removeEventListener('hinneh-stop-playback-chirho', stopChirho);
		document.removeEventListener('click', manualChirho, true);
		document.removeEventListener('change', manualChirho, true);
		document.removeEventListener('visibilitychange', visibilityChirho);
	};
}
function startChirho(keyChirho: string): number | null {
	const sameChirho = activeChirho === keyChirho;
	document.dispatchEvent(new Event('hinneh-stop-playback-chirho'));
	if (sameChirho) return null;
	activeChirho = keyChirho;
	const currentChirho = ++generationChirho;
	notifyChirho();
	return currentChirho;
}
export function playContextOriginalChirho(
	keyChirho: string,
	clipChirho: RecordingChirho,
	rateChirho: number
): void {
	const currentChirho = startChirho(keyChirho);
	if (currentChirho === null) return;
	const playerChirho = new Audio(clipChirho.asset_path_chirho);
	audioChirho = playerChirho;
	playerChirho.playbackRate = rateChirho;
	const startOffsetChirho = clipChirho.start_offset_chirho ?? 0;
	const endOffsetChirho = clipChirho.end_offset_chirho;
	const failedChirho = () => {
		if (currentChirho === generationChirho) stopContextPlaybackChirho(true);
	};
	const beginChirho = () => {
		if (currentChirho !== generationChirho) return;
		try {
			if (startOffsetChirho) playerChirho.currentTime = startOffsetChirho;
			playerChirho.play().catch(failedChirho);
		} catch {
			failedChirho();
		}
	};
	playerChirho.onended = () => {
		if (currentChirho === generationChirho) stopContextPlaybackChirho();
	};
	playerChirho.onerror = failedChirho;
	deadlineChirho = setTimeout(failedChirho, 15000);
	playerChirho.onplaying = () => {
		if (currentChirho === generationChirho) clearTimeout(deadlineChirho);
	};
	playerChirho.ontimeupdate = () => {
		if (
			currentChirho === generationChirho &&
			endOffsetChirho !== undefined &&
			playerChirho.currentTime >= endOffsetChirho
		)
			stopContextPlaybackChirho();
	};
	if (startOffsetChirho && playerChirho.readyState < 1) playerChirho.onloadedmetadata = beginChirho;
	else beginChirho();
}
export function localInterfaceVoiceChirho(
	localeChirho: 'en' | 'es'
): SpeechSynthesisVoice | undefined {
	if (typeof speechSynthesis === 'undefined') return;
	return speechSynthesis
		.getVoices()
		.find(
			(voiceChirho) =>
				voiceChirho.localService && voiceChirho.lang.toLowerCase().split(/[-_]/)[0] === localeChirho
		);
}
export function playContextTranslationChirho(
	keyChirho: string,
	textChirho: string,
	localeChirho: 'en' | 'es'
): void {
	const voiceChirho = localInterfaceVoiceChirho(localeChirho);
	if (!voiceChirho || !textChirho || textChirho.length > 12000) return;
	const currentChirho = startChirho(keyChirho);
	if (currentChirho === null) return;
	const speechChirho = new SpeechSynthesisUtterance(textChirho);
	speechChirho.voice = voiceChirho;
	speechChirho.lang = voiceChirho.lang;
	speechChirho.rate = 0.9;
	utteranceChirho = speechChirho;
	speechChirho.onend = () => {
		if (currentChirho === generationChirho) stopContextPlaybackChirho();
	};
	speechChirho.onerror = () => {
		if (currentChirho === generationChirho) stopContextPlaybackChirho(true);
	};
	speechSynthesis.speak(speechChirho);
}
