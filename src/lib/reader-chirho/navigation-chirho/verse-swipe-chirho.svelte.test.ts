// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import {
	afterEach as afterEachChirho,
	expect as expectChirho,
	test as testChirho,
	vi as viChirho
} from 'vitest';
import { CLICK_GUARD_MS_CHIRHO, verseSwipeChirho } from './verse-swipe-chirho';

let cleanupChirho: (() => void) | undefined;
afterEachChirho(() => {
	cleanupChirho?.();
	cleanupChirho = undefined;
});

function readerChirho(canStepChirho: (nextChirho: boolean) => boolean = () => true) {
	const nodeChirho = document.createElement('div');
	nodeChirho.style.cssText = 'width: 100%; height: 400px;';
	nodeChirho.innerHTML = '<button type="button">word</button>';
	const outsideChirho = document.createElement('button');
	document.body.appendChild(nodeChirho);
	document.body.appendChild(outsideChirho);
	const stepsChirho: boolean[] = [];
	const actionChirho = verseSwipeChirho(nodeChirho, {
		canStepChirho,
		onStepChirho: (nextChirho) => stepsChirho.push(nextChirho)
	});
	let destroyedChirho = false;
	const destroyChirho = () => {
		if (!destroyedChirho) actionChirho.destroy();
		destroyedChirho = true;
	};
	cleanupChirho = () => {
		destroyChirho();
		nodeChirho.remove();
		outsideChirho.remove();
	};
	const wordChirho = nodeChirho.querySelector('button')!;
	const tappedChirho = viChirho.fn();
	wordChirho.addEventListener('click', tappedChirho);
	outsideChirho.addEventListener('click', tappedChirho);
	return { nodeChirho, stepsChirho, wordChirho, outsideChirho, tappedChirho, destroyChirho };
}

type PointChirho = [number, number];
const touchChirho = (targetChirho: Element, [xChirho, yChirho]: PointChirho, idChirho = 1) =>
	new Touch({ identifier: idChirho, target: targetChirho, clientX: xChirho, clientY: yChirho });
function fireChirho(
	targetChirho: Element,
	typeChirho: string,
	touchesChirho: Touch[],
	changedChirho: Touch[] = touchesChirho
) {
	targetChirho.dispatchEvent(
		new TouchEvent(typeChirho, {
			touches: touchesChirho,
			changedTouches: changedChirho,
			bubbles: true
		})
	);
}
/** One finger moving through points and lifting at the last one. */
function dragChirho(targetChirho: Element, pathChirho: PointChirho[]) {
	fireChirho(targetChirho, 'touchstart', [touchChirho(targetChirho, pathChirho[0])]);
	for (const pointChirho of pathChirho.slice(1))
		fireChirho(targetChirho, 'touchmove', [touchChirho(targetChirho, pointChirho)]);
	fireChirho(targetChirho, 'touchend', [], [touchChirho(targetChirho, pathChirho.at(-1)!)]);
}
/** The mouse-compatibility click a browser sends at a point (detail 1), or a keyboard activation (detail 0). */
function clickAtChirho(targetChirho: Element, [xChirho, yChirho]: PointChirho, detailChirho = 1) {
	targetChirho.dispatchEvent(
		new MouseEvent('click', {
			bubbles: true,
			cancelable: true,
			detail: detailChirho,
			clientX: xChirho,
			clientY: yChirho
		})
	);
}
const waitChirho = (millisecondsChirho: number) =>
	new Promise((resolveChirho) => setTimeout(resolveChirho, millisecondsChirho));
const middleChirho = () => Math.round(window.innerWidth / 2);
const leftSwipeChirho = (): PointChirho[] => {
	const xChirho = middleChirho();
	return [
		[xChirho, 200],
		[xChirho - 50, 201],
		[xChirho - 100, 202]
	];
};

testChirho('a leftward drag steps to the next verse and a rightward one to the previous', () => {
	const { wordChirho, stepsChirho } = readerChirho();
	const xChirho = middleChirho();
	dragChirho(wordChirho, leftSwipeChirho());
	dragChirho(wordChirho, [
		[xChirho - 100, 200],
		[xChirho - 40, 201],
		[xChirho + 10, 202]
	]);
	expectChirho(stepsChirho).toEqual([true, false]);
});

testChirho('vertical scrolling, an edge start and a two-finger pinch never step', () => {
	const { nodeChirho, stepsChirho } = readerChirho();
	const xChirho = middleChirho();
	dragChirho(nodeChirho, [
		[xChirho, 300],
		[xChirho - 20, 240],
		[xChirho - 60, 120]
	]);
	dragChirho(nodeChirho, [
		[10, 200],
		[60, 200],
		[150, 200]
	]);
	const pairChirho = (offsetChirho: number) => [
		touchChirho(nodeChirho, [xChirho - offsetChirho, 200], 1),
		touchChirho(nodeChirho, [xChirho - offsetChirho + 60, 200], 2)
	];
	fireChirho(nodeChirho, 'touchstart', pairChirho(0));
	fireChirho(nodeChirho, 'touchmove', pairChirho(100));
	fireChirho(nodeChirho, 'touchend', [], pairChirho(100));
	expectChirho(stepsChirho).toEqual([]);
	expectChirho(nodeChirho.style.transform).toBe('');
});

testChirho('where no verse lies that way the reader only resists, and nothing steps', () => {
	const { nodeChirho, stepsChirho } = readerChirho((nextChirho) => !nextChirho);
	const [startChirho, , endChirho] = leftSwipeChirho();
	fireChirho(nodeChirho, 'touchstart', [touchChirho(nodeChirho, startChirho)]);
	fireChirho(nodeChirho, 'touchmove', [touchChirho(nodeChirho, endChirho)]);
	expectChirho(nodeChirho.style.transform).toBe('translateX(-15px)');
	fireChirho(nodeChirho, 'touchend', [], [touchChirho(nodeChirho, endChirho)]);
	expectChirho(stepsChirho).toEqual([]);
});

