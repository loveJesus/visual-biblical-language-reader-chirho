// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

/** Self-contained so the same local-only playback works in exported offline readers. */
export function installSpeechChirho(rootChirho: Document | HTMLElement = document) {
	const speechChirho = typeof window !== 'undefined' ? window.speechSynthesis : undefined;
	let sequenceChirho = 0;
	let activeButtonChirho: HTMLButtonElement | null = null;
	let currentUtteranceChirho: SpeechSynthesisUtterance | null = null;
	let currentRecordingChirho: HTMLAudioElement | null = null;
	let disposedChirho = false;
	const buttonSelectorChirho = '[data-pronounce-chirho]';
	const pendingChirho = () =>
		Boolean(rootChirho.querySelector('[data-speech-pending-chirho="true"]'));
	const languageChirho = (buttonChirho: HTMLButtonElement) =>
		buttonChirho.dataset.speechLanguageChirho === 'he' ? 'he' : 'grc';
	const primaryChirho = (langChirho: string) =>
		langChirho.toLowerCase().replace('_', '-').split('-')[0];
	function voiceChirho(langChirho: 'he' | 'grc') {
		const voicesChirho = (speechChirho?.getVoices() ?? []).filter(
			(itemChirho) => itemChirho.localService
		);
		const allowedChirho = langChirho === 'he' ? ['he', 'iw'] : ['el', 'grc'];
		for (const codeChirho of allowedChirho) {
			const matchesChirho = voicesChirho.filter(
				(itemChirho) => primaryChirho(itemChirho.lang) === codeChirho
			);
			const selectedChirho =
				matchesChirho.find((itemChirho) => itemChirho.default) ?? matchesChirho[0];
			if (selectedChirho) return selectedChirho;
		}
		return undefined;
	}
	function statusChirho(messageChirho: string) {
		for (const elementChirho of rootChirho.querySelectorAll<HTMLElement>(
			'[data-audio-status-chirho]'
		))
			elementChirho.textContent = messageChirho;
	}
	function messageChirho(keyChirho: string, paramsChirho: Record<string, string> = {}) {
		const rawChirho =
			rootChirho
				.querySelector('[data-speech-messages-chirho]')
				?.getAttribute('data-speech-messages-chirho') ?? '{}';
		try {
			if (rawChirho.length > 16_384) throw new Error('Invalid audio messages');
			const messagesChirho = JSON.parse(rawChirho) as Record<string, unknown>;
			const templateChirho = messagesChirho[keyChirho];
			if (typeof templateChirho !== 'string') throw new Error('Missing audio message');
			return templateChirho.replace(
				/\{(\w+)\}/g,
				(matchChirho, nameChirho) => paramsChirho[nameChirho] ?? matchChirho
			);
		} catch {
			return 'Audio playback is unavailable.';
		}
	}
	function greekRenditionChirho() {
		return (rootChirho.querySelector('[data-greek-rendition-chirho]') as HTMLSelectElement | null)
			?.value;
	}
	function mayUseDeviceChirho(buttonChirho: HTMLButtonElement) {
		const renditionChirho = greekRenditionChirho();
		return (
			languageChirho(buttonChirho) === 'he' ||
			!renditionChirho ||
			renditionChirho === 'modern' ||
			(renditionChirho === 'modern_aspirates' &&
				!buttonChirho.dataset.pronounceChirho?.normalize('NFD').includes('\u0314'))
		);
	}
	interface SavedClipChirho {
		text_chirho: string;
		language_chirho: string;
		token_id_chirho: string | null;
		asset_path_chirho: string;
		voice_name_chirho: string;
		ipa_chirho?: string;
		pronunciation_chirho?: string;
		bytes_chirho: number;
		start_offset_chirho?: number;
		end_offset_chirho?: number;
	}
	function clipsChirho(): SavedClipChirho[] {
		if (typeof Audio === 'undefined') return [];
		try {
			const rawChirho =
				rootChirho
					.querySelector('[data-speech-recordings-chirho]')
					?.getAttribute('data-speech-recordings-chirho') ?? '[]';
			if (rawChirho.length > 131_072) return [];
			const valuesChirho = JSON.parse(rawChirho) as SavedClipChirho[];
			return Array.isArray(valuesChirho) ? valuesChirho : [];
		} catch {
			return [];
		}
	}
	function compatibleChirho(clipChirho: SavedClipChirho, buttonChirho: HTMLButtonElement) {
		return (
			(languageChirho(buttonChirho) === 'he' ||
				!greekRenditionChirho() ||
				(greekRenditionChirho() === 'modern'
					? clipChirho.pronunciation_chirho === 'modern_greek'
					: greekRenditionChirho() === 'erasmian'
						? clipChirho.pronunciation_chirho === 'erasmian_greek'
						: clipChirho.pronunciation_chirho === 'modern_greek_aspirates' ||
							(clipChirho.pronunciation_chirho === 'modern_greek' &&
								mayUseDeviceChirho(buttonChirho)))) &&
			clipChirho.language_chirho === (languageChirho(buttonChirho) === 'he' ? 'he' : 'el') &&
			/^\/audio-chirho\/sha256-chirho\/[a-f0-9]{64}-chirho\.mp3$/u.test(
				clipChirho.asset_path_chirho
			)
		);
	}
	function recordingChirho(buttonChirho: HTMLButtonElement) {
		return clipsChirho().find(
			(clipChirho) =>
				clipChirho.text_chirho === buttonChirho.dataset.pronounceChirho &&
				compatibleChirho(clipChirho, buttonChirho) &&
				(!buttonChirho.dataset.speechTokenChirho ||
					clipChirho.token_id_chirho === buttonChirho.dataset.speechTokenChirho) &&
				(clipChirho.token_id_chirho !== null) ===
					buttonChirho.classList.contains('word-speech-chirho') &&
				/^\/audio-chirho\/sha256-chirho\/[a-f0-9]{64}-chirho\.mp3$/.test(
					clipChirho.asset_path_chirho
				)
		);
	}
	function wordSequenceChirho(buttonChirho: HTMLButtonElement) {
		if (buttonChirho.classList.contains('word-speech-chirho')) return null;
		try {
			const rawChirho =
				rootChirho
					.querySelector('[data-speech-words-chirho]')
					?.getAttribute('data-speech-words-chirho') ?? '[]';
			if (rawChirho.length > 16384) return null;
			const wordsChirho = JSON.parse(rawChirho) as {
				token_id_chirho: string;
				pause_after_chirho: number;
			}[];
			if (!Array.isArray(wordsChirho) || wordsChirho.length < 1 || wordsChirho.length > 150)
				return null;
			const availableChirho = clipsChirho(),
				sequenceChirho: { clip_chirho: SavedClipChirho; pause_after_chirho: number }[] = [];
			let sizeChirho = 0;
			for (const wordChirho of wordsChirho) {
				const clipChirho = availableChirho.find(
					(rowChirho) =>
						rowChirho.token_id_chirho === wordChirho.token_id_chirho &&
						compatibleChirho(rowChirho, buttonChirho)
				);
				if (
					!clipChirho ||
					!Number.isSafeInteger(clipChirho.bytes_chirho) ||
					clipChirho.bytes_chirho < 1 ||
					!Number.isFinite(wordChirho.pause_after_chirho) ||
					wordChirho.pause_after_chirho < 0 ||
					wordChirho.pause_after_chirho > 500
				)
					return null;
				sizeChirho += clipChirho.bytes_chirho;
				if (sizeChirho > 8_000_000) return null;
				sequenceChirho.push({
					clip_chirho: clipChirho,
					pause_after_chirho: wordChirho.pause_after_chirho
				});
			}
			return sequenceChirho;
		} catch {
			return null;
		}
	}
	let sequenceAudiosChirho: HTMLAudioElement[] = [];
	let gapTimerChirho: ReturnType<typeof setTimeout> | null = null;
	let cancelClipChirho: (() => void) | null = null;
	function playClipChirho(
		audioChirho: HTMLAudioElement,
		clipChirho: SavedClipChirho,
		finishedChirho: (failedChirho?: boolean) => void,
		trimChirho = true
	) {
		cancelClipChirho?.();
		let doneChirho = false,
			startedChirho = false;
		let windowTimerChirho: ReturnType<typeof setTimeout> | null = null;
		const clearTimerChirho = () => {
			if (windowTimerChirho !== null) clearTimeout(windowTimerChirho);
			windowTimerChirho = null;
		};
		const cancelChirho = () => {
			doneChirho = true;
			clearTimerChirho();
			audioChirho.onended = audioChirho.onerror = audioChirho.onplaying = null;
			audioChirho.onratechange = audioChirho.onloadedmetadata = null;
			audioChirho.onwaiting = audioChirho.onstalled = audioChirho.onseeking = null;
			audioChirho.onseeked = audioChirho.ontimeupdate = audioChirho.onpause = null;
			if (cancelClipChirho === cancelChirho) cancelClipChirho = null;
		};
		cancelClipChirho = cancelChirho;
		const finishChirho = (failedChirho = false) => {
			if (doneChirho || disposedChirho || currentRecordingChirho !== audioChirho) return;
			cancelChirho();
			audioChirho.pause();
			finishedChirho(failedChirho);
		};
		const scheduleChirho = () => {
			if (doneChirho || disposedChirho || currentRecordingChirho !== audioChirho) return;
			clearTimerChirho();
			if (!trimChirho || audioChirho.paused || clipChirho.end_offset_chirho === undefined) return;
			const remainingChirho = clipChirho.end_offset_chirho - audioChirho.currentTime;
			if (remainingChirho <= 0) {
				finishChirho();
				return;
			}
			// Workflow: reusable-word-audio-chirho.md. Buffering and seeking stop the media
			// clock, so a wall-time deadline must recheck it before trimming the recording.
			windowTimerChirho = setTimeout(
				scheduleChirho,
				Math.max(16, Math.min(1000, (remainingChirho / audioChirho.playbackRate) * 1000))
			);
		};
		const startChirho = () => {
			if (doneChirho || startedChirho || disposedChirho || currentRecordingChirho !== audioChirho)
				return;
			startedChirho = true;
			if (
				trimChirho &&
				clipChirho.start_offset_chirho !== undefined &&
				clipChirho.start_offset_chirho > 0
			)
				audioChirho.currentTime = clipChirho.start_offset_chirho;
			void audioChirho.play().catch(() => finishChirho(true));
		};
		audioChirho.onended = () => finishChirho();
		audioChirho.onerror = () => finishChirho(true);
		audioChirho.onplaying = scheduleChirho;
		audioChirho.onratechange = scheduleChirho;
		audioChirho.onloadedmetadata = startChirho;
		audioChirho.onwaiting = audioChirho.onstalled = audioChirho.onseeking = clearTimerChirho;
		audioChirho.onpause = clearTimerChirho;
		audioChirho.onseeked = audioChirho.ontimeupdate = scheduleChirho;
		if (audioChirho.readyState >= 1) startChirho();
	}
	function idleMessageChirho() {
		const buttonChirho = rootChirho.querySelector<HTMLButtonElement>(buttonSelectorChirho);
		const langChirho = buttonChirho ? languageChirho(buttonChirho) : 'he';
		const savedChirho = buttonChirho ? recordingChirho(buttonChirho) : undefined;
		if (savedChirho)
			return messageChirho(
				savedChirho.ipa_chirho ? 'recorded_ipa_ready_chirho' : 'recorded_ready_chirho',
				{
					name_chirho: savedChirho.voice_name_chirho.split(' - ')[0]
				}
			);
		if (buttonChirho && wordSequenceChirho(buttonChirho))
			return messageChirho('assembled_ready_chirho');
		if (buttonChirho && !mayUseDeviceChirho(buttonChirho))
			return messageChirho('rendition_unavailable_chirho');
		const selectedChirho = voiceChirho(langChirho);
		if (!speechChirho || typeof SpeechSynthesisUtterance === 'undefined')
			return messageChirho('unavailable_chirho');
		if (!selectedChirho)
			return messageChirho('no_voice_chirho', {
				language_chirho: messageChirho(langChirho === 'he' ? 'hebrew_chirho' : 'greek_chirho')
			});
		const pronunciationChirho =
			langChirho === 'he'
				? messageChirho('device_hebrew_chirho')
				: primaryChirho(selectedChirho.lang) === 'grc'
					? messageChirho('ancient_greek_chirho')
					: messageChirho('modern_greek_chirho');
		return messageChirho('voice_ready_chirho', {
			pronunciation_chirho: pronunciationChirho,
			name_chirho: selectedChirho.name
		});
	}
	function refreshChirho() {
		if (disposedChirho) return;
		for (const buttonChirho of rootChirho.querySelectorAll<HTMLButtonElement>(
			buttonSelectorChirho
		)) {
			buttonChirho.disabled =
				buttonChirho.dataset.speechUnavailableChirho === 'true' ||
				pendingChirho() ||
				(!recordingChirho(buttonChirho) &&
					!wordSequenceChirho(buttonChirho) &&
					(!mayUseDeviceChirho(buttonChirho) ||
						!speechChirho ||
						typeof SpeechSynthesisUtterance === 'undefined' ||
						!voiceChirho(languageChirho(buttonChirho))));
		}
		if (!activeButtonChirho) statusChirho(idleMessageChirho());
	}
	function stopChirho() {
		sequenceChirho += 1;
		cancelClipChirho?.();
		if (gapTimerChirho !== null) {
			clearTimeout(gapTimerChirho);
			gapTimerChirho = null;
		}
		const recordingsChirho = new Set(sequenceAudiosChirho);
		if (currentRecordingChirho) recordingsChirho.add(currentRecordingChirho);
		for (const audioChirho of recordingsChirho) {
			audioChirho.pause();
			// An empty src reloads the document as media in Safari. Removing it and loading
			// releases the old resource without starting a spurious request or decode error.
			audioChirho.removeAttribute('src');
			audioChirho.load();
		}
		sequenceAudiosChirho = [];
		if (activeButtonChirho) activeButtonChirho.removeAttribute('aria-busy');
		activeButtonChirho = null;
		if (currentUtteranceChirho) speechChirho?.cancel();
		currentRecordingChirho = null;
		currentUtteranceChirho = null;
		for (const buttonChirho of rootChirho.querySelectorAll<HTMLButtonElement>(
			'[data-speech-stop-chirho]'
		))
			buttonChirho.disabled = true;
		if (!disposedChirho) statusChirho(idleMessageChirho());
	}
	function clickChirho(eventChirho: Event) {
		if (!(eventChirho.target instanceof Element)) return;
		if (eventChirho.target.closest('[data-speech-stop-chirho]')) {
			stopChirho();
			return;
		}
		const buttonChirho = eventChirho.target.closest<HTMLButtonElement>(buttonSelectorChirho);
		if (
			!buttonChirho ||
			buttonChirho.disabled ||
			pendingChirho() ||
			!rootChirho.contains(buttonChirho)
		)
			return;
		if (activeButtonChirho === buttonChirho) {
			stopChirho();
			return;
		}
		const savedChirho = recordingChirho(buttonChirho);
		if (savedChirho) {
			stopChirho();
			const requestChirho = ++sequenceChirho;
			const audioChirho = new Audio(savedChirho.asset_path_chirho);
			currentRecordingChirho = audioChirho;
			const rateChirho =
				(rootChirho.querySelector('[data-speech-rate-chirho]') as HTMLSelectElement | null)
					?.value ?? '1';
			audioChirho.playbackRate = ['0.65', '0.85', '0.88', '1'].includes(rateChirho)
				? Number(rateChirho)
				: 1;
			audioChirho.preservesPitch = true;
			activeButtonChirho = buttonChirho;
			buttonChirho.setAttribute('aria-busy', 'true');
			for (const stopButtonChirho of rootChirho.querySelectorAll<HTMLButtonElement>(
				'[data-speech-stop-chirho]'
			))
				stopButtonChirho.disabled = false;
			statusChirho(
				messageChirho('recorded_playing_chirho', {
					name_chirho: savedChirho.voice_name_chirho.split(' - ')[0]
				})
			);
			const finishedChirho = (errorChirho = false) => {
				if (disposedChirho || sequenceChirho !== requestChirho) return;
				stopChirho();
				if (errorChirho) statusChirho(messageChirho('recorded_failed_chirho'));
			};
			// A word audition plays the full authored file. Joining windows only remove quiet
			// between verse words; early pause/seek is unnecessary for an isolated pronunciation.
			playClipChirho(
				audioChirho,
				savedChirho,
				finishedChirho,
				!buttonChirho.classList.contains('word-speech-chirho')
			);
			return;
		}
		const wordsChirho = wordSequenceChirho(buttonChirho);
		if (wordsChirho) {
			stopChirho();
			const requestChirho = ++sequenceChirho;
			const rateChirho =
				(rootChirho.querySelector('[data-speech-rate-chirho]') as HTMLSelectElement | null)
					?.value ?? '1';
			sequenceAudiosChirho = wordsChirho.map((wordChirho) => {
				const audioChirho = new Audio(wordChirho.clip_chirho.asset_path_chirho);
				audioChirho.preload = 'auto';
				audioChirho.playbackRate = ['0.65', '0.85', '0.88', '1'].includes(rateChirho)
					? Number(rateChirho)
					: 1;
				audioChirho.preservesPitch = true;
				audioChirho.load();
				return audioChirho;
			});
			activeButtonChirho = buttonChirho;
			buttonChirho.setAttribute('aria-busy', 'true');
			for (const stopButtonChirho of rootChirho.querySelectorAll<HTMLButtonElement>(
				'[data-speech-stop-chirho]'
			))
				stopButtonChirho.disabled = false;
			statusChirho(messageChirho('assembled_playing_chirho'));
			const finishChirho = (failedChirho = false) => {
				if (disposedChirho || sequenceChirho !== requestChirho) return;
				stopChirho();
				if (failedChirho) statusChirho(messageChirho('recorded_failed_chirho'));
			};
			const playWordChirho = (indexChirho: number) => {
				if (disposedChirho || sequenceChirho !== requestChirho) return;
				const audioChirho = sequenceAudiosChirho[indexChirho];
				currentRecordingChirho = audioChirho;
				playClipChirho(
					audioChirho,
					wordsChirho[indexChirho].clip_chirho,
					(failedChirho = false) => {
						if (disposedChirho || sequenceChirho !== requestChirho) return;
						if (failedChirho) {
							finishChirho(true);
							return;
						}
						if (indexChirho + 1 === wordsChirho.length) finishChirho();
						else
							gapTimerChirho = setTimeout(
								() => playWordChirho(indexChirho + 1),
								wordsChirho[indexChirho].pause_after_chirho / audioChirho.playbackRate
							);
					}
				);
			};
			playWordChirho(0);
			return;
		}
		if (!speechChirho || !mayUseDeviceChirho(buttonChirho)) return;
		const selectedChirho = voiceChirho(languageChirho(buttonChirho));
		const textChirho = buttonChirho.dataset.pronounceChirho ?? '';
		if (!selectedChirho || !textChirho.trim() || textChirho.length > 20_000) return;
		stopChirho();
		const requestChirho = ++sequenceChirho;
		const utteranceChirho = new SpeechSynthesisUtterance(textChirho);
		currentUtteranceChirho = utteranceChirho;
		utteranceChirho.voice = selectedChirho;
		utteranceChirho.lang = selectedChirho.lang;
		const rateChirho =
			(rootChirho.querySelector('[data-speech-rate-chirho]') as unknown as HTMLSelectElement | null)
				?.value ?? '1';
		utteranceChirho.rate = ['0.65', '0.85', '0.88', '1'].includes(rateChirho)
			? Number(rateChirho)
			: 1;
		activeButtonChirho = buttonChirho;
		buttonChirho.setAttribute('aria-busy', 'true');
		for (const stopButtonChirho of rootChirho.querySelectorAll<HTMLButtonElement>(
			'[data-speech-stop-chirho]'
		))
			stopButtonChirho.disabled = false;
		statusChirho(messageChirho('reading_chirho', { name_chirho: selectedChirho.name }));
		const finishChirho = (errorChirho = false) => {
			if (disposedChirho || requestChirho !== sequenceChirho) return;
			buttonChirho.removeAttribute('aria-busy');
			activeButtonChirho = null;
			if (currentUtteranceChirho === utteranceChirho) currentUtteranceChirho = null;
			for (const stopButtonChirho of rootChirho.querySelectorAll<HTMLButtonElement>(
				'[data-speech-stop-chirho]'
			))
				stopButtonChirho.disabled = true;
			statusChirho(errorChirho ? messageChirho('failed_chirho') : idleMessageChirho());
		};
		utteranceChirho.onend = () => finishChirho();
		utteranceChirho.onerror = () => finishChirho(true);
		try {
			speechChirho.speak(utteranceChirho);
		} catch {
			finishChirho(true);
		}
	}
	function changeChirho(eventChirho: Event) {
		const targetChirho = eventChirho.target;
		if (!(targetChirho instanceof HTMLSelectElement)) return;
		if (targetChirho.matches('[data-greek-rendition-chirho]')) {
			stopChirho();
			refreshChirho();
		}
		if (
			targetChirho.matches('[data-speech-rate-chirho]') &&
			currentRecordingChirho &&
			['0.65', '0.85', '0.88', '1'].includes(targetChirho.value)
		)
			currentRecordingChirho.playbackRate = Number(targetChirho.value);
		if (
			targetChirho.matches('[data-speech-rate-chirho]') &&
			['0.65', '0.85', '0.88', '1'].includes(targetChirho.value)
		)
			for (const audioChirho of sequenceAudiosChirho)
				audioChirho.playbackRate = Number(targetChirho.value);
	}
	const localeObserverChirho =
		typeof MutationObserver === 'undefined'
			? undefined
			: new MutationObserver(() => {
					if (pendingChirho()) stopChirho();
					refreshChirho();
				});
	localeObserverChirho?.observe(rootChirho, {
		subtree: true,
		attributes: true,
		attributeFilter: [
			'data-speech-messages-chirho',
			'data-speech-recordings-chirho',
			'data-speech-words-chirho',
			'data-speech-pending-chirho'
		]
	});
	rootChirho.addEventListener('click', clickChirho);
	rootChirho.addEventListener('change', changeChirho);
	speechChirho?.addEventListener('voiceschanged', refreshChirho);
	refreshChirho();
	return {
		refreshChirho,
		stopChirho,
		destroyChirho() {
			stopChirho();
			disposedChirho = true;
			localeObserverChirho?.disconnect();
			rootChirho.removeEventListener('click', clickChirho);
			rootChirho.removeEventListener('change', changeChirho);
			speechChirho?.removeEventListener('voiceschanged', refreshChirho);
		}
	};
}
