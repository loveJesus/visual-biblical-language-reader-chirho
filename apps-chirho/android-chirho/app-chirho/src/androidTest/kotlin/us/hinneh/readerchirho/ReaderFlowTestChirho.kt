// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
package us.hinneh.readerchirho

import androidx.annotation.StringRes
import androidx.compose.ui.test.SemanticsMatcher
import androidx.compose.ui.test.hasClickAction
import androidx.compose.ui.test.hasContentDescription
import androidx.compose.ui.test.hasText
import androidx.compose.ui.test.isHeading
import androidx.compose.ui.test.junit4.v2.createAndroidComposeRule
import androidx.compose.ui.test.onFirst
import androidx.compose.ui.test.performClick
import androidx.compose.ui.test.performScrollTo
import androidx.test.ext.junit.runners.AndroidJUnit4
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import java.time.LocalDate

/** The real activity against https://hinneh.us/: daily default, book choice, Look closer, playback, stepping. */
@RunWith(AndroidJUnit4::class)
class ReaderFlowTestChirho {
    @get:Rule
    val composeChirho = createAndroidComposeRule<MainActivityChirho>()

    private fun textChirho(@StringRes idChirho: Int) = composeChirho.activity.getString(idChirho)

    private fun waitForChirho(matcherChirho: SemanticsMatcher, presentChirho: Boolean = true) {
        composeChirho.waitUntil(NETWORK_WAIT_MS_CHIRHO) {
            composeChirho.onAllNodes(matcherChirho).fetchSemanticsNodes().isNotEmpty() == presentChirho
        }
    }

    @Test
    fun readerOpensTodayThenReadsLooksCloserListensAndSteps() {
        // A fresh visit opens Proverbs at the local day of the month.
        waitForChirho(hasText(" ${LocalDate.now().dayOfMonth}:1", substring = true) and isHeading())
        waitForChirho(hasContentDescription(textChirho(R.string.pronounce_word_chirho).substringBefore("%").trim(), substring = true))

        // Choosing a book opens its first verse. Book labels are published data in the reader's language.
        val johnChirho = if (composeChirho.activity.resources.configuration.locales[0].language == "es") "Juan" else "John"
        composeChirho.onNode(hasContentDescription("${textChirho(R.string.book_chirho)}, ", substring = true) and hasClickAction()).performClick()
        waitForChirho(hasText(johnChirho) and hasClickAction())
        composeChirho.onAllNodes(hasText(johnChirho) and hasClickAction()).onFirst().performClick()
        waitForChirho(hasText("$johnChirho 1:1") and isHeading())

        // A word opens Look closer, and the visible Close control dismisses it.
        waitForChirho(hasText("Ἐν") and hasClickAction())
        composeChirho.onNode(hasText("Ἐν") and hasClickAction()).performScrollTo().performClick()
        waitForChirho(hasText(textChirho(R.string.meaning_morphology_chirho)))
        composeChirho.onNode(hasText(textChirho(R.string.close_chirho))).performClick()
        waitForChirho(hasText(textChirho(R.string.meaning_morphology_chirho)), presentChirho = false)

        // The verified verse recording starts and can be stopped.
        val listenChirho = hasText(textChirho(R.string.listen_verse_chirho)) and hasClickAction()
        waitForChirho(listenChirho)
        composeChirho.onNode(listenChirho).performScrollTo().performClick()
        val stopChirho = hasText(textChirho(R.string.stop_chirho)) and hasClickAction()
        waitForChirho(stopChirho)
        composeChirho.onNode(stopChirho).performClick()
        waitForChirho(listenChirho)

        // Stepping follows the source numbering.
        composeChirho.onNode(hasText(textChirho(R.string.next_verse_chirho), substring = true) and hasClickAction()).performScrollTo().performClick()
        waitForChirho(hasText("$johnChirho 1:2") and isHeading())
    }

    private companion object {
        const val NETWORK_WAIT_MS_CHIRHO = 45_000L
    }
}
