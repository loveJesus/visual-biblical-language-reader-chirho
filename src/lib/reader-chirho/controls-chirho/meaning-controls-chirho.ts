// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: local-reader-chirho.md. Current-language meanings share the actual word card's verified data.
// Self-contained so the saved offline reader can install the same preference behavior.
export function installMeaningsChirho(rootChirho: Document = document): () => void {
	const storageKeyChirho = 'hinneh-translation-display-chirho';
	let modeChirho = 'none';
	try {
		const savedChirho = localStorage.getItem(storageKeyChirho);
		if (savedChirho === 'readers' || savedChirho === 'terse') modeChirho = savedChirho;
	} catch {
		/* Optional storage never removes the reading view. */
	}
	let disposedChirho = false;
	function meaningChirho(cardChirho: HTMLElement, languageChirho: string): HTMLElement | null {
		for (const glossChirho of cardChirho.querySelectorAll<HTMLElement>('.word-gloss-chirho')) {
			if (glossChirho.closest('[hidden], [data-edition-word-chirho]')) continue;
			if (glossChirho.dataset.meaningUnavailableChirho === 'true') continue;
			const glossLanguageChirho = glossChirho.closest<HTMLElement>('[lang]')?.lang;
			if (glossLanguageChirho && glossLanguageChirho !== languageChirho) continue;
			if (glossChirho.textContent?.trim()) return glossChirho;
		}
		return null;
	}
	function displayGlossChirho(textChirho: string): string {
		return textChirho.replace(/–/gu, ' ').replace(/\s+/gu, ' ').trim();
	}
	function refreshChirho(): void {
		if (disposedChirho) return;
		let editionsChirho: Record<
			string,
			{ words_chirho: { token_id_chirho: string; gloss_chirho: string; state_chirho?: string }[] }
		> = {};
		const dataChirho = rootChirho.querySelector<HTMLElement>('[data-verse-translations-chirho]');
		const languageChirho =
			dataChirho?.dataset.translationLocaleChirho ?? rootChirho.documentElement.lang;
		try {
			const rawChirho = dataChirho?.dataset.verseTranslationsChirho ?? '{}';
			if (rawChirho.length <= 200000) editionsChirho = JSON.parse(rawChirho);
		} catch {
			/* The reader and its original word cards remain usable. */
		}
		type DisplayWordChirho = { textChirho: string; draftChirho: boolean };
		const mapsChirho = new Map<string, Map<string, DisplayWordChirho>>();
		for (const modeChirho of ['readers', 'terse']) {
			const rowsChirho = editionsChirho?.[modeChirho + '_chirho']?.words_chirho;
			const mapChirho = new Map<string, DisplayWordChirho>();
			if (Array.isArray(rowsChirho))
				for (const rowChirho of rowsChirho)
					if (
						rowChirho &&
						typeof rowChirho.token_id_chirho === 'string' &&
						typeof rowChirho.gloss_chirho === 'string'
					)
						mapChirho.set(rowChirho.token_id_chirho, {
							textChirho: displayGlossChirho(rowChirho.gloss_chirho),
							draftChirho: rowChirho.state_chirho !== 'APPROVED'
						});
			if ([...mapChirho.values()].some((valueChirho) => valueChirho.textChirho))
				mapsChirho.set(modeChirho, mapChirho);
		}
		const readersAvailableChirho = mapsChirho.has('readers'),
			terseAvailableChirho = mapsChirho.has('terse');
		const selectedMapChirho = mapsChirho.get(modeChirho);
		for (const unitChirho of rootChirho.querySelectorAll<HTMLElement>('.word-unit-chirho')) {
			const linkChirho = unitChirho.querySelector<HTMLElement>(
				'.word-jump-chirho[data-word-jump-chirho]'
			);
			const cardChirho = rootChirho.getElementById(linkChirho?.dataset.wordJumpChirho ?? '');
			const outputChirho = unitChirho.querySelector<HTMLElement>('.word-meaning-chirho');
			if (!linkChirho || !cardChirho || !outputChirho) continue;
			const tokenChirho = linkChirho.dataset.meaningTokenChirho ?? '';
			const selectedWordChirho = selectedMapChirho?.get(tokenChirho);
			const textChirho = selectedWordChirho?.textChirho ?? '';
			if (outputChirho.textContent !== textChirho) outputChirho.textContent = textChirho;
			if (outputChirho.hidden !== !textChirho) outputChirho.hidden = !textChirho;
			if (outputChirho.lang !== languageChirho) outputChirho.lang = languageChirho;
			const originalChirho = selectedWordChirho ? null : meaningChirho(cardChirho, languageChirho);
			const fallbackModeChirho = readersAvailableChirho ? 'readers' : 'terse';
			const detailWordChirho =
				selectedWordChirho ??
				(originalChirho ? undefined : mapsChirho.get(fallbackModeChirho)?.get(tokenChirho));
			const detailTextChirho = detailWordChirho?.textChirho ?? '';
			const hoverTextChirho = originalChirho?.textContent?.trim() ?? detailTextChirho;
			if (linkChirho.dataset.wordMeaningChirho !== hoverTextChirho)
				linkChirho.dataset.wordMeaningChirho = hoverTextChirho;
			if (linkChirho.dataset.wordMeaningLanguageChirho !== languageChirho)
				linkChirho.dataset.wordMeaningLanguageChirho = languageChirho;
			const detailChirho = cardChirho.querySelector<HTMLElement>('[data-edition-word-chirho]');
			if (detailChirho) {
				const glossChirho = detailChirho.querySelector<HTMLElement>('[data-edition-gloss-chirho]');
				const creditChirho = detailChirho.querySelector<HTMLElement>(
					'[data-edition-source-chirho]'
				);
				if (detailChirho.hidden !== !detailTextChirho) detailChirho.hidden = !detailTextChirho;
				if (glossChirho && glossChirho.textContent !== detailTextChirho)
					glossChirho.textContent = detailTextChirho;
				if (detailChirho.lang !== languageChirho) detailChirho.lang = languageChirho;
				const readersChirho = (selectedWordChirho ? modeChirho : fallbackModeChirho) === 'readers';
				const editionLabelChirho =
					languageChirho === 'es'
						? readersChirho
							? 'Lectura'
							: 'Breve'
						: readersChirho
							? 'Readers'
							: 'Terse';
				const draftLabelChirho = detailWordChirho?.draftChirho
					? languageChirho === 'es'
						? ' · borrador importado'
						: ' · imported draft'
					: '';
				const creditTextChirho = 'Bible Tools · ' + editionLabelChirho + draftLabelChirho;
				if (creditChirho && creditChirho.textContent !== creditTextChirho)
					creditChirho.textContent = creditTextChirho;
			}
		}
		for (const optionChirho of rootChirho.querySelectorAll<HTMLElement>(
			'[data-translation-mode-chirho]'
		)) {
			const availableChirho =
				optionChirho.dataset.translationModeChirho === 'readers'
					? readersAvailableChirho
					: terseAvailableChirho;
			if (optionChirho.hidden !== !availableChirho) optionChirho.hidden = !availableChirho;
		}
		const activeChirho =
			(modeChirho === 'readers' && readersAvailableChirho) ||
			(modeChirho === 'terse' && terseAvailableChirho)
				? modeChirho
				: 'none';
		for (const radioChirho of rootChirho.querySelectorAll<HTMLInputElement>(
			'[data-translation-display-chirho]'
		)) {
			radioChirho.disabled =
				radioChirho.value === 'readers'
					? !readersAvailableChirho
					: radioChirho.value === 'terse'
						? !terseAvailableChirho
						: false;
			radioChirho.checked = radioChirho.value === activeChirho;
		}
	}
	function changeChirho(eventChirho: Event): void {
		const targetChirho = eventChirho.target;
		if (
			targetChirho instanceof HTMLInputElement &&
			targetChirho.matches('[data-translation-display-chirho]') &&
			targetChirho.checked &&
			!targetChirho.disabled
		) {
			if (!['none', 'readers', 'terse'].includes(targetChirho.value)) return;
			modeChirho = targetChirho.value;
			try {
				localStorage.setItem(storageKeyChirho, modeChirho);
			} catch {
				/* The current choice still applies. */
			}
		}
		refreshChirho();
	}
	const observerChirho = new MutationObserver(refreshChirho);
	observerChirho.observe(rootChirho, {
		subtree: true,
		childList: true,
		characterData: true,
		attributes: true,
		attributeFilter: [
			'hidden',
			'lang',
			'data-verse-translations-chirho',
			'data-translation-locale-chirho'
		]
	});
	rootChirho.addEventListener('change', changeChirho);
	refreshChirho();
	return () => {
		disposedChirho = true;
		observerChirho.disconnect();
		rootChirho.removeEventListener('change', changeChirho);
	};
}
