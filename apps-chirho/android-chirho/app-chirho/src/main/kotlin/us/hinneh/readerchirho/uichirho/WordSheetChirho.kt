// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
package us.hinneh.readerchirho.uichirho

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.style.TextDirection
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import us.hinneh.readerchirho.R
import us.hinneh.readerchirho.audiochirho.ClipChirho
import us.hinneh.readerchirho.contentchirho.HebrewVerseChirho
import us.hinneh.readerchirho.contentchirho.HebrewWordChirho
import us.hinneh.readerchirho.contentchirho.VerseChirho
import us.hinneh.readerchirho.contentchirho.WordChirho
import us.hinneh.readerchirho.mediachirho.ImageLoaderChirho
import us.hinneh.readerchirho.mediachirho.WordPictureChirho

/**
 * "Look closer": the word, its picture, meaning and grammar, and its recording. How meanings and
 * grammar are sourced is said once at the end of the reading key, not under every word (L.J., 2026-11-06).
 */
@Composable
fun WordSheetChirho(
    verseChirho: VerseChirho,
    wordChirho: WordChirho,
    greekChirho: Boolean,
    spanishChirho: Boolean,
    pictureChirho: WordPictureChirho?,
    imagesChirho: ImageLoaderChirho?,
    clipChirho: ClipChirho?,
    playingChirho: Boolean,
    onSpeakChirho: () -> Unit,
    onDismissChirho: () -> Unit,
) {
    ClosableSheetChirho(
        onDismissChirho,
        fullHeightChirho = true,
        titleChirho = {
            Text(
                sourceTextChirho(wordChirho.textChirho, greekChirho),
                fontFamily = SourceFontChirho,
                fontSize = 40.sp,
                style = MaterialTheme.typography.headlineSmall.copy(textDirection = if (greekChirho) TextDirection.Ltr else TextDirection.Rtl),
                modifier = Modifier.semantics { heading() },
            )
        },
    ) {
        Column(
            Modifier.fillMaxWidth().verticalScroll(rememberScrollState()).padding(horizontal = 20.dp).padding(bottom = 32.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp),
        ) {
            LexicalFormChirho(wordChirho, greekChirho)
            SpeechRowChirho(clipChirho, playingChirho, onSpeakChirho)
            // Only a reviewed root is shown; no published word has one yet.
            (wordChirho as? HebrewWordChirho)?.let { hebrewChirho -> hebrewChirho.rootTextChirho?.let { RootChirho(it, hebrewChirho.rootNoteChirho) } }
            PictureBlockChirho(pictureChirho, imagesChirho, wordChirho)
            HorizontalDivider(color = InkChirho.LINE_CHIRHO)
            Text(stringResource(R.string.meaning_morphology_chirho), style = MaterialTheme.typography.titleMedium, modifier = Modifier.semantics { heading() })
            MeaningChirho(verseChirho, wordChirho)
            Text(grammarChirho(wordChirho, spanishChirho), style = MaterialTheme.typography.bodyMedium)
            (wordChirho as? HebrewWordChirho)?.qereChirho?.takeIf { it.isNotEmpty() }?.let { readingsChirho ->
                Text(stringResource(R.string.qere_label_chirho), style = MaterialTheme.typography.labelLarge)
                for (readingChirho in readingsChirho) {
                    Text(sourceTextChirho(readingChirho.textChirho, false), fontFamily = SourceFontChirho, fontSize = 26.sp)
                    readingChirho.glossChirho?.let { Text(englishDataChirho(it), style = MaterialTheme.typography.bodyMedium) }
                }
                Text(stringResource(R.string.qere_note_chirho), style = MaterialTheme.typography.bodySmall)
            }
        }
    }
}

private val STRONG_NUMBER_CHIRHO = Regex("[HG][1-9][0-9]{0,4}[a-z]?")

/** The dictionary form and its Strong's number; OSHB's internal particle ids are not shown. */
@Composable
private fun LexicalFormChirho(wordChirho: WordChirho, greekChirho: Boolean) {
    val numberChirho = (wordChirho.lemmaIdChirho + ((wordChirho as? HebrewWordChirho)?.lemmaAugmentChirho ?: ""))
        .takeIf { STRONG_NUMBER_CHIRHO.matches(it) }
    val formChirho = wordChirho.lexicalFormChirho.takeIf { it.isNotBlank() }
    if (formChirho == null && numberChirho == null) return
    val labelChirho = stringResource(R.string.lexical_form_chirho)
    Text(
        buildAnnotatedString {
            if (formChirho != null) {
                append("$labelChirho ")
                append(sourceTextChirho(formChirho, greekChirho))
            }
            if (formChirho != null && numberChirho != null) append(" · ")
            if (numberChirho != null) append(numberChirho)
        },
        style = MaterialTheme.typography.bodySmall,
    )
}

