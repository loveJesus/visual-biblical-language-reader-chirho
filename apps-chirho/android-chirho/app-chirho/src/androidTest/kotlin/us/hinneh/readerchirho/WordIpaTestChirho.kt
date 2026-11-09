// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
package us.hinneh.readerchirho

import android.content.Context
import android.content.Intent
import android.content.res.Configuration
import androidx.annotation.StringRes
import androidx.compose.ui.test.SemanticsMatcher
import androidx.compose.ui.test.assertIsOff
import androidx.compose.ui.test.assertIsOn
import androidx.compose.ui.test.hasClickAction
import androidx.compose.ui.test.hasContentDescription
import androidx.compose.ui.test.hasText
import androidx.compose.ui.test.isHeading
import androidx.compose.ui.test.junit4.ComposeTestRule
import androidx.compose.ui.test.junit4.v2.createEmptyComposeRule
import androidx.compose.ui.test.onFirst
import androidx.compose.ui.test.onRoot
import androidx.compose.ui.test.performClick
import androidx.compose.ui.test.performScrollTo
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
import java.util.Locale

/**
 * Show IPA on the real activity against https://hinneh.us/ (unit 175, GPT DM #3669). Daniel 2:4 begins in Hebrew and
 * turns to Aramaic: its four Hebrew words show the IPA of the recordings their speakers play, and its eight Aramaic
 * words, which never take a Hebrew recording, say that none is available. The choice is kept for the next launch, and
 * every IPA line stays inside the screen, including at 320 dp when the device QA narrows the display. A Greek verse
 * takes every word's value from root's bundled draft guide. Autoplay is saved off and nothing is pressed that plays,
 * so the test is silent even before the emulator's -no-audio.
 */
@RunWith(AndroidJUnit4::class)
class WordIpaTestChirho {
    @get:Rule
    val composeChirho: ComposeTestRule = createEmptyComposeRule()

    private val targetChirho = InstrumentationRegistry.getInstrumentation().targetContext

    /** Saved choices before launch: the welcome already seen, autoplay off and the interface language under test. */
    private fun prepareChirho(spanishChirho: Boolean, savedIpaChirho: Boolean? = null): Context {
        val storeChirho = targetChirho.getSharedPreferences(PreferencesChirho.STORE_CHIRHO, Context.MODE_PRIVATE)
        check(storeChirho.edit().clear().commit()) { "the reader's preferences could not be cleared" }
        PreferencesChirho(storeChirho).apply {
            welcomeSeenVersionChirho = BuildConfig.VERSION_CODE.toLong()
            autoplayChirho = false
            interfaceLanguageChirho = if (spanishChirho) InterfaceLanguageChirho.SPANISH_CHIRHO else InterfaceLanguageChirho.ENGLISH_CHIRHO
            savedIpaChirho?.let { showIpaChirho = it }
        }
        val configurationChirho = Configuration(targetChirho.resources.configuration)
            .apply { setLocale(Locale.forLanguageTag(if (spanishChirho) "es" else "en")) }
        return targetChirho.createConfigurationContext(configurationChirho)
    }

    private fun openChirho(passageChirho: String) = ActivityScenario.launch<MainActivityChirho>(
        Intent(targetChirho, MainActivityChirho::class.java).putExtra(MainActivityChirho.EXTRA_PASSAGE_CHIRHO, passageChirho),
    )

    private fun countChirho(matcherChirho: SemanticsMatcher) =
        composeChirho.onAllNodes(matcherChirho, useUnmergedTree = true).fetchSemanticsNodes().size

    private fun waitForChirho(matcherChirho: SemanticsMatcher, countChirho: Int? = null) =
        composeChirho.waitUntil(NETWORK_WAIT_MS_CHIRHO) {
            val foundChirho = countChirho(matcherChirho)
            if (countChirho == null) foundChirho > 0 else foundChirho == countChirho
        }

    private fun ipaChirho(contextChirho: Context) = hasContentDescription(contextChirho.getString(R.string.ipa_label_chirho, ""), substring = true)

    private fun unavailableChirho(contextChirho: Context) = hasContentDescription(contextChirho.getString(R.string.ipa_unavailable_chirho))

    private fun textChirho(contextChirho: Context, @StringRes idChirho: Int) = contextChirho.getString(idChirho)

    /** The verse heading and its word speakers have arrived, so an absent IPA line is a choice, not a slow load. */
    private fun waitForWordsChirho(contextChirho: Context, headingChirho: String) {
        waitForChirho(hasText(headingChirho, substring = true) and isHeading())
        waitForChirho(hasContentDescription(contextChirho.getString(R.string.pronounce_word_chirho, ""), substring = true))
    }

    private fun showIpaSwitchChirho(contextChirho: Context) = hasText(textChirho(contextChirho, R.string.show_ipa_chirho)) and hasClickAction()

