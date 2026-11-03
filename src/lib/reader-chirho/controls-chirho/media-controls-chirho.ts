// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// Workflow: local-reader-chirho.md; media failures preserve source text during verse navigation.
export function installMediaChirho(rootChirho: Document): () => void {
	function failChirho(imageChirho: HTMLImageElement): void {
		if (!imageChirho.matches('[data-scene-chirho], [data-icon-chirho]')) return;
		imageChirho.hidden = true;
		const messageChirho = imageChirho.matches('[data-scene-chirho]')
			? imageChirho.closest('figure')?.querySelector<HTMLElement>('[data-scene-missing-chirho]')
			: imageChirho.parentElement?.querySelector<HTMLElement>('[data-icon-missing-chirho]');
		if (messageChirho) messageChirho.hidden = false;
	}
	function errorChirho(eventChirho: Event): void {
		if (eventChirho.target instanceof HTMLImageElement) failChirho(eventChirho.target);
	}
	function loadChirho(eventChirho: Event): void {
		const imageChirho = eventChirho.target;
		if (
			!(imageChirho instanceof HTMLImageElement) ||
			!imageChirho.matches('[data-scene-chirho], [data-icon-chirho]')
		)
			return;
		imageChirho.hidden = false;
		const messageChirho = imageChirho.matches('[data-scene-chirho]')
			? imageChirho.closest('figure')?.querySelector<HTMLElement>('[data-scene-missing-chirho]')
			: imageChirho.parentElement?.querySelector<HTMLElement>('[data-icon-missing-chirho]');
		if (messageChirho) messageChirho.hidden = true;
	}
	rootChirho.addEventListener('error', errorChirho, true);
	rootChirho.addEventListener('load', loadChirho, true);
	for (const imageChirho of rootChirho.querySelectorAll<HTMLImageElement>(
		'[data-scene-chirho], [data-icon-chirho]'
	)) {
		if (imageChirho.complete && !imageChirho.naturalWidth) failChirho(imageChirho);
	}
	return () => {
		rootChirho.removeEventListener('error', errorChirho, true);
		rootChirho.removeEventListener('load', loadChirho, true);
	};
}
