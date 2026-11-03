// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// Workflow: local-reader-chirho.md; a source word leads to its own card without changing the passage URL.
export function installWordNavigationChirho(rootChirho: Document): () => void {
	function jumpChirho(eventChirho: MouseEvent): void {
		if (
			eventChirho.button !== 0 ||
			eventChirho.metaKey ||
			eventChirho.ctrlKey ||
			eventChirho.shiftKey ||
			eventChirho.altKey
		)
			return;
		const targetChirho = eventChirho.target;
		if (!(targetChirho instanceof Element)) return;
		const linkChirho = targetChirho.closest<HTMLAnchorElement>('a[data-word-jump-chirho]');
		if (!linkChirho) return;
		const cardChirho = rootChirho.getElementById(linkChirho.dataset.wordJumpChirho ?? '');
		if (!cardChirho) return;
		eventChirho.preventDefault();
		cardChirho.focus({ preventScroll: true });
		cardChirho.scrollIntoView({
			block: 'center',
			behavior: rootChirho.defaultView?.matchMedia('(prefers-reduced-motion: reduce)').matches
				? 'instant'
				: 'smooth'
		});
	}
	rootChirho.addEventListener('click', jumpChirho, true);
	return () => rootChirho.removeEventListener('click', jumpChirho, true);
}
