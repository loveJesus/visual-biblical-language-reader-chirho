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
import androidx.compose.ui.text.style.TextDirection
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import us.hinneh.readerchirho.R
import us.hinneh.readerchirho.contentchirho.HebrewVerseChirho
import us.hinneh.readerchirho.contentchirho.VerseChirho
import us.hinneh.readerchirho.contentchirho.VerseValidationChirho
import us.hinneh.readerchirho.remotechirho.TrustedOriginChirho

@Composable
fun SourcesViewChirho(verseChirho: VerseChirho, greekChirho: Boolean, kjvReferenceChirho: String?) {
    val uriHandlerChirho = LocalUriHandler.current
    var canonicalOpenChirho by rememberSaveable(verseChirho.idChirho) { mutableStateOf(false) }
    var sourcesOpenChirho by rememberSaveable(verseChirho.idChirho) { mutableStateOf(false) }
    Column(Modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(8.dp)) {
        SectionHeadingChirho(stringResource(R.string.source_eyebrow_chirho), stringResource(R.string.source_heading_chirho))
        if (kjvReferenceChirho != null) {
            Text(stringResource(R.string.kjv_numbering_chirho, kjvReferenceChirho), style = MaterialTheme.typography.bodySmall)
        }
        for (noteChirho in verseChirho.sourceNotesChirho) {
            Text(englishDataChirho(noteChirho.textChirho), style = MaterialTheme.typography.bodyMedium)
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
        if (greekChirho) {
            Text(stringResource(R.string.credit_greek_chirho), style = MaterialTheme.typography.bodySmall)
            Text(stringResource(R.string.greek_sources_note_chirho), style = MaterialTheme.typography.bodySmall)
            Text(stringResource(R.string.greek_cues_note_chirho), style = MaterialTheme.typography.bodySmall)
        } else {
            // The CC BY attribution sentence stays verbatim in English; the explanation follows the locale.
            Text(
                stringResource(R.string.credit_hebrew_attribution_chirho) + " " + stringResource(R.string.credit_hebrew_rest_chirho),
                style = MaterialTheme.typography.bodySmall,
            )
            Text(stringResource(R.string.root_lemma_note_chirho), style = MaterialTheme.typography.bodySmall)
        }
        TextButton(onClick = { sourcesOpenChirho = !sourcesOpenChirho }) { Text(stringResource(R.string.sources_summary_chirho)) }
        if (sourcesOpenChirho) {
            for (sourceChirho in verseChirho.sourcesChirho) {
                Column(Modifier.padding(bottom = 6.dp)) {
                    val urlChirho = sourceChirho.urlChirho?.takeIf { VerseValidationChirho.isSafeSourceUrlChirho(it, httpsOnlyChirho = true) }
                    if (urlChirho != null) {
                        TextButton(onClick = { uriHandlerChirho.openUri(urlChirho) }) { Text(sourceChirho.titleChirho + " ↗") }
                    } else {
                        Text(sourceChirho.titleChirho, style = MaterialTheme.typography.labelLarge)
                    }
                    Text("${sourceChirho.licenseChirho} · ${sourceChirho.attributionChirho}", style = MaterialTheme.typography.bodySmall)
                    Text(sourceChirho.revisionChirho, style = MaterialTheme.typography.bodySmall)
                }
            }
        }
        OutlinedButton(onClick = { uriHandlerChirho.openUri(TrustedOriginChirho.versePageChirho(verseChirho.idChirho)) }) {
            Text(stringResource(R.string.open_on_web_chirho))
        }
        Text(stringResource(R.string.report_on_web_chirho), style = MaterialTheme.typography.bodySmall)
    }
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
