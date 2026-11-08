// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
package us.hinneh.readerchirho.uichirho

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.text.selection.SelectionContainer
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalUriHandler
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.style.TextDirection
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import us.hinneh.readerchirho.R
import us.hinneh.readerchirho.contentchirho.HebrewVerseChirho
import us.hinneh.readerchirho.contentchirho.SourceNoteChirho
import us.hinneh.readerchirho.contentchirho.VerseChirho
import us.hinneh.readerchirho.contentchirho.VerseValidationChirho
import us.hinneh.readerchirho.remotechirho.TrustedOriginChirho

/**
 * What belongs to this verse alone: its English numbering, its exact source text, its sources, the credit
 * of the recording or video Play plays, and source-edition notes (folded away), and its page on hinneh.us.
 * The general credits and how meanings, grammar and pictures are made are said once, at the end of the
 * reading key (L.J., 2026-11-06 and 2026-11-07).
 */
@Composable
fun SourcesViewChirho(verseChirho: VerseChirho, greekChirho: Boolean, kjvReferenceChirho: String?, playedCreditChirho: MediaCreditChirho?) {
    val uriHandlerChirho = LocalUriHandler.current
    var canonicalOpenChirho by rememberSaveable(verseChirho.idChirho) { mutableStateOf(false) }
    var sourcesOpenChirho by rememberSaveable(verseChirho.idChirho) { mutableStateOf(false) }
    Column(Modifier.fillMaxWidth().padding(top = 8.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
        if (kjvReferenceChirho != null) {
            Text(stringResource(R.string.kjv_numbering_chirho, kjvReferenceChirho), style = MaterialTheme.typography.bodySmall)
        }
        TextButton(onClick = { canonicalOpenChirho = !canonicalOpenChirho }) {
            Text(stringResource(if (greekChirho) R.string.reveal_canonical_greek_chirho else R.string.reveal_canonical_hebrew_chirho))
        }
        if (canonicalOpenChirho) {
            SelectionContainer {
                Text(
                    sourceTextChirho(verseChirho.canonicalTextChirho, greekChirho),
                    fontFamily = SourceFontChirho,
                    fontSize = 26.sp,
                    style = MaterialTheme.typography.bodyLarge.copy(textDirection = if (greekChirho) TextDirection.Ltr else TextDirection.Rtl),
                )
            }
            Text(stringResource(R.string.canonical_note_chirho), style = MaterialTheme.typography.bodySmall)
        }
        TextButton(onClick = { sourcesOpenChirho = !sourcesOpenChirho }) { Text(stringResource(R.string.sources_summary_chirho)) }
        if (sourcesOpenChirho) {
            if (playedCreditChirho != null) {
                Column(Modifier.padding(bottom = 6.dp)) { CreditChirho(playedCreditChirho) }
            }
            if (verseChirho.sourceNotesChirho.isNotEmpty()) {
                Text(stringResource(R.string.source_edition_notes_chirho), style = MaterialTheme.typography.labelLarge)
                for (noteChirho in verseChirho.sourceNotesChirho) {
                    Text(sourceNoteTextChirho(noteChirho), style = MaterialTheme.typography.bodySmall)
                }
            }
            for (sourceChirho in verseChirho.sourcesChirho) {
                Column(Modifier.padding(bottom = 6.dp)) {
                    val urlChirho = sourceChirho.urlChirho?.takeIf { VerseValidationChirho.isSafeSourceUrlChirho(it, httpsOnlyChirho = true) }
                    if (urlChirho != null) {
                        TextButton(onClick = { openLinkChirho(uriHandlerChirho, urlChirho) }) { Text(sourceChirho.titleChirho + " ↗") }
                    } else {
                        Text(sourceChirho.titleChirho, style = MaterialTheme.typography.labelLarge)
                    }
                    Text("${sourceChirho.licenseChirho} · ${sourceChirho.attributionChirho}", style = MaterialTheme.typography.bodySmall)
                    Text(sourceChirho.revisionChirho, style = MaterialTheme.typography.bodySmall)
                }
            }
        }
        OutlinedButton(onClick = { openLinkChirho(uriHandlerChirho, TrustedOriginChirho.versePageChirho(verseChirho.idChirho)) }) {
            Text(stringResource(R.string.open_on_web_chirho))
        }
    }
}

/** As the website lists them: the note's code or kind, then its text (Hebrew for qere and paragraph marks). */
private fun sourceNoteTextChirho(noteChirho: SourceNoteChirho) = buildAnnotatedString {
    append(englishDataChirho((noteChirho.codeChirho ?: noteChirho.kindChirho).replace('_', ' ') + ": "))
    val hebrewChirho = noteChirho.kindChirho == "qere_source" || noteChirho.kindChirho == "paragraph"
    append(if (hebrewChirho) sourceTextChirho(noteChirho.textChirho, false) else englishDataChirho(noteChirho.textChirho))
}

/** The English Bible's reference when the Hebrew numbering differs, as the website shows it. */
fun kjvReferenceChirho(verseChirho: VerseChirho, bookLabelChirho: (String) -> String?): String? {
    val kjvChirho = (verseChirho as? HebrewVerseChirho)?.kjvVerseIdChirho ?: return null
    if (kjvChirho == verseChirho.idChirho) return null
    val partsChirho = kjvChirho.split('.')
    if (partsChirho.size != 3) return null
    val labelChirho = bookLabelChirho(partsChirho[0]) ?: return null
    return "$labelChirho ${partsChirho[1]}:${partsChirho[2]}"
}
