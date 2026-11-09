// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
package us.hinneh.readerchirho

import android.content.res.Configuration
import androidx.activity.ComponentActivity
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.size
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Rect
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.semantics.SemanticsActions
import androidx.compose.ui.test.SemanticsMatcher
import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.hasClickAction
import androidx.compose.ui.test.hasContentDescription
import androidx.compose.ui.test.hasText
import androidx.compose.ui.test.isHeading
import androidx.compose.ui.test.junit4.v2.createAndroidComposeRule
import androidx.compose.ui.test.onRoot
import androidx.compose.ui.test.performClick
import androidx.compose.ui.test.performScrollTo
import androidx.compose.ui.test.performSemanticsAction
import androidx.compose.ui.text.TextLayoutResult
import androidx.compose.ui.unit.dp
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import us.hinneh.readerchirho.uichirho.HinnehThemeChirho
import us.hinneh.readerchirho.uichirho.LocalTextScaleChirho
import us.hinneh.readerchirho.uichirho.ProvideTextScaleChirho
import us.hinneh.readerchirho.uichirho.WelcomeChirho
import java.util.Locale

/**
 * Whether any of the text is hidden: an ellipsized line or lines beyond the node's height. A wrapping label cannot run
 * off to the side; it wraps, and the whole-word checks guard where it breaks. TextLayoutResult.hasVisualOverflow and
 * glyph extents measured against the text node both report overflow for labels the device frames show whole: Compose
 * may lay a start- or centre-aligned single line in a paragraph wider than its node (measured at font scale 2.0:
 * "Start reading" one line in a 155 dp node of a 232 dp paragraph; "Watch quick tour ↗" one centred line 13 px past
 * its node), so only what is actually hidden counts.
 */
internal fun TextLayoutResult.cutOffChirho(): Boolean =
    didOverflowHeight || (0 until lineCount).any { isLineEllipsized(it) }

/**
 * The welcome's layout (unit 176, GPT DM #3679): on a narrow phone with Extra large text and at an ordinary width, in
 * English and Spanish, Start reading stays pinned on screen, the quick tour and Info stay beside it, the headline and the
 * real reader example are there to scroll to, and Start reading and Back both leave. Nothing here fetches or plays.
 */
@RunWith(AndroidJUnit4::class)
class WelcomeLayoutTestChirho {
    @get:Rule
    val composeChirho = createAndroidComposeRule<ComponentActivity>()

    private var startsChirho = 0

    private fun showChirho(
        widthDpChirho: Int,
        heightDpChirho: Int,
        textScaleChirho: Float,
        spanishChirho: Boolean,
        fontScaleChirho: Float = 1f,
    ): Map<String, String> {
        val baseChirho = InstrumentationRegistry.getInstrumentation().targetContext
        val configurationChirho = Configuration(baseChirho.resources.configuration).apply {
            setLocale(Locale.forLanguageTag(if (spanishChirho) "es" else "en"))
            fontScale = fontScaleChirho
        }
        val contextChirho = baseChirho.createConfigurationContext(configurationChirho)
        composeChirho.setContent {
            CompositionLocalProvider(
                LocalContext provides contextChirho,
                LocalConfiguration provides configurationChirho,
                LocalTextScaleChirho provides textScaleChirho,
            ) {
                HinnehThemeChirho {
                    ProvideTextScaleChirho {
                        Box(Modifier.size(widthDpChirho.dp, heightDpChirho.dp)) { WelcomeChirho(spanishChirho, onStartChirho = { startsChirho++ }) }
                    }
                }
            }
        }
        return mapOf(
            "start" to contextChirho.getString(R.string.welcome_start_chirho),
            "tour" to contextChirho.getString(R.string.tour_chirho),
            "info" to contextChirho.getString(R.string.info_link_chirho),
            "title" to contextChirho.getString(R.string.welcome_title_chirho),
            "gloss" to if (spanishChirho) "En principio" else "In the beginning",
            "open" to contextChirho.getString(R.string.welcome_open_chirho),
        )
    }

    /** A label laid out whole: no line is cut off or clipped. */
    private fun assertWholeChirho(textChirho: String) {
        val layoutsChirho = mutableListOf<TextLayoutResult>()
        composeChirho.onNode(hasText(textChirho, substring = true), useUnmergedTree = true)
            .performSemanticsAction(SemanticsActions.GetTextLayoutResult) { it(layoutsChirho) }
        val layoutChirho = layoutsChirho.single()
        assertFalse("\"$textChirho\" is cut off: ${layoutChirho.lineCount} lines in ${layoutChirho.size}", layoutChirho.cutOffChirho())
    }