@Composable
private fun RootChirho(rootChirho: String, noteChirho: String) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Text(stringResource(R.string.traditional_root_chirho) + " ", style = MaterialTheme.typography.bodyMedium)
        Text(sourceTextChirho(rootChirho, false), fontFamily = SourceFontChirho, fontSize = 24.sp)
    }
    Text(englishDataChirho(noteChirho), style = MaterialTheme.typography.bodySmall)
}

@Composable
private fun SpeechRowChirho(clipChirho: ClipChirho?, playingChirho: Boolean, onSpeakChirho: () -> Unit) {
    if (clipChirho == null) {
        Text(stringResource(R.string.no_word_recording_chirho), style = MaterialTheme.typography.bodySmall)
        return
    }
    Row(verticalAlignment = Alignment.CenterVertically) {
        OutlinedButton(onClick = onSpeakChirho) {
            Icon(painterResource(if (playingChirho) R.drawable.ic_stop_chirho else R.drawable.ic_speaker_chirho), contentDescription = null)
            Text(stringResource(if (playingChirho) R.string.stop_chirho else R.string.hear_word_chirho), modifier = Modifier.padding(start = 8.dp))
        }
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun PictureBlockChirho(pictureChirho: WordPictureChirho?, imagesChirho: ImageLoaderChirho?, wordChirho: WordChirho) {
    val cueChirho = cueForChirho(wordChirho, pictureChirho)
    val recordChirho = pictureChirho?.recordChirho
    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(14.dp)) {
        StickerChirho(
            imagesChirho, recordChirho?.assetPathChirho, recordChirho?.sha256Chirho, Color(cueChirho.outlineColorChirho),
            cueChirho.outlineChirho, !pictureChirho?.alternativesChirho.isNullOrEmpty(),
            recordChirho?.altChirho ?: stringResource(R.string.icon_unavailable_chirho), sizeChirho = 96.dp,
        )
        Column(Modifier.widthIn(max = 260.dp)) {
            if (recordChirho == null) {
                Text(stringResource(R.string.icon_unavailable_chirho), style = MaterialTheme.typography.bodyMedium)
            } else if (pictureChirho.generalChirho) {
                Text("${stringResource(R.string.general_picture_chirho)} ${recordChirho.contextualMeaningChirho}.", style = MaterialTheme.typography.bodyMedium)
            } else {
                Text(englishDataChirho(recordChirho.contextualMeaningChirho), style = MaterialTheme.typography.bodyMedium)
            }
        }
    }
    val alternativesChirho = pictureChirho?.alternativesChirho.orEmpty()
    if (alternativesChirho.isNotEmpty()) {
        Text(stringResource(R.string.other_meanings_chirho), style = MaterialTheme.typography.labelLarge)
        FlowRow(horizontalArrangement = Arrangement.spacedBy(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            for (alternativeChirho in alternativesChirho) {
                Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.widthIn(max = 120.dp)) {
                    StickerChirho(
                        imagesChirho, alternativeChirho.assetPathChirho, alternativeChirho.sha256Chirho, Color(cueChirho.outlineColorChirho),
                        cueChirho.outlineChirho, false, alternativeChirho.altChirho, sizeChirho = 64.dp,
                    )
                    Text(englishDataChirho(alternativeChirho.contextualMeaningChirho), style = MaterialTheme.typography.bodySmall)
                }
            }
        }
    }
}

/**
 * The word's meaning. Approved Global Bible Tools and Berean glosses are explained once in the
 * reading key; only a gloss written for Hinneh itself carries a label, so the two never blend.
 */
@Composable
private fun MeaningChirho(verseChirho: VerseChirho, wordChirho: WordChirho) {
    val glossChirho = wordChirho.glossChirho
    Text(
        when (glossChirho) {
            null -> AnnotatedString(stringResource(R.string.gloss_unavailable_chirho))
            "-" -> AnnotatedString(stringResource(R.string.not_separately_short_chirho))
            else -> englishDataChirho(glossChirho)
        },
        style = MaterialTheme.typography.bodyLarge,
    )
    if (glossChirho != null && wordChirho is HebrewWordChirho) {
        val originChirho = wordChirho.glossOriginChirho ?: (verseChirho as? HebrewVerseChirho)?.glossOriginChirho
        if (originChirho != "gbt_approved") Text(stringResource(R.string.origin_app_chirho), style = MaterialTheme.typography.bodySmall)
    }
}

/** One grammar line: the source's own English description, or the translated labels in Spanish. */
private fun grammarChirho(wordChirho: WordChirho, spanishChirho: Boolean): AnnotatedString =
    if (spanishChirho) AnnotatedString(morphologyForChirho(wordChirho, true)) else englishDataChirho(wordChirho.analysisChirho)
