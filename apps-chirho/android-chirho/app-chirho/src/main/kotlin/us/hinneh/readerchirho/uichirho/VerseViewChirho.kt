// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
package us.hinneh.readerchirho.uichirho

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.IntrinsicSize
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.absolutePadding
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.material3.ripple
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.ui.AbsoluteAlignment
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.clearAndSetSemantics
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.stateDescription
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.intl.LocaleList
import androidx.compose.ui.text.style.TextDirection
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import us.hinneh.readerchirho.R
import us.hinneh.readerchirho.contentchirho.GreekWordChirho
import us.hinneh.readerchirho.contentchirho.HebrewWordChirho
import us.hinneh.readerchirho.contentchirho.VerseChirho
import us.hinneh.readerchirho.contentchirho.WordChirho
import us.hinneh.readerchirho.domainchirho.CuesChirho
import us.hinneh.readerchirho.domainchirho.GroupElementChirho
import us.hinneh.readerchirho.domainchirho.LabelsChirho
import us.hinneh.readerchirho.domainchirho.PaletteChirho
import us.hinneh.readerchirho.domainchirho.PatternChirho
import us.hinneh.readerchirho.domainchirho.VerseLayoutChirho
import us.hinneh.readerchirho.domainchirho.WordCueChirho
import us.hinneh.readerchirho.mediachirho.ImageLoaderChirho
import us.hinneh.readerchirho.mediachirho.WordPictureChirho

/** Source text carries its language so TalkBack reads it with a Hebrew or Greek voice. */
fun sourceTextChirho(textChirho: String, greekChirho: Boolean): AnnotatedString = buildAnnotatedString {
    withStyle(SpanStyle(localeList = LocaleList(if (greekChirho) "el" else "he"))) { append(textChirho) }
}

/** Published notes, glosses and alt text are English data; TalkBack keeps an English voice for them. */
fun englishDataChirho(textChirho: String): AnnotatedString =
    AnnotatedString(textChirho, SpanStyle(localeList = LocaleList("en")))

fun cueForChirho(wordChirho: WordChirho, pictureChirho: WordPictureChirho?): WordCueChirho = when (wordChirho) {
    is HebrewWordChirho -> CuesChirho.hebrewChirho(wordChirho)
    is GreekWordChirho -> CuesChirho.greekChirho(wordChirho, hasAlternativesChirho = !pictureChirho?.alternativesChirho.isNullOrEmpty())
}

