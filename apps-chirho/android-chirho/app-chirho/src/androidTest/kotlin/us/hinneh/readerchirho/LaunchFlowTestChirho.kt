// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
package us.hinneh.readerchirho

import android.content.Context
import android.content.Intent
import androidx.annotation.StringRes
import androidx.compose.ui.test.SemanticsMatcher
import androidx.compose.ui.test.assertCountEquals
import androidx.compose.ui.test.assertIsOff
import androidx.compose.ui.test.assertIsOn
import androidx.compose.ui.test.hasClickAction
import androidx.compose.ui.test.hasContentDescription
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
import org.junit.rules.TestRule
import org.junit.runner.Description
import org.junit.runner.RunWith
import org.junit.runners.model.Statement
import us.hinneh.readerchirho.statechirho.PreferencesChirho

/**
 * Starts a test from a first run: no saved choices, so the welcome shows before the reader. [autoplayChirho], when
 * given, is a choice the reader had already saved in Settings.
 */
class FirstRunRuleChirho(private val autoplayChirho: Boolean? = null) : TestRule {
    override fun apply(baseChirho: Statement, descriptionChirho: Description): Statement = object : Statement() {
        override fun evaluate() {
            val storeChirho = InstrumentationRegistry.getInstrumentation().targetContext
                .getSharedPreferences(PreferencesChirho.STORE_CHIRHO, Context.MODE_PRIVATE)
            check(storeChirho.edit().clear().commit()) { "the reader's preferences could not be cleared" }
            autoplayChirho?.let { PreferencesChirho(storeChirho).autoplayChirho = it }
            baseChirho.evaluate()
        }
    }
}

/**
 * The welcome, Info and the two switches on the real activity against https://hinneh.us/ (GPT, DM #3642 and #3664).
 * The emulator runs with -no-audio, so the reading that starts by itself is silent. The quick tour is only checked to
 * be offered: opening it would leave the app for the browser. Proverbs 26 has a reading for every verse, so the flow
 * never depends on the date.
 */
@RunWith(AndroidJUnit4::class)
class LaunchFlowTestChirho {
    @get:Rule
    val firstRunChirho = FirstRunRuleChirho()

    @get:Rule
    val composeChirho: ComposeTestRule = createEmptyComposeRule()

    private val contextChirho = InstrumentationRegistry.getInstrumentation().targetContext

    private fun textChirho(@StringRes idChirho: Int) = contextChirho.getString(idChirho)

    private fun waitForChirho(matcherChirho: SemanticsMatcher, presentChirho: Boolean = true) {
        composeChirho.waitUntil(NETWORK_WAIT_MS_CHIRHO) {
            composeChirho.onAllNodes(matcherChirho).fetchSemanticsNodes().isNotEmpty() == presentChirho
        }
    }

    /** Taps the first match; [scrollChirho] brings an item inside a scrolling page or sheet into view first. */
    private fun tapChirho(matcherChirho: SemanticsMatcher, scrollChirho: Boolean = true) {
        waitForChirho(matcherChirho)
        val nodeChirho = composeChirho.onAllNodes(matcherChirho).onFirst()
        if (scrollChirho) nodeChirho.performScrollTo()
        nodeChirho.performClick()
    }

    private fun switchChirho(@StringRes labelChirho: Int) = hasText(textChirho(labelChirho)) and hasClickAction()

    private fun openSettingsChirho() =
        tapChirho(hasContentDescription(textChirho(R.string.settings_chirho)) and hasClickAction(), scrollChirho = false)

    private fun closeSheetChirho() = tapChirho(hasText(textChirho(R.string.close_chirho)) and hasClickAction(), scrollChirho = false)

