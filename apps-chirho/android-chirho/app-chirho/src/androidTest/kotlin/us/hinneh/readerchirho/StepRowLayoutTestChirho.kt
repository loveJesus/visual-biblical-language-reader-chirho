// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
package us.hinneh.readerchirho

import android.content.res.Configuration
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.width
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Rect
import androidx.compose.ui.platform.LocalConfiguration
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.semantics.SemanticsActions
import androidx.compose.ui.test.SemanticsMatcher
import androidx.compose.ui.test.assertIsEnabled
import androidx.compose.ui.test.assertIsNotEnabled
import androidx.compose.ui.test.hasClickAction
import androidx.compose.ui.test.hasContentDescription
import androidx.compose.ui.test.hasText
import androidx.compose.ui.test.junit4.v2.createComposeRule
import androidx.compose.ui.test.performClick
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
import us.hinneh.readerchirho.contentchirho.BookCatalogueChirho
import us.hinneh.readerchirho.contentchirho.BookChirho
import us.hinneh.readerchirho.contentchirho.BookManifestChirho
import us.hinneh.readerchirho.contentchirho.ChapterEntryChirho
import us.hinneh.readerchirho.domainchirho.PassageChirho
import us.hinneh.readerchirho.statechirho.ReaderUiStateChirho
import us.hinneh.readerchirho.uichirho.HinnehThemeChirho
import us.hinneh.readerchirho.uichirho.LocalTextScaleChirho
import us.hinneh.readerchirho.uichirho.PassageControlsChirho
import us.hinneh.readerchirho.uichirho.ReaderTopBarChirho
import us.hinneh.readerchirho.uichirho.ProvideTextScaleChirho
import us.hinneh.readerchirho.uichirho.VerseStepRowChirho
import java.util.Locale

/**
 * The step row on a narrow phone and at an ordinary width (GPT, DM #3656): the reference keeps its row while it
 * fits and otherwise takes its own line above the two steps, never breaking inside a word; the steps keep their
 * order, targets and disabled state. At font scale 2.0 (GPT, DM #3698) the step labels, the reference and the
 * book, chapter and verse labels all stay whole too.
 */
@RunWith(AndroidJUnit4::class)
class StepRowLayoutTestChirho {
    @get:Rule
    val composeChirho = createComposeRule()

    private val proverbsChirho = BookChirho("Prov", "Proverbs", "Proverbios", "proverbs-chirho", "hbo", "old", 31, true)
    private val manifestChirho = BookManifestChirho(
        1, "Prov", "hbo",
        (1..31).map { ChapterEntryChirho(it, 20, "/content-chirho/proverbs-chirho/chapter-%02d-chirho.json".format(it), "a".repeat(64)) },
    )
    private val stepsChirho = mutableListOf<Boolean>()

    private fun showChirho(
        widthDpChirho: Int,
        textScaleChirho: Float,
        spanishChirho: Boolean,
        passageChirho: PassageChirho,
        fontScaleChirho: Float = 1f,
        controlsChirho: Boolean = false,
    ): Map<String, String> {
        val baseChirho = InstrumentationRegistry.getInstrumentation().targetContext
        val configurationChirho = Configuration(baseChirho.resources.configuration).apply {
            setLocale(Locale.forLanguageTag(if (spanishChirho) "es" else "en"))
            fontScale = fontScaleChirho
        }
        val contextChirho = baseChirho.createConfigurationContext(configurationChirho)
        val stateChirho = ReaderUiStateChirho(
            passageChirho = passageChirho,
            catalogueChirho = BookCatalogueChirho(listOf(proverbsChirho), liveChirho = false),
            manifestChirho = manifestChirho,
        )
        composeChirho.setContent {
            CompositionLocalProvider(
                LocalContext provides contextChirho,
                LocalConfiguration provides configurationChirho,
                LocalTextScaleChirho provides textScaleChirho,
            ) {
                HinnehThemeChirho {
                    ProvideTextScaleChirho {
                        Box(Modifier.width(widthDpChirho.dp)) {
                            if (controlsChirho) {
                                PassageControlsChirho(stateChirho, spanishChirho, {}, {}, {}, { stepsChirho += it })
                            } else {
                                VerseStepRowChirho(stateChirho, spanishChirho, { stepsChirho += it })
                            }
                        }
                    }
                }
            }
        }
        val bookChirho = if (spanishChirho) proverbsChirho.spanishLabelChirho else proverbsChirho.labelChirho
        return mapOf(
            "previous" to contextChirho.getString(R.string.previous_verse_chirho),
            "reference" to "$bookChirho ${passageChirho.chapterChirho}:${passageChirho.verseChirho}",
            "next" to contextChirho.getString(R.string.next_verse_chirho),
            "book" to contextChirho.getString(R.string.book_chirho),
            "chapter" to contextChirho.getString(R.string.chapter_chirho),
            "verse" to contextChirho.getString(R.string.verse_chirho),
        )
    }

