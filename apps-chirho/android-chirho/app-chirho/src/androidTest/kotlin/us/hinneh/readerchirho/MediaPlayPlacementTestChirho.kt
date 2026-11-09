// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
package us.hinneh.readerchirho

import android.content.Context
import android.content.Intent
import androidx.annotation.StringRes
import androidx.compose.ui.geometry.Rect
import androidx.compose.ui.semantics.SemanticsProperties
import androidx.compose.ui.test.SemanticsMatcher
import androidx.compose.ui.test.assertCountEquals
import androidx.compose.ui.test.hasClickAction
import androidx.compose.ui.test.hasText
import androidx.compose.ui.test.isHeading
import androidx.compose.ui.test.junit4.ComposeTestRule
import androidx.compose.ui.test.junit4.v2.createEmptyComposeRule
import androidx.compose.ui.test.onRoot
import androidx.test.core.app.ActivityScenario
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import us.hinneh.readerchirho.statechirho.InterfaceLanguageChirho
import us.hinneh.readerchirho.statechirho.PreferencesChirho

/**
 * The verse's one Play sits directly below its scene or video, at the same place whether it plays the video or a
 * recording (L.J., via GPT DM #3673 and #3677: "when no video is available the listen to verse button should be in the
 * same place as the view video button"). Proverbs 26:1 has a video and 26:2 only a reading; on both, the gap from the
 * picture's bottom edge to the control is the same, and the control appears once, never again under the words.
 * Autoplay is saved off and nothing is pressed, so the test is silent.
 */
@RunWith(AndroidJUnit4::class)
class MediaPlayPlacementTestChirho {
    @get:Rule
    val composeChirho: ComposeTestRule = createEmptyComposeRule()

    private val contextChirho = InstrumentationRegistry.getInstrumentation().targetContext

    private fun textChirho(@StringRes idChirho: Int) = contextChirho.getString(idChirho)

    private fun waitForChirho(matcherChirho: SemanticsMatcher) =
        composeChirho.waitUntil(NETWORK_WAIT_MS_CHIRHO) { composeChirho.onAllNodes(matcherChirho).fetchSemanticsNodes().isNotEmpty() }

    /** The scene or video: the described nodes spanning most of the screen's width and at least a picture's height. */
    private fun mediaCandidatesChirho(): List<Rect> {
        val screenChirho = composeChirho.onRoot(useUnmergedTree = true).fetchSemanticsNode().boundsInRoot
        val minimumHeightChirho = 120f * contextChirho.resources.displayMetrics.density
        val describedChirho = SemanticsMatcher("has a description") { SemanticsProperties.ContentDescription in it.config }
        return composeChirho.onAllNodes(describedChirho, useUnmergedTree = true).fetchSemanticsNodes()
            .map { it.boundsInRoot }
            .filter { it.width >= screenChirho.width * 0.75f && it.height >= minimumHeightChirho }
    }

    /** Opens [passageChirho], and returns the gap in pixels between the picture's bottom and its one Play control. */
    private fun gapBelowMediaChirho(passageChirho: String, @StringRes playLabelChirho: Int): Float {
        val storeChirho = contextChirho.getSharedPreferences(PreferencesChirho.STORE_CHIRHO, Context.MODE_PRIVATE)
        check(storeChirho.edit().clear().commit()) { "the reader's preferences could not be cleared" }
        PreferencesChirho(storeChirho).apply {
            welcomeSeenVersionChirho = BuildConfig.VERSION_CODE.toLong()
            autoplayChirho = false
            interfaceLanguageChirho = InterfaceLanguageChirho.ENGLISH_CHIRHO
        }
        val intentChirho = Intent(contextChirho, MainActivityChirho::class.java).putExtra(MainActivityChirho.EXTRA_PASSAGE_CHIRHO, passageChirho)
        return ActivityScenario.launch<MainActivityChirho>(intentChirho).use {
            waitForChirho(hasText(passageChirho.substringAfter('.').replace('.', ':'), substring = true) and isHeading())
            val playChirho = hasText(textChirho(playLabelChirho)) and hasClickAction()
            waitForChirho(playChirho)
            // The recording can be known before the picture arrives; measure once the picture is there.
            composeChirho.waitUntil(NETWORK_WAIT_MS_CHIRHO) { mediaCandidatesChirho().size == 1 }
            composeChirho.waitForIdle()
            composeChirho.onAllNodes(playChirho).assertCountEquals(1)
            val controlChirho = composeChirho.onNode(playChirho).fetchSemanticsNode().boundsInRoot
            val mediaChirho = mediaCandidatesChirho().single()
            assertTrue("the control $controlChirho is below the picture $mediaChirho", controlChirho.top >= mediaChirho.bottom)
            controlChirho.top - mediaChirho.bottom
        }
    }

    @Test
    fun theOnePlayControlSitsAtTheSamePlaceBelowAVideoAndAStill() {
        val videoGapChirho = gapBelowMediaChirho("Prov.26.1", R.string.play_verse_video_chirho)
        val stillGapChirho = gapBelowMediaChirho("Prov.26.2", R.string.listen_verse_chirho)
        val oneDpChirho = contextChirho.resources.displayMetrics.density
        assertTrue("directly below the picture: $videoGapChirho px", videoGapChirho <= 24 * oneDpChirho)
        assertEquals("the same gap for a video and a still", videoGapChirho, stillGapChirho, oneDpChirho)
    }

    private companion object {
        const val NETWORK_WAIT_MS_CHIRHO = 45_000L
    }
}
