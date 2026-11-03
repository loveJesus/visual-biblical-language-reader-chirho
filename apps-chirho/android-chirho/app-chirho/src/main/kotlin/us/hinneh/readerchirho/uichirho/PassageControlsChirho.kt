// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
package us.hinneh.readerchirho.uichirho

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.selection.selectable
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
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import us.hinneh.readerchirho.R
import us.hinneh.readerchirho.contentchirho.BookChirho
import us.hinneh.readerchirho.statechirho.ReaderUiStateChirho
import us.hinneh.readerchirho.statechirho.neighborChirho

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
        Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.fillMaxWidth()) {
            TextButton(
                onClick = { onStepChirho(false) },
                enabled = manifestChirho != null && neighborChirho(manifestChirho, passageChirho, forwardChirho = false) != null,
            ) { Text("← " + stringResource(R.string.previous_verse_chirho)) }
            Text(
                "$bookTextChirho ${passageChirho.chapterChirho}:${passageChirho.verseChirho}",
                style = MaterialTheme.typography.titleMedium,
                textAlign = TextAlign.Center,
                modifier = Modifier.weight(1f).semantics { heading() },
            )
            TextButton(
                onClick = { onStepChirho(true) },
                enabled = manifestChirho != null && neighborChirho(manifestChirho, passageChirho, forwardChirho = true) != null,
            ) { Text(stringResource(R.string.next_verse_chirho) + " →") }
        }
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
