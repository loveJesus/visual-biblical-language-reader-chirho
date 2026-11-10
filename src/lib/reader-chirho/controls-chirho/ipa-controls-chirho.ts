// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: hosting-chirho/public-site-chirho.md. Self-contained for saved offline readers.
export function installIpaChirho(rootChirho: Document | HTMLElement = document) {
	const storageKeyChirho = 'hinneh-phonetic-display-chirho';
	let choiceChirho = 'none',
		disposedChirho = false;
	try {
		const storedChirho = localStorage.getItem(storageKeyChirho);
		if (storedChirho && ['none', 'ipa', 'transliteration'].includes(storedChirho))
			choiceChirho = storedChirho;
		else if (storedChirho === null && localStorage.getItem('hinneh-show-ipa-chirho') === 'true') {
			choiceChirho = 'ipa';
			localStorage.setItem(storageKeyChirho, choiceChirho);
		}
	} catch {
		/* Storage is optional. */
	}
	function refreshChirho() {
		if (disposedChirho) return;
		const documentChirho = rootChirho instanceof Document ? rootChirho : rootChirho.ownerDocument;
		const localeChirho =
			rootChirho.querySelector<HTMLElement>('[data-phonetic-locale-chirho]')?.dataset
				.phoneticLocaleChirho ??
			(documentChirho.documentElement.lang.split('-')[0] || 'en');
		const transliterationsChirho = new Map<HTMLElement, string>();
		for (const elementChirho of rootChirho.querySelectorAll<HTMLElement>('[data-word-ipa-chirho]'))
			try {
				const rawChirho = elementChirho.dataset.transliterationValuesChirho ?? '{}';
				if (rawChirho.length > 4096) continue;
				const valuesChirho = JSON.parse(rawChirho);
				const valueChirho = valuesChirho?.[localeChirho];
				if (typeof valueChirho === 'string' && valueChirho.trim() && valueChirho.length <= 200)
					transliterationsChirho.set(elementChirho, valueChirho);
			} catch {
				/* No transliteration is inferred from prose, another language or IPA. */
			}
		const transliterationAvailableChirho = transliterationsChirho.size > 0;
		for (const inputChirho of rootChirho.querySelectorAll<HTMLInputElement>(
			'[data-phonetic-choice-chirho]'
		)) {
			inputChirho.checked =
				inputChirho.value ===
				(choiceChirho === 'transliteration' && !transliterationAvailableChirho
					? 'none'
					: choiceChirho);
			inputChirho.disabled =
				inputChirho.value === 'transliteration' && !transliterationAvailableChirho;
			const labelChirho = inputChirho.closest('label');
			if (labelChirho && inputChirho.value === 'transliteration')
				labelChirho.hidden = !transliterationAvailableChirho;
		}
		// Older saved/offline HTML can still carry the original checkbox.
		for (const inputChirho of rootChirho.querySelectorAll<HTMLInputElement>(
			'[data-show-ipa-chirho]:not([data-phonetic-choice-chirho])'
		)) {
			inputChirho.checked = choiceChirho === 'ipa';
			inputChirho.disabled = false;
		}
		for (const noteChirho of rootChirho.querySelectorAll<HTMLElement>('[data-ipa-guide-chirho]'))
			noteChirho.hidden = choiceChirho !== 'ipa';
		for (const noteChirho of rootChirho.querySelectorAll<HTMLElement>(
			'[data-transliteration-guide-chirho]'
		))
			noteChirho.hidden = choiceChirho !== 'transliteration' || transliterationAvailableChirho;
		const profileChirho =
			(rootChirho.querySelector('[data-greek-rendition-chirho]') as HTMLSelectElement | null)
				?.value ?? 'modern_aspirates';
		let recordingsChirho: {
			token_id_chirho: string | null;
			text_chirho: string;
			ipa_chirho?: string;
			pronunciation_chirho?: string;
		}[] = [];
		let unavailableChirho = 'IPA unavailable';
		let ipaLabelChirho = 'IPA';
		let transliterationLabelChirho = 'Transliteration';
		try {
			const rawChirho =
				rootChirho
					.querySelector('[data-speech-recordings-chirho]')
					?.getAttribute('data-speech-recordings-chirho') ?? '[]';
			if (rawChirho.length <= 131072) {
				const parsedChirho = JSON.parse(rawChirho);
				if (Array.isArray(parsedChirho)) recordingsChirho = parsedChirho;
			}
			const messagesChirho =
				rootChirho
					.querySelector('[data-speech-messages-chirho]')
					?.getAttribute('data-speech-messages-chirho') ?? '{}';
			if (messagesChirho.length <= 16384) {
				const parsedChirho = JSON.parse(messagesChirho);
				unavailableChirho = parsedChirho.ipa_unavailable_chirho ?? unavailableChirho;
				ipaLabelChirho = parsedChirho.phonetic_ipa_chirho ?? ipaLabelChirho;
				transliterationLabelChirho =
					parsedChirho.phonetic_transliteration_chirho ?? transliterationLabelChirho;
			}
		} catch {
			/* A source-derived value can still display without recordings. */
		}
		for (const elementChirho of rootChirho.querySelectorAll<HTMLElement>(
			'[data-word-ipa-chirho]'
		)) {
			const transliterationChirho = transliterationsChirho.get(elementChirho);
			elementChirho.hidden =
				choiceChirho === 'none' || (choiceChirho === 'transliteration' && !transliterationChirho);
			if (elementChirho.hidden) continue;
			if (choiceChirho === 'transliteration') {
				if (elementChirho.textContent !== transliterationChirho)
					elementChirho.textContent = transliterationChirho ?? '';
				elementChirho.title = transliterationLabelChirho;
				elementChirho.setAttribute(
					'aria-label',
					`${transliterationLabelChirho}: ${transliterationChirho}`
				);
				elementChirho.lang = localeChirho;
				continue;
			}
			const hebrewChirho = elementChirho.dataset.ipaLanguageChirho === 'he';
			const selectedChirho = hebrewChirho ? 'he' : profileChirho;
			const textChirho = elementChirho.dataset.ipaTextChirho ?? '';
			const acceptedProfileChirho = hebrewChirho
				? 'israeli_hebrew'
				: profileChirho === 'erasmian'
					? 'erasmian_greek'
					: profileChirho === 'modern'
						? 'modern_greek'
						: 'modern_greek_aspirates';
			const recordingChirho = recordingsChirho.find(
				(rowChirho) =>
					rowChirho.token_id_chirho === elementChirho.dataset.ipaTokenChirho &&
					rowChirho.text_chirho === textChirho &&
					(rowChirho.pronunciation_chirho === acceptedProfileChirho ||
						(selectedChirho === 'modern_aspirates' &&
							rowChirho.pronunciation_chirho === 'modern_greek' &&
							!textChirho.normalize('NFD').includes('\u0314'))) &&
					typeof rowChirho.ipa_chirho === 'string' &&
					rowChirho.ipa_chirho.length <= 200
			);
			let ipaChirho = recordingChirho?.ipa_chirho ?? null;
			if (!ipaChirho)
				try {
					const rawChirho = elementChirho.dataset.ipaValuesChirho ?? '[]';
					if (rawChirho.length <= 2048) {
						const valuesChirho = JSON.parse(rawChirho) as {
							profile_chirho: string;
							ipa_chirho: string | null;
						}[];
						const valueChirho = valuesChirho.find(
							(rowChirho) => rowChirho.profile_chirho === selectedChirho
						)?.ipa_chirho;
						if (typeof valueChirho === 'string' && valueChirho.length <= 200)
							ipaChirho = valueChirho;
					}
				} catch {
					/* No guessed reading on malformed or unavailable phonetics. */
				}
			const displayChirho = ipaChirho ? `/${ipaChirho}/` : '—';
			if (elementChirho.textContent !== displayChirho) elementChirho.textContent = displayChirho;
			elementChirho.title = ipaChirho ? ipaLabelChirho : unavailableChirho;
			elementChirho.setAttribute(
				'aria-label',
				ipaChirho ? `${ipaLabelChirho}: ${ipaChirho}` : unavailableChirho
			);
			elementChirho.lang = hebrewChirho
				? 'he-fonipa'
				: profileChirho === 'erasmian'
					? 'grc-fonipa'
					: 'el-fonipa';
		}
	}
	function changeChirho(eventChirho: Event) {
		const targetChirho = eventChirho.target;
		if (
			targetChirho instanceof HTMLInputElement &&
			(targetChirho.matches('[data-phonetic-choice-chirho]') ||
				targetChirho.matches('[data-show-ipa-chirho]'))
		) {
			choiceChirho = targetChirho.matches('[data-phonetic-choice-chirho]')
				? targetChirho.value
				: targetChirho.checked
					? 'ipa'
					: 'none';
			if (!['none', 'ipa', 'transliteration'].includes(choiceChirho)) choiceChirho = 'none';
			try {
				localStorage.setItem(storageKeyChirho, choiceChirho);
			} catch {
				/* The current view still works. */
			}
			refreshChirho();
		} else if (
			targetChirho instanceof HTMLSelectElement &&
			targetChirho.matches('[data-greek-rendition-chirho]')
		)
			refreshChirho();
	}
	const observerChirho = new MutationObserver(refreshChirho);
	observerChirho.observe(rootChirho, {
		subtree: true,
		childList: true,
		attributes: true,
		attributeFilter: [
			'data-speech-recordings-chirho',
			'data-speech-messages-chirho',
			'data-ipa-values-chirho',
			'data-ipa-token-chirho',
			'data-ipa-text-chirho',
			'data-transliteration-values-chirho',
			'data-phonetic-locale-chirho',
			'data-phonetic-verse-chirho'
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