    /** Opens Settings, checks the Show IPA switch is [onChirho] and turns it the other way, then closes Settings. */
    private fun flipShowIpaChirho(contextChirho: Context, onChirho: Boolean) {
        composeChirho.onAllNodes(hasContentDescription(textChirho(contextChirho, R.string.settings_chirho)) and hasClickAction()).onFirst().performClick()
        // The switch row merges its label into one toggleable node, so it is found in the merged tree.
        composeChirho.waitUntil(NETWORK_WAIT_MS_CHIRHO) { composeChirho.onAllNodes(showIpaSwitchChirho(contextChirho)).fetchSemanticsNodes().isNotEmpty() }
        val switchChirho = composeChirho.onNode(showIpaSwitchChirho(contextChirho)).performScrollTo()
        if (onChirho) switchChirho.assertIsOn() else switchChirho.assertIsOff()
        switchChirho.performClick()
        if (onChirho) switchChirho.assertIsOff() else switchChirho.assertIsOn()
        composeChirho.onAllNodes(hasText(textChirho(contextChirho, R.string.close_chirho)) and hasClickAction()).onFirst().performClick()
    }

    /** Every IPA line lies within the screen's width: nothing overflows at any width the QA sets. */
    private fun assertInsideChirho(matcherChirho: SemanticsMatcher) {
        val rootChirho = composeChirho.onRoot(useUnmergedTree = true).fetchSemanticsNode().boundsInRoot
        for (nodeChirho in composeChirho.onAllNodes(matcherChirho, useUnmergedTree = true).fetchSemanticsNodes()) {
            val boundsChirho = nodeChirho.boundsInRoot
            assertTrue("$boundsChirho lies inside $rootChirho", boundsChirho.left >= rootChirho.left && boundsChirho.right <= rootChirho.right)
        }
    }

    @Test
    fun showIpaIsOffUntilChosenAndIsKeptForTheNextLaunch() {
        val contextChirho = prepareChirho(spanishChirho = false)
        openChirho("Dan.2.4").use {
            waitForWordsChirho(contextChirho, " 2:4")
            assertEquals("no IPA line until the reader turns it on", 0, countChirho(ipaChirho(contextChirho)) + countChirho(unavailableChirho(contextChirho)))
            flipShowIpaChirho(contextChirho, onChirho = false)
            waitForChirho(ipaChirho(contextChirho), countChirho = HEBREW_WORDS_CHIRHO)
            assertEquals("the Aramaic words have no Hebrew recording, so no IPA", ARAMAIC_WORDS_CHIRHO, countChirho(unavailableChirho(contextChirho)))
            assertInsideChirho(ipaChirho(contextChirho))
        }
        openChirho("Dan.2.4").use {
            waitForChirho(ipaChirho(contextChirho), countChirho = HEBREW_WORDS_CHIRHO)
            flipShowIpaChirho(contextChirho, onChirho = true)
            waitForChirho(ipaChirho(contextChirho), countChirho = 0)
            assertEquals(0, countChirho(unavailableChirho(contextChirho)))
        }
    }

    @Test
    fun spanishLabelsAndEveryLineInsideTheScreen() {
        val contextChirho = prepareChirho(spanishChirho = true, savedIpaChirho = true)
        openChirho("Dan.2.4").use {
            waitForWordsChirho(contextChirho, " 2:4")
            waitForChirho(ipaChirho(contextChirho), countChirho = HEBREW_WORDS_CHIRHO)
            assertEquals(ARAMAIC_WORDS_CHIRHO, countChirho(unavailableChirho(contextChirho)))
            assertInsideChirho(ipaChirho(contextChirho))
            assertInsideChirho(unavailableChirho(contextChirho))
        }
    }

    /** John 1:1 in the bundled guide: every word has a value under the automatic Modern with Aspirates. */
    @Test
    fun aGreekVerseShowsTheGuideForEveryWord() {
        val contextChirho = prepareChirho(spanishChirho = false, savedIpaChirho = true)
        openChirho("John.1.1").use {
            waitForWordsChirho(contextChirho, " 1:1")
            waitForChirho(ipaChirho(contextChirho), countChirho = JOHN_1_1_WORDS_CHIRHO)
            assertEquals(0, countChirho(unavailableChirho(contextChirho)))
            assertInsideChirho(ipaChirho(contextChirho))
        }
    }

    private companion object {
        const val NETWORK_WAIT_MS_CHIRHO = 45_000L
        /** Daniel 2:4: four Hebrew words with recordings, then eight Aramaic words. */
        const val HEBREW_WORDS_CHIRHO = 4
        const val ARAMAIC_WORDS_CHIRHO = 8
        /** Ἐν ἀρχῇ ἦν ὁ Λόγος, καὶ ὁ Λόγος ἦν πρὸς τὸν Θεόν, καὶ Θεὸς ἦν ὁ Λόγος. */
        const val JOHN_1_1_WORDS_CHIRHO = 17
    }
}
