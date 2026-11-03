// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// One meaning-language selection controls the translation reveal and lower word glosses offline too.
export function installGlossesChirho(rootChirho: Document): () => void {
	function changeChirho(eventChirho: Event): void {
		const selectChirho = eventChirho.target;
		if (
			!(selectChirho instanceof HTMLSelectElement) ||
			!selectChirho.hasAttribute('data-gloss-select-chirho')
		)
			return;
		for (const blockChirho of rootChirho.querySelectorAll<HTMLElement>(
			'[data-gloss-language-chirho]'
		))
			blockChirho.hidden = blockChirho.dataset.glossLanguageChirho !== selectChirho.value;
	}
	rootChirho.addEventListener('change', changeChirho);
	return () => rootChirho.removeEventListener('change', changeChirho);
}
