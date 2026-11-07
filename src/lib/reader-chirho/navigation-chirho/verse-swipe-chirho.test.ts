// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { expect as expectChirho, test as testChirho } from 'vitest';
import { swipeStepChirho } from './verse-swipe-chirho';

testChirho('a long enough drag steps toward the Next side, mirrored for right-to-left', () => {
	expectChirho(swipeStepChirho(-80, 0, false)).toBe(true);
	expectChirho(swipeStepChirho(80, 0, false)).toBe(false);
	expectChirho(swipeStepChirho(-80, 0, true)).toBe(false);
	expectChirho(swipeStepChirho(80, 0, true)).toBe(true);
});

testChirho('a short slow drag, or no drag, does not step', () => {
	expectChirho(swipeStepChirho(-79, -100, false)).toBeNull();
	expectChirho(swipeStepChirho(0, -2000, false)).toBeNull();
});

testChirho(
	'a quick flick steps after 30% of the distance, only while it keeps its direction',
	() => {
		expectChirho(swipeStepChirho(-24, -800, false)).toBe(true);
		expectChirho(swipeStepChirho(-23, -800, false)).toBeNull();
		expectChirho(swipeStepChirho(-40, 900, false)).toBeNull();
		expectChirho(swipeStepChirho(-40, -799, false)).toBeNull();
	}
);