    /** The one text layout of the node showing [textChirho] (or, with [substringChirho], containing it). */
    private fun layoutChirho(textChirho: String, substringChirho: Boolean = true): TextLayoutResult {
        val layoutsChirho = mutableListOf<TextLayoutResult>()
        composeChirho.onNode(hasText(textChirho, substring = substringChirho), useUnmergedTree = true)
            .performSemanticsAction(SemanticsActions.GetTextLayoutResult) { it(layoutsChirho) }
        return layoutsChirho.single()
    }

    /** Every line of a step label ends between words, so "Previous" is never split. */
    private fun assertLabelWholeChirho(labelChirho: String) {
        val layoutChirho = layoutChirho(labelChirho)
        val textChirho = layoutChirho.layoutInput.text.text
        for (lineChirho in 0 until layoutChirho.lineCount - 1) {
            val breakChirho = layoutChirho.getLineEnd(lineChirho)
            assertTrue("\"$textChirho\" breaks inside a word at $breakChirho", textChirho[breakChirho - 1].isWhitespace() || textChirho[breakChirho].isWhitespace())
        }
        assertFalse("\"$textChirho\" is cut off", layoutChirho.cutOffChirho())
    }

    /** Previous comes first: before Next on its row, or above it when the two are stacked. */
    private fun assertPreviousFirstChirho(labelsChirho: Map<String, String>) {
        val previousChirho = boundsChirho(stepChirho(labelsChirho.getValue("previous")))
        val nextChirho = boundsChirho(stepChirho(labelsChirho.getValue("next")))
        assertTrue("Previous before Next", previousChirho.right <= nextChirho.left || previousChirho.bottom <= nextChirho.top)
    }

    private fun boundsChirho(matcherChirho: SemanticsMatcher): Rect = composeChirho.onNode(matcherChirho).fetchSemanticsNode().boundsInRoot

    /** A step button by its own label; the arrow beside it is decoration. */
    private fun stepChirho(labelChirho: String) = hasText(labelChirho, substring = true) and hasClickAction()

    /** Every line of the reference ends at a space or at its end: no word is broken. */
    private fun assertWholeWordsChirho(referenceChirho: String) {
        val layoutsChirho = mutableListOf<TextLayoutResult>()
        composeChirho.onNode(hasText(referenceChirho)).performSemanticsAction(SemanticsActions.GetTextLayoutResult) { it(layoutsChirho) }
        val layoutChirho = layoutsChirho.single()
        for (lineChirho in 0 until layoutChirho.lineCount - 1) {
            val breakChirho = layoutChirho.getLineEnd(lineChirho)
            assertTrue(
                "\"$referenceChirho\" breaks inside a word at $breakChirho",
                referenceChirho[breakChirho - 1].isWhitespace() || referenceChirho[breakChirho].isWhitespace(),
            )
        }
    }

    @Test
    fun aNarrowPhoneGivesTheWholeReferenceItsOwnLineAboveTheSteps() {
        val labelsChirho = showChirho(320, 1.15f, spanishChirho = true, PassageChirho("Prov", 9, 1))
        val referenceChirho = boundsChirho(hasText(labelsChirho.getValue("reference")))
        val previousChirho = boundsChirho(stepChirho(labelsChirho.getValue("previous")))
        val nextChirho = boundsChirho(stepChirho(labelsChirho.getValue("next")))
        assertTrue("the reference sits above both steps", referenceChirho.bottom <= previousChirho.top && referenceChirho.bottom <= nextChirho.top)
        assertTrue("Previous stays before Next", previousChirho.right <= nextChirho.left)
        assertWholeWordsChirho(labelsChirho.getValue("reference"))
    }

    @Test
    fun anOrdinaryWidthKeepsOneRow() {
        val labelsChirho = showChirho(411, 0.9f, spanishChirho = false, PassageChirho("Prov", 9, 1))
        val referenceChirho = boundsChirho(hasText(labelsChirho.getValue("reference")))
        val previousChirho = boundsChirho(stepChirho(labelsChirho.getValue("previous")))
        val nextChirho = boundsChirho(stepChirho(labelsChirho.getValue("next")))
        assertTrue("the reference sits between the steps", previousChirho.right <= referenceChirho.left && referenceChirho.right <= nextChirho.left)
        assertTrue("on the same row", referenceChirho.top < previousChirho.bottom && previousChirho.top < referenceChirho.bottom)
        assertWholeWordsChirho(labelsChirho.getValue("reference"))
    }