fun morphologyForChirho(wordChirho: WordChirho, spanishChirho: Boolean): String = when (wordChirho) {
    is HebrewWordChirho -> LabelsChirho.hebrewMorphologyChirho(wordChirho, spanishChirho)
    is GreekWordChirho -> LabelsChirho.greekAnalysisChirho(wordChirho, spanishChirho)
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun VerseViewChirho(
    verseChirho: VerseChirho,
    greekChirho: Boolean,
    spanishChirho: Boolean,
    picturesChirho: Map<String, WordPictureChirho>,
    imagesChirho: ImageLoaderChirho?,
    hasRecordingChirho: (WordChirho) -> Boolean,
    playingWordChirho: String?,
    onWordChirho: (WordChirho) -> Unit,
    onSpeakChirho: (WordChirho) -> Unit,
) {
    val groupsChirho = VerseLayoutChirho.groupsChirho(verseChirho)
    val directionChirho = if (greekChirho) LayoutDirection.Ltr else LayoutDirection.Rtl
    CompositionLocalProvider(LocalLayoutDirection provides directionChirho) {
        FlowRow(
            modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp),
            horizontalArrangement = Arrangement.spacedBy(10.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            for (groupChirho in groupsChirho) {
                Row(verticalAlignment = Alignment.Top) {
                    for (elementChirho in groupChirho) {
                        when (elementChirho) {
                            is GroupElementChirho.JoinerChirho -> MarkTextChirho(elementChirho.textChirho, greekChirho)
                            is GroupElementChirho.WordElementChirho -> {
                                if (elementChirho.leadingChirho.isNotEmpty()) MarkTextChirho(elementChirho.leadingChirho, greekChirho)
                                val wordChirho = elementChirho.wordChirho
                                WordBoxChirho(
                                    wordChirho = wordChirho,
                                    greekChirho = greekChirho,
                                    spanishChirho = spanishChirho,
                                    pictureChirho = picturesChirho[wordChirho.idChirho],
                                    imagesChirho = imagesChirho,
                                    hasRecordingChirho = hasRecordingChirho(wordChirho),
                                    playingChirho = playingWordChirho == wordChirho.idChirho,
                                    onWordChirho = { onWordChirho(wordChirho) },
                                    onSpeakChirho = { onSpeakChirho(wordChirho) },
                                )
                                if (elementChirho.trailingChirho.isNotEmpty()) MarkTextChirho(elementChirho.trailingChirho, greekChirho)
                            }
                        }
                    }
                }
            }
        }
    }
}

/** Punctuation, maqqef and other source marks between or beside words; read with the words. */
@Composable
private fun MarkTextChirho(textChirho: String, greekChirho: Boolean) {
    Text(
        sourceTextChirho(textChirho, greekChirho),
        fontFamily = SourceFontChirho,
        fontSize = 30.sp,
        color = InkChirho.INK_CHIRHO,
        // Level with the word text below its cue row and the reserved half of the corner chip.
        modifier = Modifier.padding(top = 16.dp + SPEAKER_HALF_CHIRHO),
    )
}

@Composable
private fun WordBoxChirho(
    wordChirho: WordChirho,
    greekChirho: Boolean,
    spanishChirho: Boolean,
    pictureChirho: WordPictureChirho?,
    imagesChirho: ImageLoaderChirho?,
    hasRecordingChirho: Boolean,
    playingChirho: Boolean,
    onWordChirho: () -> Unit,
    onSpeakChirho: () -> Unit,
) {
    val cueChirho = cueForChirho(wordChirho, pictureChirho)
    val lookCloserChirho = stringResource(R.string.look_closer_chirho)
    val pictureDescriptionChirho = when {
        pictureChirho == null -> stringResource(R.string.icon_unavailable_chirho)
        pictureChirho.generalChirho -> stringResource(R.string.icon_general_chirho) + ": " + pictureChirho.recordChirho.altChirho
        else -> stringResource(R.string.icon_contextual_chirho) + ": " + pictureChirho.recordChirho.altChirho
    }
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier
            .semantics(mergeDescendants = true) {
                stateDescription = morphologyForChirho(wordChirho, spanishChirho)
            }
            .clickable(onClickLabel = lookCloserChirho, role = Role.Button, onClick = onWordChirho),
    ) {
        // The pronunciation chip is centered on the word surface's physical upper-right corner (L.J.).
        Box {
            WordSurfaceChirho(
                wordChirho, greekChirho, cueChirho, speakerChirho = hasRecordingChirho,
                modifier = Modifier.padding(top = SPEAKER_HALF_CHIRHO).absolutePadding(right = SPEAKER_HALF_CHIRHO),
            )
            if (hasRecordingChirho) {
                SpeakerChirho(
                    labelChirho = stringResource(R.string.pronounce_word_chirho, wordChirho.textChirho),
                    playingChirho = playingChirho,
                    onSpeakChirho = onSpeakChirho,
                    modifier = Modifier.align(AbsoluteAlignment.TopRight).offset(x = SPEAKER_REACH_CHIRHO, y = -SPEAKER_REACH_CHIRHO),
                )
            }
        }
        StickerChirho(
            imagesChirho = imagesChirho,
            assetPathChirho = pictureChirho?.recordChirho?.assetPathChirho,
            sha256Chirho = pictureChirho?.recordChirho?.sha256Chirho,
            outlineColorChirho = Color(cueChirho.outlineColorChirho),
            outlineChirho = cueChirho.outlineChirho,
            doubleChirho = !pictureChirho?.alternativesChirho.isNullOrEmpty(),
            descriptionChirho = pictureDescriptionChirho,
        )
    }
}

private val SPEAKER_CHIP_CHIRHO = 22.dp
private val SPEAKER_TOUCH_CHIRHO = 32.dp
private val SPEAKER_HALF_CHIRHO = SPEAKER_CHIP_CHIRHO / 2
private val SPEAKER_REACH_CHIRHO = (SPEAKER_TOUCH_CHIRHO - SPEAKER_CHIP_CHIRHO) / 2

/**
 * A small white chip with a thin grey border; its own button, so a tap plays the word without
 * opening Look closer. The touch node is larger than the chip (and Compose widens small targets).
 */
