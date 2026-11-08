// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// Workflow: local-reader-chirho.md; source words and their cards link in both directions without changing the passage URL.
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
		// A folded target (the verse's source notes) opens, so the jump never lands on a closed panel.
		if (cardChirho instanceof HTMLDetailsElement) cardChirho.open = true;
		cardChirho.focus({ preventScroll: true });
		cardChirho.scrollIntoView({
			block: cardChirho.classList.contains('word-card-chirho') ? 'start' : 'center',
			behavior: rootChirho.defaultView?.matchMedia('(prefers-reduced-motion: reduce)').matches
				? 'instant'
				: 'smooth'
		});
	}
	rootChirho.addEventListener('click', jumpChirho, true);
	return () => rootChirho.removeEventListener('click', jumpChirho, true);
}
