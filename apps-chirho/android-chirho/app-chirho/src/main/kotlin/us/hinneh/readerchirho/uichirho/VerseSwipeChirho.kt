// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
package us.hinneh.readerchirho.uichirho

import androidx.compose.animation.core.animate
import androidx.compose.animation.core.spring
import androidx.compose.foundation.gestures.DraggableState
import androidx.compose.foundation.gestures.Orientation
import androidx.compose.foundation.gestures.draggable
import androidx.compose.runtime.Composable
import androidx.compose.runtime.Stable
import androidx.compose.runtime.State
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberUpdatedState
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.hapticfeedback.HapticFeedback
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.ui.unit.dp
import kotlin.math.abs
import kotlin.math.sign

/**
 * Which way a finished horizontal swipe steps: true for the next verse, false for the previous one, null for none.
 * The next verse comes in from the Next button's side, so in a left-to-right layout a leftward swipe steps forward
 * and a mirrored right-to-left layout flips it. A long enough drag steps, and so does a quick flick that keeps going
 * the way the finger was already moving.
 */
fun swipeStepChirho(
    dragPxChirho: Float,
    velocityPxChirho: Float,
    distancePxChirho: Float,
    flingPxChirho: Float,
    rtlChirho: Boolean,
): Boolean? {
    if (dragPxChirho == 0f) return null
    val farChirho = abs(dragPxChirho) >= distancePxChirho
    val flickChirho = abs(velocityPxChirho) >= flingPxChirho &&
        sign(velocityPxChirho) == sign(dragPxChirho) &&
        abs(dragPxChirho) >= distancePxChirho * FLICK_SHARE_CHIRHO
    if (!farChirho && !flickChirho) return null
    return if (rtlChirho) dragPxChirho > 0f else dragPxChirho < 0f
}

/**
 * Swiping the reader page turns verses exactly like the Previous/Next buttons, which stay for everyone. The page
 * follows the finger a little (less where there is no verse to go to) and springs back; a light haptic marks the
 * point where letting go will step. Remember it with [rememberVerseSwipeChirho] and attach it with [verseSwipeChirho].
 */
@Stable
class VerseSwipeChirho internal constructor(
    private val distancePxChirho: Float,
    private val flingPxChirho: Float,
    private val rtlChirho: Boolean,
    private val hapticsChirho: HapticFeedback,
    private val canStepChirho: State<(Boolean) -> Boolean>,
    private val onStepChirho: State<(Boolean) -> Unit>,
) {
    private var dragChirho = 0f

    /** How far the page is drawn aside while the finger moves; layout never changes. */
    var offsetChirho by mutableFloatStateOf(0f)
        private set

    internal val draggableChirho = DraggableState { deltaChirho ->
        val wasArmedChirho = abs(dragChirho) >= distancePxChirho
        dragChirho += deltaChirho
        val openChirho = canStepChirho.value(if (rtlChirho) dragChirho > 0f else dragChirho < 0f)
        if (openChirho && !wasArmedChirho && abs(dragChirho) >= distancePxChirho) {
            hapticsChirho.performHapticFeedback(HapticFeedbackType.GestureThresholdActivate)
        }
        offsetChirho = dragChirho * if (openChirho) FOLLOW_CHIRHO else RESIST_CHIRHO
    }

    internal fun startChirho() {
        dragChirho = 0f
    }

    internal suspend fun stopChirho(velocityPxChirho: Float) {
        swipeStepChirho(dragChirho, velocityPxChirho, distancePxChirho, flingPxChirho, rtlChirho)
            ?.takeIf { canStepChirho.value(it) }
            ?.let { onStepChirho.value(it) }
        dragChirho = 0f
        animate(offsetChirho, 0f, animationSpec = spring()) { valueChirho, _ -> offsetChirho = valueChirho }
    }
}

@Composable
fun rememberVerseSwipeChirho(canStepChirho: (Boolean) -> Boolean, onStepChirho: (Boolean) -> Unit): VerseSwipeChirho {
    val densityChirho = LocalDensity.current
    val rtlChirho = LocalLayoutDirection.current == LayoutDirection.Rtl
    val hapticsChirho = LocalHapticFeedback.current
    val canStepNowChirho = rememberUpdatedState(canStepChirho)
    val onStepNowChirho = rememberUpdatedState(onStepChirho)
    val distancePxChirho = with(densityChirho) { SWIPE_DISTANCE_CHIRHO.toPx() }
    val flingPxChirho = with(densityChirho) { SWIPE_FLING_CHIRHO.toPx() }
    return remember(distancePxChirho, flingPxChirho, rtlChirho, hapticsChirho) {
        VerseSwipeChirho(distancePxChirho, flingPxChirho, rtlChirho, hapticsChirho, canStepNowChirho, onStepNowChirho)
    }
}

/** Horizontal drags only; vertical scrolling, word taps and Android's edge Back gesture keep working. */
fun Modifier.verseSwipeChirho(swipeChirho: VerseSwipeChirho): Modifier =
    draggable(
        state = swipeChirho.draggableChirho,
        orientation = Orientation.Horizontal,
        onDragStarted = { swipeChirho.startChirho() },
        onDragStopped = { swipeChirho.stopChirho(it) },
    ).graphicsLayer { translationX = swipeChirho.offsetChirho }

private val SWIPE_DISTANCE_CHIRHO = 80.dp
private val SWIPE_FLING_CHIRHO = 800.dp // per second
private const val FLICK_SHARE_CHIRHO = 0.3f
private const val FOLLOW_CHIRHO = 0.5f
private const val RESIST_CHIRHO = 0.15f