@Composable
private fun SpeakerChirho(labelChirho: String, playingChirho: Boolean, onSpeakChirho: () -> Unit, modifier: Modifier) {
    Box(
        contentAlignment = Alignment.Center,
        modifier = modifier
            .size(SPEAKER_TOUCH_CHIRHO)
            .clickable(
                interactionSource = null,
                indication = ripple(bounded = false, radius = SPEAKER_TOUCH_CHIRHO / 2),
                role = Role.Button,
                onClick = onSpeakChirho,
            )
            .semantics { contentDescription = labelChirho },
    ) {
        Box(
            contentAlignment = Alignment.Center,
            modifier = Modifier
                .size(SPEAKER_CHIP_CHIRHO)
                .background(Color.White, RoundedCornerShape(6.dp))
                .border(1.dp, InkChirho.SPEAKER_EDGE_CHIRHO, RoundedCornerShape(6.dp)),
        ) {
            Icon(
                painterResource(if (playingChirho) R.drawable.ic_stop_chirho else R.drawable.ic_speaker_chirho),
                contentDescription = null,
                tint = if (playingChirho) InkChirho.ACCENT_CHIRHO else InkChirho.SPEAKER_ICON_CHIRHO,
                modifier = Modifier.size(14.dp),
            )
        }
    }
}

/** The colored word surface: gender background, number underline, form-pattern line, cue marks. */
@Composable
private fun WordSurfaceChirho(wordChirho: WordChirho, greekChirho: Boolean, cueChirho: WordCueChirho, speakerChirho: Boolean, modifier: Modifier) {
    val underlineChirho = cueChirho.underlineChirho?.let { Color(it) }
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = modifier
            .width(IntrinsicSize.Max)
            .widthIn(min = if (cueChirho.leftMarkerChirho.isNotEmpty() && cueChirho.rightMarkerChirho.isNotEmpty()) (if (speakerChirho) 70.dp else 56.dp) else 0.dp)
            .background(cueChirho.backgroundChirho?.let { Color(it) } ?: Color.Transparent, RoundedCornerShape(4.dp))
            .drawBehind {
                val strokeChirho = 3.dp.toPx()
                if (underlineChirho != null) {
                    drawLine(underlineChirho, Offset(0f, size.height - strokeChirho / 2), Offset(size.width, size.height - strokeChirho / 2), strokeChirho)
                }
                if (cueChirho.patternChirho != PatternChirho.NONE_CHIRHO) {
                    val effectChirho = if (cueChirho.patternChirho == PatternChirho.DOTTED_CHIRHO) PathEffect.dashPathEffect(floatArrayOf(3f, 4f)) else null
                    val insetChirho = 2.dp.toPx()
                    drawLine(Color(PaletteChirho.PATTERN_CHIRHO), Offset(insetChirho, 4.dp.toPx()), Offset(size.width - insetChirho, 4.dp.toPx()), strokeChirho, pathEffect = effectChirho)
                }
            }
            .padding(start = 4.dp, end = 4.dp, bottom = 3.dp),
    ) {
        // Cue marks sit physically left, centre and right on every script, as on the website.
        CompositionLocalProvider(LocalLayoutDirection provides LayoutDirection.Ltr) {
            Box(Modifier.fillMaxWidth().height(17.dp)) {
                MarkerChirho(cueChirho.leftMarkerChirho, Modifier.align(AbsoluteAlignment.TopLeft))
                MarkerChirho(cueChirho.centerMarkerChirho, Modifier.align(Alignment.TopCenter))
                // As on the website, the right cue moves inward so the corner chip never covers it.
                MarkerChirho(cueChirho.rightMarkerChirho, Modifier.align(AbsoluteAlignment.TopRight).absolutePadding(right = if (speakerChirho) 12.dp else 0.dp))
            }
        }
        Text(
            text = wordTextChirho(wordChirho, greekChirho),
            fontFamily = SourceFontChirho,
            fontSize = 32.sp,
            color = InkChirho.INK_CHIRHO,
            style = TextStyle(textDirection = if (greekChirho) TextDirection.Ltr else TextDirection.Rtl),
        )
    }
}

/** Hebrew prefixes and suffixes are separated by small teaching dots, never inside a letter. */
private fun wordTextChirho(wordChirho: WordChirho, greekChirho: Boolean): AnnotatedString = buildAnnotatedString {
    withStyle(SpanStyle(localeList = LocaleList(if (greekChirho) "el" else "he"))) {
        if (greekChirho) {
            append(wordChirho.textChirho)
        } else {
            wordChirho.segmentsChirho.forEachIndexed { indexChirho, segmentChirho ->
                if (indexChirho > 0) withStyle(SpanStyle(color = Color(0xFF7C877E), fontSize = 20.sp)) { append("·") }
                append(segmentChirho)
            }
        }
    }
}

@Composable
private fun MarkerChirho(textChirho: String, modifier: Modifier) {
    if (textChirho.isEmpty()) return
    Text(
        textChirho,
        fontFamily = SourceFontChirho,
        fontSize = 13.sp,
        color = InkChirho.MARKER_CHIRHO,
        modifier = modifier.padding(horizontal = 2.dp).clearAndSetSemantics { },
    )
}
