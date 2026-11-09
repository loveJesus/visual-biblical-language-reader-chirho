// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
package us.hinneh.readerchirho

import android.content.Context
import android.content.Intent
import androidx.annotation.StringRes
import androidx.compose.ui.test.SemanticsMatcher
import androidx.compose.ui.test.assertCountEquals
import androidx.compose.ui.test.hasClickAction
import androidx.compose.ui.test.hasText
import androidx.compose.ui.test.isHeading
import androidx.compose.ui.test.junit4.ComposeTestRule
import androidx.compose.ui.test.junit4.v2.createEmptyComposeRule
import androidx.compose.ui.test.onFirst
import androidx.compose.ui.test.performClick
import androidx.compose.ui.test.performScrollTo
import androidx.test.core.app.ActivityScenario
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import us.hinneh.readerchirho.statechirho.InterfaceLanguageChirho
import us.hinneh.readerchirho.statechirho.PreferencesChirho

/**
 * Autoplay on the real activity against https://hinneh.us/ (unit 174, GPT DM #3664 and #3677). Each case opens a deep
 * link, which never plays, then makes the explicit move that does: onto a verse with a video (Proverbs 3:1, a chapter
 * opening), with a saved ON onto an audio-only verse, and twice in a row, where only the newer verse plays. The welcome
 * and saved OFF are proved in LaunchFlowTestChirho. The emulator runs with -no-audio, so these plays are silent.
 */
@RunWith(AndroidJUnit4::class)
class AutoplayFlowTestChirho {
    @get:Rule
    val composeChirho: ComposeTestRule = createEmptyComposeRule()

    private val contextChirho = InstrumentationRegistry.getInstrumentation().targetContext

    /** The welcome already seen and English chosen; autoplay saved only when [savedAutoplayChirho] says so. */
    private fun prepareChirho(savedAutoplayChirho: Boolean? = null) {
        val storeChirho = contextChirho.getSharedPreferences(PreferencesChirho.STORE_CHIRHO, Context.MODE_PRIVATE)
        check(storeChirho.edit().clear().commit()) { "the reader's preferences could not be cleared" }
        PreferencesChirho(storeChirho).apply {
            welcomeSeenVersionChirho = BuildConfig.VERSION_CODE.toLong()
            interfaceLanguageChirho = InterfaceLanguageChirho.ENGLISH_CHIRHO
            savedAutoplayChirho?.let { autoplayChirho = it }
        }
    }

    private fun openChirho(passageChirho: String) = ActivityScenario.launch<MainActivityChirho>(
        Intent(contextChirho, MainActivityChirho::class.java).putExtra(MainActivityChirho.EXTRA_PASSAGE_CHIRHO, passageChirho),
    )

    private fun textChirho(@StringRes idChirho: Int) = contextChirho.getString(idChirho)

    private fun waitForChirho(matcherChirho: SemanticsMatcher, waitMsChirho: Long = NETWORK_WAIT_MS_CHIRHO) =
        composeChirho.waitUntil(waitMsChirho) { composeChirho.onAllNodes(matcherChirho).fetchSemanticsNodes().isNotEmpty() }

    private fun buttonChirho(@StringRes labelChirho: Int) = hasText(textChirho(labelChirho)) and hasClickAction()

    private fun headingChirho(referenceChirho: String) = hasText(referenceChirho, substring = true) and isHeading()

    private fun nextChirho() =
        composeChirho.onAllNodes(hasText(textChirho(R.string.next_verse_chirho), substring = true) and hasClickAction()).onFirst().performClick()

    /** The verse shown by a deep link is loaded, has something to play, and plays nothing by itself. */
    private fun assertQuietChirho(referenceChirho: String, @StringRes playLabelChirho: Int) {
        waitForChirho(headingChirho(referenceChirho))
        waitForChirho(buttonChirho(playLabelChirho))
        composeChirho.onAllNodes(hasText(textChirho(R.string.stop_chirho))).assertCountEquals(0)
    }

    /** Stop shows while the verse plays; pressing it leaves the verse's own Play label, so the played thing is named. */
    private fun stopChirho(@StringRes playLabelChirho: Int) {
        waitForChirho(buttonChirho(R.string.stop_chirho), PLAY_WAIT_MS_CHIRHO)
        composeChirho.onAllNodes(buttonChirho(R.string.stop_chirho)).assertCountEquals(1)
        composeChirho.onAllNodes(buttonChirho(R.string.stop_chirho)).onFirst().performScrollTo().performClick()
        waitForChirho(buttonChirho(playLabelChirho))
    }

    /** With nothing saved, moving onto a chapter opening starts its video; it neither failed nor fell back to the reading. */
    @Test
    fun withNothingSavedMovingOntoAVideoVerseStartsItsVideo() {
        prepareChirho()
        openChirho("Prov.2.22").use {
            assertQuietChirho(" 2:22", R.string.listen_verse_chirho)
            nextChirho()
            waitForChirho(headingChirho(" 3:1"))
            stopChirho(R.string.play_verse_video_chirho)
        }
    }

    @Test
    fun aSavedOnStartsTheNextVersesRecording() {
        prepareChirho(savedAutoplayChirho = true)
        openChirho("Prov.26.1").use {
            assertQuietChirho(" 26:1", R.string.play_verse_video_chirho)
            nextChirho()
            waitForChirho(headingChirho(" 26:2"))
            stopChirho(R.string.listen_verse_chirho)
        }
    }

    /** Two quick moves: the older verse's autoplay is cancelled or stopped, and only the newer verse plays. */
    @Test
    fun aNewerMoveLeavesOnlyTheNewerVersePlaying() {
        prepareChirho()
        openChirho("Prov.26.1").use {
            assertQuietChirho(" 26:1", R.string.play_verse_video_chirho)
            nextChirho()
            nextChirho()
            waitForChirho(headingChirho(" 26:3"))
            stopChirho(R.string.listen_verse_chirho)
            composeChirho.onAllNodes(headingChirho(" 26:2")).assertCountEquals(0)
        }
    }

    private companion object {
        const val NETWORK_WAIT_MS_CHIRHO = 45_000L
        /** A verse video is fetched and verified before it starts, which takes longer than a reading. */
        const val PLAY_WAIT_MS_CHIRHO = 90_000L
    }
}
