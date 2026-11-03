// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: local-reader-chirho.md. Exact rejected audio cannot regain playback through a label change.
import reviewsChirho from './audio-reviews-chirho.json';

export const rejectedAudioChirho = reviewsChirho.decisions_chirho.filter(
	(decisionChirho) => decisionChirho.decision_chirho === 'rejected_pronunciation'
);
const rejectedHashesChirho = new Set(
	rejectedAudioChirho.map((rowChirho) => rowChirho.sha256_chirho)
);
export const isRejectedAudioChirho = (sha256Chirho: unknown): boolean =>
	typeof sha256Chirho === 'string' && rejectedHashesChirho.has(sha256Chirho);