    @Test
    fun doubleFontScaleKeepsEveryStepLabelWholeInEnglish() {
        val labelsChirho = showChirho(320, 0.9f, spanishChirho = false, PassageChirho("Prov", 9, 1), fontScaleChirho = 2f)
        assertLabelWholeChirho(labelsChirho.getValue("previous"))
        assertLabelWholeChirho(labelsChirho.getValue("next"))
        assertWholeWordsChirho(labelsChirho.getValue("reference"))
        assertPreviousFirstChirho(labelsChirho)
    }

    @Test
    fun doubleFontScaleKeepsEveryStepLabelWholeInSpanishAndTheStepsStillWork() {
        val labelsChirho = showChirho(320, 1.15f, spanishChirho = true, PassageChirho("Prov", 1, 1), fontScaleChirho = 2f)
        assertLabelWholeChirho(labelsChirho.getValue("previous"))
        assertLabelWholeChirho(labelsChirho.getValue("next"))
        assertWholeWordsChirho(labelsChirho.getValue("reference"))
        assertPreviousFirstChirho(labelsChirho)
        composeChirho.onNode(stepChirho(labelsChirho.getValue("previous"))).assertIsNotEnabled()
        composeChirho.onNode(stepChirho(labelsChirho.getValue("next"))).assertIsEnabled().performClick()
        assertEquals("Next steps forward; the faded Previous did nothing", listOf(true), stepsChirho)
    }

    /** "Ch…" and "Ve…" at font scale 2.0: the book, chapter and verse labels now move to their own rows instead. */
    private fun assertPickerLabelsWholeChirho(spanishChirho: Boolean) {
        val labelsChirho = showChirho(320, if (spanishChirho) 1.15f else 0.9f, spanishChirho, PassageChirho("Prov", 26, 2), fontScaleChirho = 2f, controlsChirho = true)
        for (keyChirho in listOf("book", "chapter", "verse")) {
            val layoutChirho = layoutChirho(labelsChirho.getValue(keyChirho), substringChirho = false)
            assertFalse("${labelsChirho.getValue(keyChirho)} is cut to an ellipsis", layoutChirho.cutOffChirho())
        }
        assertLabelWholeChirho(labelsChirho.getValue("previous"))
        assertLabelWholeChirho(labelsChirho.getValue("next"))
    }

    @Test
    fun doubleFontScaleKeepsThePickerLabelsWholeInEnglish() = assertPickerLabelsWholeChirho(spanishChirho = false)

    @Test
    fun doubleFontScaleKeepsThePickerLabelsWholeInSpanish() = assertPickerLabelsWholeChirho(spanishChirho = true)

    /** At font scale 2.0 in Spanish (2.3 with Extra large) the name takes its own line under Help and Settings, whole. */
    @Test
    fun theTopBarKeepsTheNameWholeAtDoubleFontScale() {
        val baseChirho = InstrumentationRegistry.getInstrumentation().targetContext
        val configurationChirho = Configuration(baseChirho.resources.configuration).apply {
            setLocale(Locale.forLanguageTag("es"))
            fontScale = 2f
        }
        val contextChirho = baseChirho.createConfigurationContext(configurationChirho)
        composeChirho.setContent {
            CompositionLocalProvider(LocalContext provides contextChirho, LocalConfiguration provides configurationChirho, LocalTextScaleChirho provides 1.15f) {
                HinnehThemeChirho { ProvideTextScaleChirho { Box(Modifier.width(320.dp)) { ReaderTopBarChirho({}, {}) } } }
            }
        }
        val nameChirho = contextChirho.getString(R.string.app_name_chirho)
        val layoutChirho = layoutChirho(nameChirho, substringChirho = false)
        assertEquals("\"$nameChirho\" stays on one line", 1, layoutChirho.lineCount)
        assertFalse(layoutChirho.cutOffChirho())
        val settingsChirho = boundsChirho(hasContentDescription(contextChirho.getString(R.string.settings_chirho)) and hasClickAction())
        assertTrue("the name goes under the icons", boundsChirho(hasText(nameChirho)).top >= settingsChirho.bottom)
    }

    @Test
    fun stackedStepsKeepTheirTargetsAndDisabledState() {
        val labelsChirho = showChirho(320, 1.15f, spanishChirho = true, PassageChirho("Prov", 1, 1))
        composeChirho.onNode(stepChirho(labelsChirho.getValue("previous"))).assertIsNotEnabled()
        composeChirho.onNode(stepChirho(labelsChirho.getValue("next"))).assertIsEnabled().performClick()
        composeChirho.onNode(stepChirho(labelsChirho.getValue("previous"))).performClick()
        assertEquals("only Next stepped, forward; the faded Previous did nothing", listOf(true), stepsChirho)
    }
}