    @Test
    fun theWelcomeShowsOnceAndTheSwitchesShapeTheNextLaunch() {
        val openingChirho = Intent(contextChirho, MainActivityChirho::class.java).putExtra(MainActivityChirho.EXTRA_PASSAGE_CHIRHO, "Prov.26.1")
        ActivityScenario.launch<MainActivityChirho>(openingChirho).use {
            // A first run shows the short welcome; the tour is offered, and Info holds the licenses and credits.
            waitForChirho(hasText(textChirho(R.string.welcome_title_chirho)) and isHeading())
            waitForChirho(hasText(textChirho(R.string.tour_chirho), substring = true) and hasClickAction())
            tapChirho(hasContentDescription(textChirho(R.string.info_link_chirho)) and hasClickAction(), scrollChirho = false)
            waitForChirho(hasText(textChirho(R.string.licenses_heading_chirho)) and isHeading())
            closeSheetChirho()
            waitForChirho(hasText(textChirho(R.string.licenses_heading_chirho)), presentChirho = false)

            // Start reading opens the verse, which has a video, so Play's label names the video. It never plays by itself.
            // Start reading is pinned below the welcome's scrolling content, so it is tapped where it is.
            tapChirho(hasText(textChirho(R.string.welcome_start_chirho)) and hasClickAction(), scrollChirho = false)
            waitForChirho(hasText(" 26:1", substring = true) and isHeading())
            waitForChirho(hasText(textChirho(R.string.play_verse_video_chirho)) and hasClickAction())
            composeChirho.onAllNodes(hasText(textChirho(R.string.stop_chirho))).assertCountEquals(0)

            // A new install starts with both switches on (L.J., via GPT DM #3664); today's Proverbs is turned off here.
            openSettingsChirho()
            waitForChirho(switchChirho(R.string.autoplay_chirho))
            composeChirho.onNode(switchChirho(R.string.autoplay_chirho)).assertIsOn()
            composeChirho.onNode(switchChirho(R.string.open_today_chirho)).assertIsOn()
            tapChirho(switchChirho(R.string.open_today_chirho))
            composeChirho.onNode(switchChirho(R.string.open_today_chirho)).assertIsOff()
            closeSheetChirho()

            // A verse the reader moves to presses its own Play: its reading starts, and Stop ends it.
            tapChirho(hasText(textChirho(R.string.next_verse_chirho), substring = true) and hasClickAction(), scrollChirho = false)
            waitForChirho(hasText(" 26:2", substring = true) and isHeading())
            tapChirho(hasText(textChirho(R.string.stop_chirho)) and hasClickAction())
            waitForChirho(hasText(textChirho(R.string.listen_verse_chirho)) and hasClickAction())

            // The reader turns autoplay off.
            openSettingsChirho()
            tapChirho(switchChirho(R.string.autoplay_chirho))
            composeChirho.onNode(switchChirho(R.string.autoplay_chirho)).assertIsOff()
            closeSheetChirho()
        }
        // A fresh launch: no welcome, the verse shown last, nothing playing, and autoplay still off as chosen.
        ActivityScenario.launch(MainActivityChirho::class.java).use {
            waitForChirho(hasText(" 26:2", substring = true) and isHeading())
            waitForChirho(hasText(textChirho(R.string.listen_verse_chirho)) and hasClickAction())
            composeChirho.onAllNodes(hasText(textChirho(R.string.welcome_title_chirho))).assertCountEquals(0)
            composeChirho.onAllNodes(hasText(textChirho(R.string.stop_chirho))).assertCountEquals(0)
            openSettingsChirho()
            waitForChirho(switchChirho(R.string.autoplay_chirho))
            composeChirho.onNode(switchChirho(R.string.autoplay_chirho)).assertIsOff()
            closeSheetChirho()

            // With autoplay off, moving on plays nothing.
            tapChirho(hasText(textChirho(R.string.next_verse_chirho), substring = true) and hasClickAction(), scrollChirho = false)
            waitForChirho(hasText(" 26:3", substring = true) and isHeading())
            waitForChirho(hasText(textChirho(R.string.listen_verse_chirho)) and hasClickAction())
            composeChirho.onAllNodes(hasText(textChirho(R.string.stop_chirho))).assertCountEquals(0)
        }
    }

    private companion object {
        const val NETWORK_WAIT_MS_CHIRHO = 45_000L
    }
}
