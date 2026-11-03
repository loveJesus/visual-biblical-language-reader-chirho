// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import configurationChirho from '../../../config-chirho/artifact-flags-chirho.json';
interface TurnstileChirho {
	render(
		elementChirho: HTMLElement,
		optionsChirho: {
			sitekey: string;
			action: string;
			language: string;
			size: string;
			callback: (tokenChirho: string) => void;
			'expired-callback': () => void;
			'error-callback': () => void;
		}
	): string;
	remove(idChirho: string): void;
}
let loadedChirho: Promise<TurnstileChirho> | null = null;
function loadChirho(): Promise<TurnstileChirho> {
	if (loadedChirho) return loadedChirho;
	loadedChirho = new Promise((resolveChirho, rejectChirho) => {
		const scriptChirho = document.createElement('script');
		scriptChirho.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
		scriptChirho.async = true;
		const timeoutChirho = setTimeout(() => {
			loadedChirho = null;
			rejectChirho(new Error('Verification unavailable'));
		}, 15000);
		scriptChirho.onload = () => {
			clearTimeout(timeoutChirho);
			const apiChirho = (window as unknown as { turnstile?: TurnstileChirho }).turnstile;
			if (apiChirho) resolveChirho(apiChirho);
			else {
				loadedChirho = null;
				rejectChirho(new Error('Verification unavailable'));
			}
		};
		scriptChirho.onerror = () => {
			clearTimeout(timeoutChirho);
			loadedChirho = null;
			scriptChirho.remove();
			rejectChirho(new Error('Verification unavailable'));
		};
		document.head.appendChild(scriptChirho);
	});
	return loadedChirho;
}
export async function challengeChirho(
	elementChirho: HTMLElement,
	localeChirho: string,
	receiveChirho: (tokenChirho: string) => void
) {
	return (await loadChirho()).render(elementChirho, {
		sitekey: configurationChirho.sitekey_chirho,
		action: configurationChirho.action_chirho,
		language: localeChirho,
		size: elementChirho.clientWidth < 300 ? 'compact' : 'flexible',
		callback: receiveChirho,
		'expired-callback': () => receiveChirho(''),
		'error-callback': () => receiveChirho('')
	});
}
export function removeChallengeChirho(idChirho: string | null) {
	if (idChirho) (window as unknown as { turnstile?: TurnstileChirho }).turnstile?.remove(idChirho);
}
