// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: hosting-chirho/public-site-chirho.md. Self-contained for saved offline readers.
export function installIpaChirho(rootChirho: Document | HTMLElement = document) {
	const storageKeyChirho = 'hinneh-show-ipa-chirho';
	let shownChirho = false,
		disposedChirho = false;
	try {
		shownChirho = localStorage.getItem(storageKeyChirho) === 'true';
	} catch {
		/* Storage is optional. */
	}
	function refreshChirho() {
		if (disposedChirho) return;
		for (const inputChirho of rootChirho.querySelectorAll<HTMLInputElement>(
			'[data-show-ipa-chirho]'
		)) {
			inputChirho.checked = shownChirho;
			inputChirho.disabled = false;
		}
		for (const noteChirho of rootChirho.querySelectorAll<HTMLElement>('[data-ipa-guide-chirho]'))
			noteChirho.hidden = !shownChirho;
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
			if (messagesChirho.length <= 16384)
				unavailableChirho = JSON.parse(messagesChirho).ipa_unavailable_chirho ?? unavailableChirho;
		} catch {
			/* A source-derived value can still display without recordings. */
		}
		for (const elementChirho of rootChirho.querySelectorAll<HTMLElement>(
			'[data-word-ipa-chirho]'
		)) {
			elementChirho.hidden = !shownChirho;
			if (!shownChirho) continue;
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
			elementChirho.title = ipaChirho ? 'IPA' : unavailableChirho;
			elementChirho.setAttribute('aria-label', ipaChirho ? `IPA: ${ipaChirho}` : unavailableChirho);
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
			targetChirho.matches('[data-show-ipa-chirho]')
		) {
			shownChirho = targetChirho.checked;
			try {
				localStorage.setItem(storageKeyChirho, String(shownChirho));
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
			'data-ipa-values-chirho'
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
