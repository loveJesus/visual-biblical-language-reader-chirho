// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: verse-media-chirho.md. Swiping the reader turns verses exactly like Previous/Next, as on Android
// (apps-chirho/android-chirho/.../uichirho/VerseSwipeChirho.kt); the buttons stay for everyone.

/** CSS pixels to drag before letting go steps, as Android's 80 dp. */
export const SWIPE_DISTANCE_CHIRHO = 80;
/** A flick this fast (px/s) steps after a shorter drag that keeps its direction. */
export const SWIPE_FLING_CHIRHO = 800;
const FLICK_SHARE_CHIRHO = 0.3;
const FOLLOW_CHIRHO = 0.5;
const RESIST_CHIRHO = 0.15;
/** A touch starting this close to a screen edge belongs to the browser's own back/forward gesture. */
const EDGE_CHIRHO = 24;
/** Movement before the gesture is judged horizontal or vertical. */
const SLOP_CHIRHO = 10;
/** How long after a swipe the lifted finger's compatibility click can still arrive. */
export const CLICK_GUARD_MS_CHIRHO = 400;
/** That click lands where the finger lifted; anything farther away is a different tap. */
const CLICK_RADIUS_CHIRHO = 30;
/** Fallback for the spring back when transitionend never fires (hidden tab, reduced effects). */
const SETTLE_MS_CHIRHO = 260;

/**
 * Which way a finished horizontal swipe steps: true for the next verse, false for the previous one, null for
 * none. The next verse comes in from the Next button's side, so in a left-to-right layout a leftward swipe
 * steps forward, and a right-to-left layout flips it. A long enough drag steps, and so does a quick flick that
 * keeps going the way the finger was already moving.
 */
export function swipeStepChirho(
	dragPxChirho: number,
	velocityPxChirho: number,
	rtlChirho: boolean,
	distancePxChirho = SWIPE_DISTANCE_CHIRHO,
	flingPxChirho = SWIPE_FLING_CHIRHO
): boolean | null {
	if (dragPxChirho === 0) return null;
	const farChirho = Math.abs(dragPxChirho) >= distancePxChirho;
	const flickChirho =
		Math.abs(velocityPxChirho) >= flingPxChirho &&
		Math.sign(velocityPxChirho) === Math.sign(dragPxChirho) &&
		Math.abs(dragPxChirho) >= distancePxChirho * FLICK_SHARE_CHIRHO;
	if (!farChirho && !flickChirho) return null;
	return rtlChirho ? dragPxChirho > 0 : dragPxChirho < 0;
}

export interface VerseSwipeOptionsChirho {
	/** Whether a step that way is possible now (the same rule that enables Previous/Next). */
	canStepChirho: (nextChirho: boolean) => boolean;
	onStepChirho: (nextChirho: boolean) => void;
}

interface GestureChirho {
	idChirho: number;
	startXChirho: number;
	startYChirho: number;
	axisChirho: 'none' | 'horizontal' | 'vertical';
	samplesChirho: { xChirho: number; tChirho: number }[];
}

/**
 * Svelte action for the reader. One tracked finger only, with passive listeners and no touch-action change, so
 * vertical scrolling, pinch zoom and taps keep working; mouse and pen drags are left to text selection. While
 * the drag is clearly horizontal the reader follows the finger a little (less where no verse lies that way) and
 * springs back. Any interruption (a second finger, cancel, a new touch, destroy) clears the transform, so fixed
 * popups keep the viewport as their frame and no gesture can strand or erase another's offset.
 */
