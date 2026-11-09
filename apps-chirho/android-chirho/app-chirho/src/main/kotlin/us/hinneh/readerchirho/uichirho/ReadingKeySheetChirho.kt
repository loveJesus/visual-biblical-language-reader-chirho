// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
package us.hinneh.readerchirho.uichirho

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.produceState
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalUriHandler
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import us.hinneh.readerchirho.R
import us.hinneh.readerchirho.contentchirho.VerseValidationChirho
import us.hinneh.readerchirho.domainchirho.LegendItemChirho
import us.hinneh.readerchirho.domainchirho.ReadingKeyChirho

/**
 * Help: first the quick tour, always here (GPT, DM #3645; the welcome says it opens from Help), then how to read
 * the marks: the reading key for the passage's language, from the same teaching tables as the website and the
 * iOS reader (export_teaching_chirho.ts writes this app's copy). The Hebrew explanations adapt unfoldingWord
 * Hebrew Grammar under CC BY-SA 4.0, so its credit goes with them. Its last section says once how meanings,
 * grammar and pictures are made, with the source credits, instead of repeating that under every verse and word
 * (L.J., 2026-11-06).
 */
@Composable
fun ReadingKeySheetChirho(greekChirho: Boolean, spanishChirho: Boolean, onDismissChirho: () -> Unit) {
    val contextChirho = LocalContext.current
    val uriHandlerChirho = LocalUriHandler.current
    // The bundled copy is read off the main thread; an unreadable copy leaves only the hint.
    val keyChirho by produceState<ReadingKeyChirho?>(null) {
        value = withContext(Dispatchers.IO) {
            runCatching {
                contextChirho.assets.open(ReadingKeyChirho.ASSET_PATH_CHIRHO).use { ReadingKeyChirho.parseChirho(it.readBytes()) }
            }.getOrNull()
        }
    }
    ClosableSheetChirho(
        onDismissChirho,
        fullHeightChirho = true,
        titleChirho = {
            Text(stringResource(R.string.reading_key_chirho), style = MaterialTheme.typography.headlineSmall, modifier = Modifier.semantics { heading() })
        },
    ) {
        Column(
            Modifier.fillMaxWidth().verticalScroll(rememberScrollState()).padding(horizontal = 20.dp).padding(bottom = 32.dp),
            verticalArrangement = Arrangement.spacedBy(4.dp),
        ) {
            LinkChirho(R.string.tour_chirho) { openLinkChirho(uriHandlerChirho, tourUrlChirho(spanishChirho)) }
            Text(stringResource(R.string.reading_key_hint_chirho), style = MaterialTheme.typography.bodyMedium)
            for (rowChirho in keyChirho?.rowsChirho(greekChirho).orEmpty()) {
                Text(
                    rowChirho.labelChirho(spanishChirho),
                    style = MaterialTheme.typography.titleMedium,
                    modifier = Modifier.padding(top = 16.dp).semantics { heading() },
                )
                for (itemChirho in rowChirho.itemsChirho) {
                    LegendEntryChirho(itemChirho, spanishChirho, if (greekChirho) null else grammarReferenceChirho(itemChirho)) {
                        openLinkChirho(uriHandlerChirho, it)
                    }
                }
            }
            StudyAidsChirho(greekChirho)
            if (!greekChirho && keyChirho != null) {
                Text(
                    stringResource(R.string.grammar_credit_chirho, "CC BY-SA 4.0"),
                    style = MaterialTheme.typography.bodySmall,
                    modifier = Modifier.padding(top = 8.dp),
                )
                TextButton(onClick = { openLinkChirho(uriHandlerChirho, HEBREW_GRAMMAR_URL_CHIRHO) }) { Text("unfoldingWord Hebrew Grammar ↗") }
                TextButton(onClick = { openLinkChirho(uriHandlerChirho, CC_BY_SA_URL_CHIRHO) }) { Text("CC BY-SA 4.0 ↗") }
            }
        }
    }
}

/** Meanings, grammar, roots and pictures for the passage's language, then the text and grammar credits. */
@Composable
private fun StudyAidsChirho(greekChirho: Boolean) {
    Text(
        stringResource(R.string.study_aids_heading_chirho),
        style = MaterialTheme.typography.titleMedium,
        modifier = Modifier.padding(top = 24.dp).semantics { heading() },
    )
    val notesChirho = if (greekChirho) {
        listOf(stringResource(R.string.greek_sources_note_chirho), stringResource(R.string.picture_note_chirho))
    } else {
        listOf(
            stringResource(R.string.hebrew_meanings_note_chirho),
            stringResource(R.string.hebrew_grammar_note_chirho),
            stringResource(R.string.root_lemma_note_chirho),
            stringResource(R.string.picture_note_chirho),
        )
    }
    for (noteChirho in notesChirho) Text(noteChirho, style = MaterialTheme.typography.bodyMedium, modifier = Modifier.padding(top = 6.dp))
    // The CC BY attribution sentence stays verbatim in English; the explanation follows the locale.
    Text(
        if (greekChirho) {
            stringResource(R.string.credit_greek_chirho)
        } else {
            stringResource(R.string.credit_hebrew_attribution_chirho) + " " + stringResource(R.string.credit_hebrew_rest_chirho)
        },
        style = MaterialTheme.typography.bodySmall,
        modifier = Modifier.padding(top = 10.dp),
    )
    // Human readings are credited here in general, and exactly in each verse's Sources (L.J., 2026-11-07).
    if (!greekChirho) {
        Text(stringResource(R.string.credit_hebrew_readings_chirho), style = MaterialTheme.typography.bodySmall, modifier = Modifier.padding(top = 6.dp))
    }
}

@Composable
private fun LegendEntryChirho(itemChirho: LegendItemChirho, spanishChirho: Boolean, referenceChirho: String?, onOpenChirho: (String) -> Unit) {
    Column(Modifier.fillMaxWidth().padding(top = 6.dp)) {
        Text(itemChirho.labelChirho(spanishChirho), style = MaterialTheme.typography.labelLarge)
        Text(itemChirho.helpChirho(spanishChirho), style = MaterialTheme.typography.bodyMedium)
        if (referenceChirho != null) {
            TextButton(onClick = { onOpenChirho(referenceChirho) }) { Text(stringResource(R.string.grammar_reference_chirho) + " ↗") }
        }
    }
}

/** A legend item's own grammar page, only when it is a plain HTTPS address. */
private fun grammarReferenceChirho(itemChirho: LegendItemChirho): String? =
    itemChirho.sourceChirho?.takeIf { VerseValidationChirho.isSafeSourceUrlChirho(it, httpsOnlyChirho = true) }
