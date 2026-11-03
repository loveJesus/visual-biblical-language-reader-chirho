// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// Shared by the hydrated reader and standalone export; no runtime imports or hidden closures.
export function installHelpChirho(rootChirho: Document): () => void {
	let activeChirho: HTMLElement | null = null;
	let pinnedChirho = false;
	let closeTimerChirho: number | undefined;
	const titlesChirho = [
		...rootChirho.querySelectorAll<HTMLElement>('[data-help-trigger-chirho][title]')
	].map((triggerChirho) => ({
		trigger_chirho: triggerChirho,
		title_chirho: triggerChirho.getAttribute('title') ?? ''
	}));
	for (const titleChirho of titlesChirho) {
		titleChirho.trigger_chirho.dataset.helpFallbackTitleChirho = titleChirho.title_chirho;
		titleChirho.trigger_chirho.removeAttribute('title');
	}
	function cancelCloseChirho(): void {
		rootChirho.defaultView?.clearTimeout(closeTimerChirho);
		closeTimerChirho = undefined;
	}
	function popupChirho(): HTMLElement | null {
		return rootChirho.getElementById(activeChirho?.getAttribute('aria-describedby') ?? '');
	}
	function closeChirho(): void {
		cancelCloseChirho();
		const helpChirho = popupChirho();
		if (helpChirho) helpChirho.hidden = true;
		activeChirho?.setAttribute('aria-expanded', 'false');
		activeChirho = null;
		pinnedChirho = false;
	}
	function containsChirho(nodeChirho: EventTarget | null): boolean {
		return (
			nodeChirho instanceof Node &&
			Boolean(activeChirho?.contains(nodeChirho) || popupChirho()?.contains(nodeChirho))
		);
	}
	function scheduleCloseChirho(): void {
		if (!pinnedChirho && rootChirho.activeElement !== activeChirho) {
			cancelCloseChirho();
			closeTimerChirho = rootChirho.defaultView?.setTimeout(closeChirho, 160);
		}
	}
	function positionChirho(triggerChirho: HTMLElement): void {
		const helpChirho = rootChirho.getElementById(
			triggerChirho.getAttribute('aria-describedby') ?? ''
		);
		if (!helpChirho) return;
		const rectChirho = triggerChirho.getBoundingClientRect();
		const widthChirho = Math.min(310, rootChirho.documentElement.clientWidth - 24);
		helpChirho.style.width = `${widthChirho}px`;
		helpChirho.style.left = `${Math.max(12, Math.min(rectChirho.left, rootChirho.documentElement.clientWidth - widthChirho - 12))}px`;
		helpChirho.style.top = `${Math.max(12, Math.min(rectChirho.bottom + 8, rootChirho.documentElement.clientHeight - helpChirho.offsetHeight - 12))}px`;
	}
	function showChirho(triggerChirho: HTMLElement): void {
		if (activeChirho !== triggerChirho) closeChirho();
		cancelCloseChirho();
		activeChirho = triggerChirho;
		const helpChirho = popupChirho();
		if (!helpChirho) return;
		helpChirho.hidden = false;
		triggerChirho.setAttribute('aria-expanded', 'true');
		positionChirho(triggerChirho);
	}
	function handleChirho(eventChirho: Event): void {
		const targetChirho = eventChirho.target instanceof Element ? eventChirho.target : null;
		const triggerChirho = targetChirho?.closest<HTMLElement>('[data-help-trigger-chirho]') ?? null;
		if (eventChirho.type === 'keydown' && (eventChirho as KeyboardEvent).key === 'Escape') {
			closeChirho();
			return;
		}
		if (eventChirho.type === 'click') {
			if (!triggerChirho) {
				if (!containsChirho(targetChirho)) closeChirho();
				return;
			}
			if (activeChirho === triggerChirho && pinnedChirho) closeChirho();
			else {
				showChirho(triggerChirho);
				pinnedChirho = true;
			}
			return;
		}
		if (triggerChirho && ['mouseover', 'focusin'].includes(eventChirho.type))
			showChirho(triggerChirho);
		else if (eventChirho.type === 'mouseover' && containsChirho(targetChirho)) cancelCloseChirho();
		if (
			eventChirho.type === 'focusout' &&
			!containsChirho((eventChirho as FocusEvent).relatedTarget)
		)
			closeChirho();
		if (eventChirho.type === 'mouseout') {
			if (containsChirho((eventChirho as MouseEvent).relatedTarget)) cancelCloseChirho();
			else scheduleCloseChirho();
		}
	}
	const eventsChirho = ['mouseover', 'mouseout', 'focusin', 'focusout', 'click', 'keydown'];
	function repositionChirho(): void {
		if (!activeChirho) return;
		const rectChirho = activeChirho.getBoundingClientRect();
		if (rectChirho.bottom <= 0 || rectChirho.top >= rootChirho.documentElement.clientHeight)
			closeChirho();
		else positionChirho(activeChirho);
	}
	for (const eventChirho of eventsChirho) rootChirho.addEventListener(eventChirho, handleChirho);
	rootChirho.defaultView?.addEventListener('resize', repositionChirho);
	rootChirho.defaultView?.addEventListener('scroll', repositionChirho, true);
	return () => {
		closeChirho();
		for (const eventChirho of eventsChirho)
			rootChirho.removeEventListener(eventChirho, handleChirho);
		rootChirho.defaultView?.removeEventListener('resize', repositionChirho);
		rootChirho.defaultView?.removeEventListener('scroll', repositionChirho, true);
		for (const titleChirho of titlesChirho) {
			titleChirho.trigger_chirho.setAttribute('title', titleChirho.title_chirho);
			delete titleChirho.trigger_chirho.dataset.helpFallbackTitleChirho;
		}
	};
}
