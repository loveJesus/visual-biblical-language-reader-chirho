// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// Workflow: local-reader-chirho.md; source words and their cards link in both directions without changing the passage URL.
export function installWordNavigationChirho(
	rootChirho: Document,
	onWordOpenChirho?: (cardIdChirho: string, triggerChirho: HTMLElement) => void
): () => void {
	const tooltipChirho = rootChirho.createElement('span');
	tooltipChirho.id = `word-meaning-${Math.random().toString(36).slice(2)}-chirho`;
	tooltipChirho.className = 'word-meaning-tooltip-chirho';
	tooltipChirho.setAttribute('role', 'tooltip');
	tooltipChirho.dataset.annotationChirho = '';
	tooltipChirho.hidden = true;
	rootChirho.body.appendChild(tooltipChirho);
	let activeChirho: HTMLElement | null = null;
	let pendingChirho: HTMLElement | null = null;
	let previousDescriptionChirho: string | null = null;
	let showTimerChirho: number | undefined;
	let closeTimerChirho: number | undefined;
	function hideChirho(): void {
		rootChirho.defaultView?.clearTimeout(showTimerChirho);
		rootChirho.defaultView?.clearTimeout(closeTimerChirho);
		showTimerChirho = closeTimerChirho = undefined;
		if (activeChirho) {
			if (previousDescriptionChirho)
				activeChirho.setAttribute('aria-describedby', previousDescriptionChirho);
			else activeChirho.removeAttribute('aria-describedby');
		}
		activeChirho = pendingChirho = null;
		previousDescriptionChirho = null;
		tooltipChirho.hidden = true;
	}
	function showChirho(triggerChirho: HTMLElement): void {
		if (!triggerChirho.isConnected || rootChirho.querySelector('dialog[open]')) return;
		const textChirho = triggerChirho.dataset.wordMeaningChirho;
		if (!textChirho) return;
		hideChirho();
		activeChirho = triggerChirho;
		previousDescriptionChirho = triggerChirho.getAttribute('aria-describedby');
		triggerChirho.setAttribute(
			'aria-describedby',
			[previousDescriptionChirho, tooltipChirho.id].filter(Boolean).join(' ')
		);
		tooltipChirho.textContent = textChirho;
		tooltipChirho.lang = triggerChirho.dataset.wordMeaningLanguageChirho ?? '';
		tooltipChirho.hidden = false;
		const rectChirho = triggerChirho.getBoundingClientRect();
		const widthChirho = Math.min(280, rootChirho.documentElement.clientWidth - 24);
		tooltipChirho.style.maxWidth = `${widthChirho}px`;
		const leftChirho = Math.max(
			12,
			Math.min(
				rectChirho.left + (rectChirho.width - tooltipChirho.offsetWidth) / 2,
				rootChirho.documentElement.clientWidth - tooltipChirho.offsetWidth - 12
			)
		);
		const topChirho =
			rectChirho.bottom + 8 + tooltipChirho.offsetHeight >
			rootChirho.documentElement.clientHeight - 12
				? rectChirho.top - tooltipChirho.offsetHeight - 8
				: rectChirho.bottom + 8;
		tooltipChirho.style.left = `${leftChirho}px`;
		tooltipChirho.style.top = `${Math.max(12, topChirho)}px`;
	}
	function hoverChirho(eventChirho: Event): void {
		const targetChirho = eventChirho.target instanceof Element ? eventChirho.target : null;
		const triggerChirho =
			targetChirho?.closest<HTMLElement>('.word-jump-chirho[data-word-jump-chirho]') ?? null;
		if (eventChirho.type === 'keydown' && (eventChirho as KeyboardEvent).key === 'Escape') {
			hideChirho();
			return;
		}
		if (eventChirho.type === 'mouseover' && targetChirho && tooltipChirho.contains(targetChirho)) {
			rootChirho.defaultView?.clearTimeout(closeTimerChirho);
			return;
		}
		if ((eventChirho.type === 'mouseover' || eventChirho.type === 'focusin') && triggerChirho) {
			if (
				eventChirho.type === 'mouseover' &&
				!rootChirho.defaultView?.matchMedia('(hover: hover) and (pointer: fine)').matches
			)
				return;
			if (pendingChirho === triggerChirho || activeChirho === triggerChirho) {
				rootChirho.defaultView?.clearTimeout(closeTimerChirho);
				return;
			}
			hideChirho();
			pendingChirho = triggerChirho;
			showTimerChirho = rootChirho.defaultView?.setTimeout(() => showChirho(triggerChirho), 250);
		} else if (eventChirho.type === 'mouseout' || eventChirho.type === 'focusout') {
			if (!activeChirho && !pendingChirho) return;
			const relatedChirho = (eventChirho as MouseEvent | FocusEvent).relatedTarget;
			if (
				relatedChirho instanceof Node &&
				(triggerChirho?.contains(relatedChirho) ||
					tooltipChirho.contains(relatedChirho) ||
					activeChirho?.contains(relatedChirho))
			)
				return;
			rootChirho.defaultView?.clearTimeout(showTimerChirho);
			pendingChirho = null;
			rootChirho.defaultView?.clearTimeout(closeTimerChirho);
			closeTimerChirho = rootChirho.defaultView?.setTimeout(hideChirho, 160);
		}
	}
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
		hideChirho();
		if (
			onWordOpenChirho &&
			linkChirho.classList.contains('word-jump-chirho') &&
			cardChirho.classList.contains('word-card-chirho')
		) {
			onWordOpenChirho(cardChirho.id, linkChirho);
			return;
		}
		const dialogChirho = linkChirho.closest<HTMLDialogElement>('dialog[open]');
		if (dialogChirho) {
			dialogChirho.close('jump-chirho:' + cardChirho.id);
			return;
		}
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
	function refreshTriggersChirho(): void {
		if (onWordOpenChirho)
			for (const triggerChirho of rootChirho.querySelectorAll<HTMLElement>('.word-jump-chirho'))
				triggerChirho.setAttribute('aria-haspopup', 'dialog');
		if (activeChirho && !activeChirho.isConnected) hideChirho();
	}
	const observerChirho = new MutationObserver(refreshTriggersChirho);
	observerChirho.observe(rootChirho, { subtree: true, childList: true });
	refreshTriggersChirho();
	const eventsChirho = ['mouseover', 'mouseout', 'focusin', 'focusout', 'keydown'];
	for (const eventChirho of eventsChirho) rootChirho.addEventListener(eventChirho, hoverChirho);
	rootChirho.defaultView?.addEventListener('scroll', hideChirho, true);
	rootChirho.defaultView?.addEventListener('resize', hideChirho);
	return () => {
		observerChirho.disconnect();
		hideChirho();
		tooltipChirho.remove();
		rootChirho.removeEventListener('click', jumpChirho, true);
		for (const eventChirho of eventsChirho)
			rootChirho.removeEventListener(eventChirho, hoverChirho);
		rootChirho.defaultView?.removeEventListener('scroll', hideChirho, true);
		rootChirho.defaultView?.removeEventListener('resize', hideChirho);
	};
}
