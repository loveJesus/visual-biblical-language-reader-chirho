// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
package us.hinneh.readerchirho.uichirho

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.selection.selectable
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.FilledTonalButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.Layout
import androidx.compose.ui.layout.Measurable
import androidx.compose.ui.layout.MeasurePolicy
import androidx.compose.ui.layout.MeasureResult
import androidx.compose.ui.layout.MeasureScope
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.Constraints
import androidx.compose.ui.unit.dp
import us.hinneh.readerchirho.R
import us.hinneh.readerchirho.contentchirho.BookChirho
import us.hinneh.readerchirho.statechirho.ReaderUiStateChirho

fun bookLabelChirho(bookChirho: BookChirho?, idChirho: String, spanishChirho: Boolean): String =
    bookChirho?.let { if (spanishChirho) it.spanishLabelChirho else it.labelChirho } ?: idChirho

private enum class PickerChirho { NONE_CHIRHO, BOOK_CHIRHO, CHAPTER_CHIRHO, VERSE_CHIRHO }

@Composable
fun PassageControlsChirho(
    stateChirho: ReaderUiStateChirho,
    spanishChirho: Boolean,
    onBookChirho: (String) -> Unit,
    onChapterChirho: (Int) -> Unit,
    onVerseChirho: (Int) -> Unit,
    onStepChirho: (Boolean) -> Unit,
) {
    var pickerChirho by rememberSaveable { mutableStateOf(PickerChirho.NONE_CHIRHO) }
    val passageChirho = stateChirho.passageChirho
    val catalogueChirho = stateChirho.catalogueChirho
    val bookChirho = catalogueChirho?.bookChirho(passageChirho.bookIdChirho)
    val manifestChirho = stateChirho.manifestChirho?.takeIf { it.bookIdChirho == passageChirho.bookIdChirho }
    val versesChirho = manifestChirho?.chaptersChirho?.getOrNull(passageChirho.chapterChirho - 1)?.versesChirho.orEmpty()
    val bookTextChirho = bookLabelChirho(bookChirho, passageChirho.bookIdChirho, spanishChirho)

    Column(Modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
            PickerButtonChirho(stringResource(R.string.book_chirho), bookTextChirho, catalogueChirho != null, Modifier.weight(2f)) {
                pickerChirho = PickerChirho.BOOK_CHIRHO
            }
            PickerButtonChirho(stringResource(R.string.chapter_chirho), passageChirho.chapterChirho.toString(), bookChirho != null, Modifier.weight(1f)) {
                pickerChirho = PickerChirho.CHAPTER_CHIRHO
            }
            PickerButtonChirho(stringResource(R.string.verse_chirho), passageChirho.verseChirho.toString(), versesChirho.isNotEmpty(), Modifier.weight(1f)) {
                pickerChirho = PickerChirho.VERSE_CHIRHO
            }
        }
        VerseStepRowChirho(stateChirho, spanishChirho, onStepChirho)
    }

    if (pickerChirho == PickerChirho.NONE_CHIRHO) return
    ClosableSheetChirho(onDismissChirho = { pickerChirho = PickerChirho.NONE_CHIRHO }) { closeChirho ->
        when (pickerChirho) {
            PickerChirho.BOOK_CHIRHO -> BookListChirho(catalogueChirho?.booksChirho.orEmpty(), passageChirho.bookIdChirho, spanishChirho) {
                closeChirho()
                onBookChirho(it)
            }
            PickerChirho.CHAPTER_CHIRHO -> NumberGridChirho(
                stringResource(R.string.chapter_chirho), (1..(bookChirho?.chapterCountChirho ?: 0)).toList(), passageChirho.chapterChirho,
            ) {
                closeChirho()
                onChapterChirho(it)
            }
            PickerChirho.VERSE_CHIRHO -> NumberGridChirho(stringResource(R.string.verse_chirho), versesChirho, passageChirho.verseChirho) {
                closeChirho()
                onVerseChirho(it)
            }
            PickerChirho.NONE_CHIRHO -> Unit
        }
    }
}

/**
 * Previous verse, the reference and next verse. The row sits above the verse and again below it,
 * so a reader never has to scroll back up to move on; only the upper reference is a heading.
 * When the reference's longest word no longer fits between the two buttons (a narrow phone or large
 * text), the complete reference takes its own centered line above them instead of breaking inside a
 * word, as "Prove/rbs" did at 320 dp (GPT, DM #3656). The buttons keep their order and targets.
 */
