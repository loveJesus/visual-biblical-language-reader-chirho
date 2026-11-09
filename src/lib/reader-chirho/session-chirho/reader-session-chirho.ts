// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: spec-chirho/workflows-chirho/hosting-chirho/reader-session-chirho.md.
import { openingPassageChirho } from '../navigation-chirho/opening-passage-chirho';

export const WELCOME_REVISION_CHIRHO = 'reader-welcome-v1-chirho';
export const SESSION_KEYS_CHIRHO = {
	today_chirho: 'hinneh-start-today-chirho',
	autoplay_chirho: 'hinneh-autoplay-verse-chirho',
	passage_chirho: 'hinneh-last-passage-chirho',
	welcome_chirho: 'hinneh-welcome-revision-chirho'
} as const;
type StoreChirho = Pick<Storage, 'getItem' | 'setItem'>;
export type OpenReasonChirho =
	'launch-chirho' | 'restore-chirho' | 'navigation-chirho' | 'retry-chirho';

/** Local preferences and finite navigation intents, independent of a deployment/media hash. */
export class ReaderSessionChirho {
	startTodayChirho = true;
	autoplayChirho = true;
	welcomeChirho = false;
	private startedChirho = false;
	private generationChirho = 0;
	private requestedChirho = '';
	private pendingChirho: { generation_chirho: number; passage_chirho: string } | null = null;
	constructor(private storeChirho?: StoreChirho) {
		this.startTodayChirho = this.readChirho(SESSION_KEYS_CHIRHO.today_chirho) !== 'false';
		this.autoplayChirho = this.readChirho(SESSION_KEYS_CHIRHO.autoplay_chirho) !== 'false';
	}
	private readChirho(keyChirho: string): string | null {
		try {
			return this.storeChirho?.getItem(keyChirho) ?? null;
		} catch {
			return null;
		}
	}
	private writeChirho(keyChirho: string, valueChirho: string) {
		try {
			this.storeChirho?.setItem(keyChirho, valueChirho);
		} catch {
			/* Reading remains available without storage. */
		}
	}
	launchChirho(fragmentChirho: string, dateChirho = new Date()) {
		if (this.startedChirho) return null;
		this.startedChirho = true;
		this.welcomeChirho =
			this.readChirho(SESSION_KEYS_CHIRHO.welcome_chirho) !== WELCOME_REVISION_CHIRHO;
		const explicitChirho = fragmentChirho ? openingPassageChirho(fragmentChirho, dateChirho) : null;
		const savedChirho = this.readChirho(SESSION_KEYS_CHIRHO.passage_chirho);
		return (
			explicitChirho ??
			(!this.startTodayChirho && savedChirho
				? openingPassageChirho(`#${savedChirho}`, dateChirho)
				: null) ??
			openingPassageChirho('', dateChirho)
		);
	}
	acknowledgeWelcomeChirho() {
		this.welcomeChirho = false;
		this.cancelAutoplayChirho();
		this.writeChirho(SESSION_KEYS_CHIRHO.welcome_chirho, WELCOME_REVISION_CHIRHO);
	}
	preferencesChirho(todayChirho: boolean, autoplayChirho: boolean) {
		this.startTodayChirho = todayChirho;
		this.autoplayChirho = autoplayChirho;
		this.writeChirho(SESSION_KEYS_CHIRHO.today_chirho, String(todayChirho));
		this.writeChirho(SESSION_KEYS_CHIRHO.autoplay_chirho, String(autoplayChirho));
		if (!autoplayChirho) this.cancelAutoplayChirho();
	}
	rememberChirho(passageChirho: string) {
		if (openingPassageChirho(`#${passageChirho}`))
			this.writeChirho(SESSION_KEYS_CHIRHO.passage_chirho, passageChirho);
	}
	beginChirho(passageChirho: string, reasonChirho: OpenReasonChirho) {
		const generationChirho = ++this.generationChirho;
		this.pendingChirho =
			this.startedChirho &&
			this.autoplayChirho &&
			!this.welcomeChirho &&
			reasonChirho === 'navigation-chirho' &&
			passageChirho !== this.requestedChirho
				? { generation_chirho: generationChirho, passage_chirho: passageChirho }
				: null;
		this.requestedChirho = passageChirho;
		return generationChirho;
	}
	consumeAutoplayChirho(generationChirho: number, passageChirho: string) {
		if (
			!this.pendingChirho ||
			this.pendingChirho.generation_chirho !== generationChirho ||
			this.pendingChirho.passage_chirho !== passageChirho
		)
			return false;
		this.pendingChirho = null;
		return this.autoplayChirho && !this.welcomeChirho;
	}
	cancelAutoplayChirho() {
		this.pendingChirho = null;
	}
}