export function verseSwipeChirho(nodeChirho: HTMLElement, initialChirho: VerseSwipeOptionsChirho) {
	let optionsChirho = initialChirho;
	let gestureChirho: GestureChirho | null = null;
	let settleTimerChirho: ReturnType<typeof setTimeout> | null = null;
	let settleEndChirho: (() => void) | null = null;
	let guardChirho: {
		clickChirho: (eventChirho: MouseEvent) => void;
		timerChirho: ReturnType<typeof setTimeout>;
	} | null = null;
	const rtlChirho = () => getComputedStyle(nodeChirho).direction === 'rtl';
	const stillChirho = () =>
		typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
	const nextForChirho = (dragChirho: number) => (rtlChirho() ? dragChirho > 0 : dragChirho < 0);
	const trackedChirho = (listChirho: TouchList, idChirho: number) =>
		Array.from(listChirho).find((touchChirho) => touchChirho.identifier === idChirho);

	function clearSettleChirho() {
		if (settleTimerChirho !== null) clearTimeout(settleTimerChirho);
		settleTimerChirho = null;
		if (settleEndChirho) nodeChirho.removeEventListener('transitionend', settleEndChirho);
		settleEndChirho = null;
	}
	function clearTransformChirho() {
		clearSettleChirho();
		nodeChirho.style.transition = '';
		nodeChirho.style.transform = '';
	}
	/** Spring back; only this settle's own callbacks may finish it, and a new gesture retires them first. */
	function settleChirho() {
		clearSettleChirho();
		if (!nodeChirho.style.transform) return;
		nodeChirho.style.transition = 'transform 180ms ease-out';
		nodeChirho.style.transform = 'translateX(0px)';
		settleEndChirho = clearTransformChirho;
		nodeChirho.addEventListener('transitionend', settleEndChirho, { once: true });
		settleTimerChirho = setTimeout(clearTransformChirho, SETTLE_MS_CHIRHO);
	}
	function dropGuardChirho() {
		if (!guardChirho) return;
		window.removeEventListener('click', guardChirho.clickChirho, { capture: true });
		clearTimeout(guardChirho.timerChirho);
		guardChirho = null;
	}
	/** Swallow only the compatibility click of the finger that ended this swipe. */
	function armGuardChirho(xChirho: number, yChirho: number) {
		dropGuardChirho();
		const clickChirho = (eventChirho: MouseEvent) => {
			if (
				eventChirho.detail === 0 ||
				!(eventChirho.target instanceof Node) ||
				!nodeChirho.contains(eventChirho.target) ||
				Math.abs(eventChirho.clientX - xChirho) > CLICK_RADIUS_CHIRHO ||
				Math.abs(eventChirho.clientY - yChirho) > CLICK_RADIUS_CHIRHO
			)
				return;
			eventChirho.preventDefault();
			eventChirho.stopPropagation();
			dropGuardChirho();
		};
		window.addEventListener('click', clickChirho, { capture: true });
		guardChirho = { clickChirho, timerChirho: setTimeout(dropGuardChirho, CLICK_GUARD_MS_CHIRHO) };
	}
	function abandonChirho() {
		gestureChirho = null;
		settleChirho();
	}

	function startChirho(eventChirho: TouchEvent) {
		// Every new touch is a fresh, deliberate gesture: no earlier offset, settle or click guard survives it.
		gestureChirho = null;
		clearTransformChirho();
		dropGuardChirho();
		const touchChirho = eventChirho.touches[0];
		if (
			eventChirho.touches.length !== 1 ||
			!touchChirho ||
			touchChirho.clientX < EDGE_CHIRHO ||
			touchChirho.clientX > window.innerWidth - EDGE_CHIRHO
		)
			return;
		gestureChirho = {
			idChirho: touchChirho.identifier,
			startXChirho: touchChirho.clientX,
			startYChirho: touchChirho.clientY,
			axisChirho: 'none',
			samplesChirho: [{ xChirho: touchChirho.clientX, tChirho: eventChirho.timeStamp }]
		};
	}
	function moveChirho(eventChirho: TouchEvent) {
		const gestureNowChirho = gestureChirho;
		if (!gestureNowChirho) return;
		const touchChirho = trackedChirho(eventChirho.touches, gestureNowChirho.idChirho);
		if (eventChirho.touches.length !== 1 || !touchChirho) {
			abandonChirho();
			return;
		}
		const dxChirho = touchChirho.clientX - gestureNowChirho.startXChirho;
		const dyChirho = touchChirho.clientY - gestureNowChirho.startYChirho;
		if (gestureNowChirho.axisChirho === 'none' && Math.hypot(dxChirho, dyChirho) >= SLOP_CHIRHO)
			gestureNowChirho.axisChirho =
				Math.abs(dxChirho) > Math.abs(dyChirho) * 1.2 ? 'horizontal' : 'vertical';
		if (gestureNowChirho.axisChirho !== 'horizontal') return;
		gestureNowChirho.samplesChirho.push({
			xChirho: touchChirho.clientX,
			tChirho: eventChirho.timeStamp
		});
		while (
			gestureNowChirho.samplesChirho.length > 2 &&
			eventChirho.timeStamp - gestureNowChirho.samplesChirho[0].tChirho > 100
		)
			gestureNowChirho.samplesChirho.shift();
		if (stillChirho()) return;
		const shareChirho = optionsChirho.canStepChirho(nextForChirho(dxChirho))
			? FOLLOW_CHIRHO
			: RESIST_CHIRHO;
		nodeChirho.style.transition = '';
		nodeChirho.style.transform = `translateX(${Math.round(dxChirho * shareChirho)}px)`;
	}
	function endChirho(eventChirho: TouchEvent) {
		const gestureNowChirho = gestureChirho;
		if (!gestureNowChirho) return;
		const touchChirho = trackedChirho(eventChirho.changedTouches, gestureNowChirho.idChirho);
		// Another finger still down, or an end that is not the tracked finger's, is an interrupted gesture.
		if (
			!touchChirho ||
			eventChirho.touches.length > 0 ||
			gestureNowChirho.axisChirho !== 'horizontal'
		) {
			abandonChirho();
			return;
		}
		const dxChirho = touchChirho.clientX - gestureNowChirho.startXChirho;
		const firstChirho = gestureNowChirho.samplesChirho[0];
		const secondsChirho = (eventChirho.timeStamp - firstChirho.tChirho) / 1000;
		const velocityChirho =
			secondsChirho > 0 ? (touchChirho.clientX - firstChirho.xChirho) / secondsChirho : 0;
		abandonChirho();
		armGuardChirho(touchChirho.clientX, touchChirho.clientY);
		const stepChirho = swipeStepChirho(dxChirho, velocityChirho, rtlChirho());
		if (stepChirho !== null && optionsChirho.canStepChirho(stepChirho))
			optionsChirho.onStepChirho(stepChirho);
	}

	nodeChirho.addEventListener('touchstart', startChirho, { passive: true });
	nodeChirho.addEventListener('touchmove', moveChirho, { passive: true });
	nodeChirho.addEventListener('touchend', endChirho, { passive: true });
	nodeChirho.addEventListener('touchcancel', abandonChirho, { passive: true });
	return {
		update(nextOptionsChirho: VerseSwipeOptionsChirho) {
			optionsChirho = nextOptionsChirho;
		},
		destroy() {
			nodeChirho.removeEventListener('touchstart', startChirho);
			nodeChirho.removeEventListener('touchmove', moveChirho);
			nodeChirho.removeEventListener('touchend', endChirho);
			nodeChirho.removeEventListener('touchcancel', abandonChirho);
			gestureChirho = null;
			dropGuardChirho();
			clearTransformChirho();
		}
	};
}