@Composable
fun VerseStepRowChirho(
    stateChirho: ReaderUiStateChirho,
    spanishChirho: Boolean,
    onStepChirho: (Boolean) -> Unit,
    headingChirho: Boolean = true,
) {
    val passageChirho = stateChirho.passageChirho
    val bookTextChirho = bookLabelChirho(stateChirho.catalogueChirho?.bookChirho(passageChirho.bookIdChirho), passageChirho.bookIdChirho, spanishChirho)
    // A no-break space keeps each arrow with its word, so a wrapped label never leaves an arrow alone on a line.
    Layout(
        content = {
            StepButtonChirho("← " + stringResource(R.string.previous_verse_chirho), stateChirho.canStepChirho(forwardChirho = false)) {
                onStepChirho(false)
            }
            Text(
                "$bookTextChirho ${passageChirho.chapterChirho}:${passageChirho.verseChirho}",
                style = MaterialTheme.typography.titleMedium,
                textAlign = TextAlign.Center,
                modifier = Modifier.semantics { if (headingChirho) heading() },
            )
            StepButtonChirho(stringResource(R.string.next_verse_chirho) + " →", stateChirho.canStepChirho(forwardChirho = true)) {
                onStepChirho(true)
            }
        },
        modifier = Modifier.fillMaxWidth(),
        measurePolicy = StepRowLayoutChirho,
    )
}

/**
 * Previous, the reference and Next on one row while the reference's longest word (the text's minimum
 * intrinsic width) fits between the measured buttons; otherwise the reference spans the width above
 * them. Placement is relative, so a right-to-left layout mirrors it as the row did.
 */
private object StepRowLayoutChirho : MeasurePolicy {
    override fun MeasureScope.measure(measurables: List<Measurable>, constraints: Constraints): MeasureResult {
        val (previousChirho, referenceChirho, nextChirho) = measurables
        val looseChirho = constraints.copy(minWidth = 0, minHeight = 0)
        val previousPlaceableChirho = previousChirho.measure(looseChirho)
        val nextPlaceableChirho = nextChirho.measure(looseChirho)
        val buttonsWidthChirho = previousPlaceableChirho.width + nextPlaceableChirho.width
        val widthChirho = if (constraints.hasBoundedWidth) {
            constraints.maxWidth
        } else {
            buttonsWidthChirho + referenceChirho.maxIntrinsicWidth(Constraints.Infinity)
        }
        val roomChirho = (widthChirho - buttonsWidthChirho).coerceAtLeast(0)
        val stackedChirho = referenceChirho.minIntrinsicWidth(Constraints.Infinity) > roomChirho
        val referencePlaceableChirho = referenceChirho.measure(Constraints.fixedWidth(if (stackedChirho) widthChirho else roomChirho))
        val buttonsHeightChirho = maxOf(previousPlaceableChirho.height, nextPlaceableChirho.height)
        val rowHeightChirho = if (stackedChirho) buttonsHeightChirho else maxOf(buttonsHeightChirho, referencePlaceableChirho.height)
        val rowTopChirho = if (stackedChirho) referencePlaceableChirho.height else 0
        return layout(widthChirho, rowTopChirho + rowHeightChirho) {
            fun centredChirho(heightChirho: Int) = rowTopChirho + (rowHeightChirho - heightChirho) / 2
            previousPlaceableChirho.placeRelative(0, centredChirho(previousPlaceableChirho.height))
            nextPlaceableChirho.placeRelative(widthChirho - nextPlaceableChirho.width, centredChirho(nextPlaceableChirho.height))
            if (stackedChirho) {
                referencePlaceableChirho.placeRelative(0, 0)
            } else {
                referencePlaceableChirho.placeRelative(previousPlaceableChirho.width, centredChirho(referencePlaceableChirho.height))
            }
        }
    }
}

/**
 * One step button, in ink, faded where there is no verse that way (Genesis 1:1 has no Previous).
 * The label needs its own colorless style: the theme's body text carries the ink color, which would
 * otherwise override the button's faded color and make a disabled step look tappable.
 */