    /**
     * Root's iOS XXXL lesson (GPT, DM #3692): at double font scale only Start reading stays pinned, whole and on screen,
     * and takes no more than the bottom part of it; the tour, Info and the open-materials line follow the words, each
     * reachable by scrolling and never cut off.
     */
    private fun assertLargeTextChirho(labelsChirho: Map<String, String>) {
        val screenChirho = composeChirho.onRoot().fetchSemanticsNode().boundsInRoot
        val startChirho = hasText(labelsChirho.getValue("start")) and hasClickAction()
        composeChirho.onNode(startChirho).assertIsDisplayed()
        val startBoundsChirho = boundsChirho(startChirho)
        assertTrue("$startBoundsChirho is inside $screenChirho", startBoundsChirho.bottom <= screenChirho.bottom)
        assertTrue("the pinned bar leaves most of the screen to the words", startBoundsChirho.top >= screenChirho.top + screenChirho.height * 0.6f)
        assertWholeChirho(labelsChirho.getValue("start"))
        for (matcherChirho in listOf(
            hasText(labelsChirho.getValue("tour"), substring = true) and hasClickAction(),
            hasContentDescription(labelsChirho.getValue("info")) and hasClickAction(),
            hasText(labelsChirho.getValue("open")),
        )) {
            composeChirho.onNode(matcherChirho).performScrollTo().assertIsDisplayed()
            assertTrue("it scrolls above the pinned Start, not under it", boundsChirho(matcherChirho).bottom <= boundsChirho(startChirho).top)
        }
        assertWholeChirho(labelsChirho.getValue("tour"))
        assertWholeChirho(labelsChirho.getValue("open"))
    }

    private fun boundsChirho(matcherChirho: SemanticsMatcher): Rect = composeChirho.onNode(matcherChirho).fetchSemanticsNode().boundsInRoot

    /**
     * Start reading and the tour are shown whole inside the screen, Start reading first. Info sits beside the tour when
     * the two fit on one row; otherwise it is the quiet link after the open-materials line (GPT, DM #3702), reached by
     * scrolling and then shown above the pinned bar, never under it.
     */
    private fun assertActionsOnScreenChirho(labelsChirho: Map<String, String>) {
        val screenChirho = composeChirho.onRoot().fetchSemanticsNode().boundsInRoot
        val startChirho = hasText(labelsChirho.getValue("start")) and hasClickAction()
        val tourChirho = hasText(labelsChirho.getValue("tour"), substring = true) and hasClickAction()
        val infoChirho = hasContentDescription(labelsChirho.getValue("info")) and hasClickAction()
        for (matcherChirho in listOf(startChirho, tourChirho)) {
            composeChirho.onNode(matcherChirho).assertIsDisplayed()
            val boundsChirho = boundsChirho(matcherChirho)
            assertTrue("$boundsChirho lies inside $screenChirho", boundsChirho.top >= screenChirho.top && boundsChirho.bottom <= screenChirho.bottom)
            assertTrue("$boundsChirho lies inside $screenChirho", boundsChirho.left >= screenChirho.left && boundsChirho.right <= screenChirho.right)
        }
        assertTrue("Start reading comes first", boundsChirho(startChirho).bottom <= boundsChirho(tourChirho).top)
        if (boundsChirho(infoChirho).top >= boundsChirho(startChirho).bottom) {
            composeChirho.onNode(infoChirho).assertIsDisplayed()
        } else {
            composeChirho.onNode(infoChirho).performScrollTo().assertIsDisplayed()
            assertTrue("Info scrolls above the bar, not under it", boundsChirho(infoChirho).bottom <= boundsChirho(startChirho).top)
        }
        composeChirho.onNode(hasText(labelsChirho.getValue("title")) and isHeading()).assertExists()
        composeChirho.onNode(hasText(labelsChirho.getValue("gloss"))).assertExists()
    }

    @Test
    fun aNarrowPhoneWithExtraLargeSpanishKeepsStartReadingOnScreen() {
        val labelsChirho = showChirho(320, 560, 1.15f, spanishChirho = true)
        assertActionsOnScreenChirho(labelsChirho)
        composeChirho.onNode(hasText(labelsChirho.getValue("start")) and hasClickAction()).performClick()
        assertEquals(1, startsChirho)
    }

    @Test
    fun aNarrowPhoneWithExtraLargeEnglishKeepsStartReadingOnScreen() {
        assertActionsOnScreenChirho(showChirho(320, 560, 1.15f, spanishChirho = false))
    }

    @Test
    fun aNarrowPhoneAtDoubleFontScaleKeepsOnlyStartPinnedInEnglish() {
        assertLargeTextChirho(showChirho(320, 700, 0.9f, spanishChirho = false, fontScaleChirho = 2f))
    }

    @Test
    fun aNarrowPhoneAtDoubleFontScaleKeepsOnlyStartPinnedInSpanish() {
        assertLargeTextChirho(showChirho(320, 700, 1.15f, spanishChirho = true, fontScaleChirho = 2f))
    }

    @Test
    fun anOrdinaryPhoneShowsEverythingAndBackStartsReading() {
        assertActionsOnScreenChirho(showChirho(411, 860, 0.9f, spanishChirho = false))
        composeChirho.runOnUiThread { composeChirho.activity.onBackPressedDispatcher.onBackPressed() }
        composeChirho.waitForIdle()
        assertEquals("Back starts reading too", 1, startsChirho)
    }
}
