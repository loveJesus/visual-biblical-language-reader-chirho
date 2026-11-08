// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
package us.hinneh.readerchirho.uichirho

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test

/** A swipe steps like the buttons: the next verse comes in from the Next button's side. */
class VerseSwipeTestChirho {
    private fun stepChirho(dragChirho: Float, velocityChirho: Float = 0f, rtlChirho: Boolean = false) =
        swipeStepChirho(dragChirho, velocityChirho, DISTANCE_CHIRHO, FLING_CHIRHO, rtlChirho)

    @Test
    fun aLongDragStepsTowardTheSideItCameFrom() {
        assertEquals(true, stepChirho(-DISTANCE_CHIRHO))
        assertEquals(false, stepChirho(DISTANCE_CHIRHO))
        // A mirrored right-to-left layout puts Next on the left, so the directions swap.
        assertEquals(false, stepChirho(-DISTANCE_CHIRHO, rtlChirho = true))
        assertEquals(true, stepChirho(DISTANCE_CHIRHO, rtlChirho = true))
    }

    @Test
    fun shortDragsOnlyStepWhenFlickedOnwardTheSameWay() {
        assertNull("no movement", stepChirho(0f, velocityChirho = -2 * FLING_CHIRHO))
        assertNull("a slow short drag springs back", stepChirho(-DISTANCE_CHIRHO / 2))
        assertEquals(true, stepChirho(-DISTANCE_CHIRHO / 2, velocityChirho = -FLING_CHIRHO))
        assertNull("a flick back against the drag cancels it", stepChirho(-DISTANCE_CHIRHO / 2, velocityChirho = FLING_CHIRHO))
        assertNull("a tiny jitter is not a flick", stepChirho(-DISTANCE_CHIRHO / 10, velocityChirho = -2 * FLING_CHIRHO))
    }

    private companion object {
        const val DISTANCE_CHIRHO = 200f
        const val FLING_CHIRHO = 2_000f
    }
}