@Composable
private fun StepButtonChirho(labelChirho: String, enabledChirho: Boolean, onClickChirho: () -> Unit) {
    TextButton(
        onClick = onClickChirho,
        enabled = enabledChirho,
        colors = ButtonDefaults.textButtonColors(contentColor = InkChirho.INK_CHIRHO),
        modifier = Modifier.widthIn(max = STEP_LABEL_MAX_CHIRHO),
    ) { Text(labelChirho, style = MaterialTheme.typography.labelLarge, textAlign = TextAlign.Center) }
}

// Long labels (Spanish "Versículo siguiente") wrap inside their buttons instead of squeezing the
// reference until a book name breaks mid-word; English labels still fit on one line.
private val STEP_LABEL_MAX_CHIRHO = 140.dp

@Composable
private fun PickerButtonChirho(labelChirho: String, valueChirho: String, enabledChirho: Boolean, modifier: Modifier, onClickChirho: () -> Unit) {
    OutlinedButton(
        onClick = onClickChirho,
        enabled = enabledChirho,
        contentPadding = PaddingValues(horizontal = 8.dp, vertical = 8.dp),
        modifier = modifier.semantics(mergeDescendants = true) { contentDescription = "$labelChirho, $valueChirho" },
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text(labelChirho, style = MaterialTheme.typography.labelSmall, maxLines = 1, softWrap = false, overflow = TextOverflow.Ellipsis)
            Text(valueChirho, style = MaterialTheme.typography.labelLarge, maxLines = 1, softWrap = false, overflow = TextOverflow.Ellipsis)
        }
    }
}

@Composable
private fun BookListChirho(booksChirho: List<BookChirho>, currentChirho: String, spanishChirho: Boolean, onChooseChirho: (String) -> Unit) {
    val featuredChirho = booksChirho.filter { it.featuredChirho }
    val otherChirho = booksChirho.filterNot { it.featuredChirho }
    LazyColumn(Modifier.fillMaxWidth().padding(bottom = 24.dp)) {
        item { GroupHeadingChirho(stringResource(R.string.high_quality_books_chirho)) }
        items(featuredChirho, key = { "featured-" + it.idChirho }) { BookRowChirho(it, currentChirho, spanishChirho, onChooseChirho) }
        item { GroupHeadingChirho(stringResource(R.string.other_books_chirho)) }
        items(otherChirho, key = { it.idChirho }) { BookRowChirho(it, currentChirho, spanishChirho, onChooseChirho) }
    }
}

@Composable
private fun GroupHeadingChirho(textChirho: String) {
    Text(
        textChirho.uppercase(),
        style = MaterialTheme.typography.labelSmall,
        modifier = Modifier.padding(start = 24.dp, top = 16.dp, bottom = 6.dp).semantics { heading() },
    )
}

@Composable
private fun BookRowChirho(bookChirho: BookChirho, currentChirho: String, spanishChirho: Boolean, onChooseChirho: (String) -> Unit) {
    val selectedChirho = bookChirho.idChirho == currentChirho
    Text(
        bookLabelChirho(bookChirho, bookChirho.idChirho, spanishChirho),
        style = if (selectedChirho) MaterialTheme.typography.labelLarge else MaterialTheme.typography.bodyLarge,
        color = if (selectedChirho) InkChirho.ACCENT_CHIRHO else InkChirho.INK_CHIRHO,
        modifier = Modifier
            .fillMaxWidth()
            .selectable(selected = selectedChirho, role = Role.RadioButton) { onChooseChirho(bookChirho.idChirho) }
            .padding(horizontal = 24.dp, vertical = 12.dp),
    )
}

@Composable
private fun NumberGridChirho(titleChirho: String, numbersChirho: List<Int>, currentChirho: Int, onChooseChirho: (Int) -> Unit) {
    Column(Modifier.fillMaxWidth().padding(horizontal = 16.dp).padding(bottom = 24.dp)) {
        Text(titleChirho, style = MaterialTheme.typography.titleMedium, modifier = Modifier.padding(8.dp).semantics { heading() })
        LazyVerticalGrid(columns = GridCells.Adaptive(64.dp), horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            items(numbersChirho, key = { it }) { numberChirho ->
                if (numberChirho == currentChirho) {
                    FilledTonalButton(onClick = { onChooseChirho(numberChirho) }) { Text(numberChirho.toString()) }
                } else {
                    OutlinedButton(onClick = { onChooseChirho(numberChirho) }) { Text(numberChirho.toString()) }
                }
            }
        }
    }
}