testChirho(
	'a second finger after a horizontal drag clears the follow at once, and nothing steps',
	async () => {
		const { nodeChirho, stepsChirho } = readerChirho();
		const [startChirho, , endChirho] = leftSwipeChirho();
		fireChirho(nodeChirho, 'touchstart', [touchChirho(nodeChirho, startChirho)]);
		fireChirho(nodeChirho, 'touchmove', [touchChirho(nodeChirho, endChirho)]);
		expectChirho(nodeChirho.style.transform).toBe('translateX(-50px)');
		const bothChirho = [
			touchChirho(nodeChirho, endChirho, 1),
			touchChirho(nodeChirho, [endChirho[0] + 60, 200], 2)
		];
		fireChirho(nodeChirho, 'touchstart', bothChirho);
		expectChirho(nodeChirho.style.transform).toBe('');
		fireChirho(nodeChirho, 'touchend', [], bothChirho);
		await waitChirho(350);
		expectChirho(nodeChirho.style.transform).toBe('');
		expectChirho(stepsChirho).toEqual([]);
	}
);

testChirho(
	'a cancelled, interrupted or foreign-finger ending, or destroy, leaves no transform',
	async () => {
		const { nodeChirho, stepsChirho, destroyChirho } = readerChirho();
		const [startChirho, , endChirho] = leftSwipeChirho();
		const beginChirho = () => {
			fireChirho(nodeChirho, 'touchstart', [touchChirho(nodeChirho, startChirho)]);
			fireChirho(nodeChirho, 'touchmove', [touchChirho(nodeChirho, endChirho)]);
			expectChirho(nodeChirho.style.transform).not.toBe('');
		};
		beginChirho();
		fireChirho(nodeChirho, 'touchcancel', []);
		await waitChirho(300);
		expectChirho(nodeChirho.style.transform).toBe('');
		beginChirho();
		fireChirho(nodeChirho, 'touchend', [], [touchChirho(nodeChirho, endChirho, 7)]);
		await waitChirho(300);
		expectChirho(nodeChirho.style.transform).toBe('');
		beginChirho();
		fireChirho(nodeChirho, 'touchend', [], []);
		await waitChirho(300);
		expectChirho(nodeChirho.style.transform).toBe('');
		beginChirho();
		destroyChirho();
		expectChirho(nodeChirho.style.transform).toBe('');
		expectChirho(stepsChirho).toEqual([]);
	}
);

testChirho(
	"a quick second swipe keeps its own follow while the first one's settle would have finished",
	async () => {
		const { nodeChirho, stepsChirho } = readerChirho();
		const pathChirho = leftSwipeChirho();
		dragChirho(nodeChirho, pathChirho);
		fireChirho(nodeChirho, 'touchstart', [touchChirho(nodeChirho, pathChirho[0])]);
		fireChirho(nodeChirho, 'touchmove', [touchChirho(nodeChirho, pathChirho[2])]);
		await waitChirho(350);
		expectChirho(nodeChirho.style.transform).toBe('translateX(-50px)');
		fireChirho(nodeChirho, 'touchend', [], [touchChirho(nodeChirho, pathChirho[2])]);
		await waitChirho(350);
		expectChirho(nodeChirho.style.transform).toBe('');
		expectChirho(stepsChirho).toEqual([true, true]);
	}
);

testChirho(
	"only the lifted finger's own compatibility click is swallowed; keyboard, other places and new taps are not",
	async () => {
		const { wordChirho, outsideChirho, tappedChirho } = readerChirho();
		const pathChirho = leftSwipeChirho();
		const liftChirho = pathChirho.at(-1)!;
		dragChirho(wordChirho, pathChirho);
		clickAtChirho(wordChirho, liftChirho, 0);
		expectChirho(tappedChirho).toHaveBeenCalledTimes(1);
		clickAtChirho(outsideChirho, liftChirho);
		expectChirho(tappedChirho).toHaveBeenCalledTimes(2);
		clickAtChirho(wordChirho, [liftChirho[0] + 80, liftChirho[1]]);
		expectChirho(tappedChirho).toHaveBeenCalledTimes(3);
		clickAtChirho(wordChirho, liftChirho);
		expectChirho(tappedChirho).toHaveBeenCalledTimes(3);
		dragChirho(wordChirho, pathChirho);
		fireChirho(wordChirho, 'touchstart', [touchChirho(wordChirho, liftChirho, 2)]);
		fireChirho(wordChirho, 'touchend', [], [touchChirho(wordChirho, liftChirho, 2)]);
		clickAtChirho(wordChirho, liftChirho);
		expectChirho(tappedChirho).toHaveBeenCalledTimes(4);
		dragChirho(wordChirho, pathChirho);
		await waitChirho(CLICK_GUARD_MS_CHIRHO + 100);
		clickAtChirho(wordChirho, liftChirho);
		expectChirho(tappedChirho).toHaveBeenCalledTimes(5);
	}
);

testChirho('destroy removes a pending click guard', () => {
	const { wordChirho, tappedChirho, destroyChirho } = readerChirho();
	const pathChirho = leftSwipeChirho();
	dragChirho(wordChirho, pathChirho);
	destroyChirho();
	clickAtChirho(wordChirho, pathChirho.at(-1)!);
	expectChirho(tappedChirho).toHaveBeenCalledTimes(1);
});
