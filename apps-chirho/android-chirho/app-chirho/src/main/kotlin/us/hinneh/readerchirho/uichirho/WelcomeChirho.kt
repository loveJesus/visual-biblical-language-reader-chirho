// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
package us.hinneh.readerchirho.uichirho

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.BiasAlignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.platform.LocalUriHandler
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.rememberTextMeasurer
import androidx.compose.ui.text.intl.LocaleList
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import us.hinneh.readerchirho.R
import us.hinneh.readerchirho.contentchirho.GreekWordChirho
import us.hinneh.readerchirho.contentchirho.HebrewWordChirho
import us.hinneh.readerchirho.contentchirho.WordChirho

/**
 * The first-run and new-version welcome (GPT, DM #3642 and #3645), recomposed for unit 176 after L.J.: "the 0.1.3 android
 * welcome text is very uninviting nothing like the polished apps with beautiful onboarding" (GPT, DM #3673 and #3679).
 * One screen, not a wizard: root's watercolor fading into the paper, a small brand line, a short headline and sentence,
 * a card with two real words drawn as the reader draws them, and one quiet line about licensing. Start reading is
 * pinned at the bottom with the quick tour and Info beside it, so on a small screen the art and words scroll above it
 * and the way in never leaves the screen. Where the tour and Info cannot share one row (Spanish on a narrow phone),
 * Info becomes a quiet link after the open-materials line instead (GPT, DM #3702). At accessibility text sizes only
 * Start reading stays pinned and the tour and Info follow the words at full width, so the footer never grows over the
 * screen (root's iOS XXXL lesson, GPT DM #3692). Nothing is fetched or played here; Back starts reading.
 */
@Composable
fun WelcomeChirho(spanishChirho: Boolean, onStartChirho: () -> Unit) {
    val uriHandlerChirho = LocalUriHandler.current
    var infoOpenChirho by rememberSaveable { mutableStateOf(false) }
    val largeTextChirho = LocalDensity.current.fontScale >= LARGE_TEXT_SCALE_CHIRHO
    val onTourChirho: () -> Unit = { openLinkChirho(uriHandlerChirho, tourUrlChirho(spanishChirho)) }
    val onInfoChirho: () -> Unit = { infoOpenChirho = true }
    BackHandler(onBack = onStartChirho)
    BoxWithConstraints(Modifier.fillMaxSize()) {
        val infoInBarChirho = !largeTextChirho && secondaryFitsChirho(minOf(maxWidth, BAR_MAX_WIDTH_CHIRHO) - BAR_PADDING_CHIRHO * 2)
        Scaffold(
            containerColor = InkChirho.PAPER_CHIRHO,
            bottomBar = {
                WelcomeActionsChirho(
                    onStartChirho = onStartChirho,
                    secondaryChirho = if (largeTextChirho) {
                        null
                    } else {
                        { WelcomeSecondaryChirho(onTourChirho, onInfoChirho.takeIf { infoInBarChirho }, stackedChirho = false) }
                    },
                )
            },
        ) { paddingChirho ->
            BoxWithConstraints(Modifier.fillMaxSize().padding(paddingChirho)) {
                // The picture takes about a third of the height (about 170 dp on a narrow phone, as on iOS; GPT DM #3696),
                // never more than its own 3:2 shape, so the real example and the open-materials line show before scrolling.
                val heroHeightChirho = minOf(maxWidth * 2 / 3, maxHeight * HERO_SHARE_CHIRHO).coerceAtLeast(140.dp)
                Column(
                    Modifier.fillMaxSize().verticalScroll(rememberScrollState()),
                    horizontalAlignment = Alignment.CenterHorizontally,
                ) {
                    WelcomeHeroChirho(Modifier.fillMaxWidth().height(heroHeightChirho))
                    Column(
                        Modifier.widthIn(max = 560.dp).fillMaxWidth().padding(horizontal = 24.dp).padding(bottom = 24.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp),
                    ) {
                        WelcomeBrandChirho()
                        Text(
                            stringResource(R.string.welcome_title_chirho),
                            style = MaterialTheme.typography.headlineSmall.copy(fontSize = 32.sp, lineHeight = 38.sp),
                            modifier = Modifier.semantics { heading() },
                        )
                        Text(stringResource(R.string.welcome_what_chirho), style = MaterialTheme.typography.bodyLarge)
                        WelcomeSampleCardChirho(spanishChirho, largeTextChirho, Modifier.padding(top = 4.dp, bottom = 4.dp))
                        Column {
                            Text(stringResource(R.string.welcome_open_chirho), style = MaterialTheme.typography.bodyMedium.copy(color = InkChirho.MARKER_CHIRHO))
                            // The quiet link after the licensing line, aligned with its text, when Info has no room in the bar.
                            if (!largeTextChirho && !infoInBarChirho) WelcomeInfoChirho(onInfoChirho, Modifier.offset(x = (-12).dp))
                        }
                        Text(stringResource(R.string.welcome_tour_chirho), style = MaterialTheme.typography.bodyMedium.copy(color = InkChirho.MARKER_CHIRHO))
                        if (largeTextChirho) WelcomeSecondaryChirho(onTourChirho, onInfoChirho, stackedChirho = true)
                    }
                }
            }
        }
    }
    if (infoOpenChirho) InfoSheetChirho(spanishChirho, onDismissChirho = { infoOpenChirho = false })
}

/**
 * Whether the quick tour and Info fit on one row of [widthChirho] in the bar, measured from their own labels in the
 * buttons' text style with the buttons' padding, so a long Spanish label moves Info out of the bar rather than wrapping
 * it onto a third line.
 */
@Composable
private fun secondaryFitsChirho(widthChirho: Dp): Boolean {
    val measurerChirho = rememberTextMeasurer()
    val styleChirho = MaterialTheme.typography.labelLarge
    val tourChirho = stringResource(R.string.tour_chirho) + " ↗"
    val infoChirho = stringResource(R.string.info_chirho)
    val densityChirho = LocalDensity.current
    return with(densityChirho) {
        val tourPxChirho = measurerChirho.measure(tourChirho, styleChirho).size.width + (OUTLINED_PADDING_CHIRHO * 2).roundToPx()
        val infoPxChirho = measurerChirho.measure(infoChirho, styleChirho).size.width + (TEXT_PADDING_CHIRHO * 2).roundToPx()
        tourPxChirho + infoPxChirho + ROW_GAP_CHIRHO.roundToPx() <= widthChirho.roundToPx()
    }
}

/**
 * The small brand line: "Hinneh" spaced out as a quiet mark, then the Hebrew word it comes from, unspaced (letter spacing
 * would pull its points and letters apart) and tagged Hebrew so TalkBack reads it with a Hebrew voice.
 */
@Composable
private fun WelcomeBrandChirho() {
    val nameChirho = stringResource(R.string.app_name_chirho)
    val hebrewChirho = stringResource(R.string.brand_hebrew_chirho)
    Text(
        buildAnnotatedString {
            withStyle(SpanStyle(letterSpacing = 2.sp)) { append(nameChirho) }
            append(" · ")
            withStyle(SpanStyle(localeList = LocaleList("he"), fontSize = 15.sp)) { append(hebrewChirho) }
        },
        style = MaterialTheme.typography.labelSmall.copy(color = InkChirho.ACCENT_CHIRHO, letterSpacing = 0.sp),
    )
}

/**
 * Root's watercolor (CC0; workspace-chirho/onboarding-chirho/2026-11-08-chirho/hero-manifest-chirho.json): an open book
 * on stone among olive branches above the lake. It crops from the centre, a little below middle, so the book and
 * the water stay in view, and its own paper wash deepens into the page colour so no seam shows.
 */
@Composable
private fun WelcomeHeroChirho(modifier: Modifier) {
    Box(modifier) {
        Image(
            painterResource(R.drawable.welcome_hero_chirho),
            contentDescription = null,
            contentScale = ContentScale.Crop,
            alignment = BiasAlignment(horizontalBias = 0f, verticalBias = 0.25f),
            modifier = Modifier.matchParentSize(),
        )
        Box(Modifier.matchParentSize().background(Brush.verticalGradient(0.72f to Color.Transparent, 1f to InkChirho.PAPER_CHIRHO)))
    }
}

/**
 * Two real words, drawn as the reader draws them (gender color, number line, small grammar marks), with their published
 * meanings and references. They show what reading here looks like instead of explaining it. With large text each
 * meaning goes under its word rather than squeezing beside it.
 */
@Composable
private fun WelcomeSampleCardChirho(spanishChirho: Boolean, largeTextChirho: Boolean, modifier: Modifier) {
    val shapeChirho = RoundedCornerShape(12.dp)
    Column(
        modifier
            .fillMaxWidth()
            .background(InkChirho.CARD_CHIRHO, shapeChirho)
            .border(1.dp, InkChirho.LINE_CHIRHO, shapeChirho)
            .padding(horizontal = 16.dp, vertical = 14.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        for (sampleChirho in WELCOME_SAMPLES_CHIRHO) {
            val glossChirho = sampleChirho.glossChirho(spanishChirho)
            val referenceChirho = sampleChirho.referenceChirho(spanishChirho)
            val wordChirho: @Composable () -> Unit = {
                WordSurfaceChirho(
                    sampleChirho.wordChirho, sampleChirho.wordChirho is GreekWordChirho,
                    cueForChirho(sampleChirho.wordChirho, null), speakerChirho = false, modifier = Modifier,
                )
            }
            val meaningChirho: @Composable () -> Unit = {
                Text(glossChirho, style = MaterialTheme.typography.titleMedium)
                Text(referenceChirho, style = MaterialTheme.typography.bodySmall.copy(color = InkChirho.MARKER_CHIRHO))
            }
            if (largeTextChirho) {
                Column(Modifier.semantics(mergeDescendants = true) {}, verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    wordChirho()
                    meaningChirho()
                }
            } else {
                Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.semantics(mergeDescendants = true) {}) {
                    Box(Modifier.widthIn(min = 112.dp), contentAlignment = Alignment.Center) { wordChirho() }
                    Column(Modifier.padding(start = 16.dp)) { meaningChirho() }
                }
            }
        }
        Text(stringResource(R.string.welcome_sample_chirho), style = MaterialTheme.typography.bodySmall.copy(color = InkChirho.MARKER_CHIRHO))
    }
}

/**
 * The pinned way in: Start reading first and widest, then, at ordinary text sizes, the quick tour and Info. The bar
 * keeps clear of the navigation bar.
 */
@Composable
private fun WelcomeActionsChirho(onStartChirho: () -> Unit, secondaryChirho: (@Composable () -> Unit)?) {
    Column(Modifier.fillMaxWidth().background(InkChirho.PAPER_CHIRHO).navigationBarsPadding()) {
        HorizontalDivider(color = InkChirho.LINE_CHIRHO)
        Column(
            Modifier.widthIn(max = BAR_MAX_WIDTH_CHIRHO).fillMaxWidth().align(Alignment.CenterHorizontally)
                .padding(horizontal = BAR_PADDING_CHIRHO, vertical = 10.dp),
            verticalArrangement = Arrangement.spacedBy(4.dp),
        ) {
            // The colorless label style lets the button's white show (4.5:1 on teal), as StepButtonChirho notes.
            Button(onClick = onStartChirho, modifier = Modifier.fillMaxWidth().heightIn(min = 52.dp)) {
                Text(stringResource(R.string.welcome_start_chirho), style = MaterialTheme.typography.labelLarge.copy(fontSize = 17.sp))
            }
            secondaryChirho?.invoke()
        }
    }
}

/**
 * The quick tour and Info, quiet but at full touch size, in the ink colour (10:1 on paper) rather than teal text (4.1:1)
 * so a quiet button is never a faint one. Side by side under Start reading (Info only when [onInfoChirho] is given), or
 * [stackedChirho] full width at the end of the words when the text is large.
 */
@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun WelcomeSecondaryChirho(onTourChirho: () -> Unit, onInfoChirho: (() -> Unit)?, stackedChirho: Boolean) {
    val widthChirho = if (stackedChirho) Modifier.fillMaxWidth() else Modifier
    val buttonsChirho: @Composable () -> Unit = {
        OutlinedButton(
            onClick = onTourChirho,
            colors = ButtonDefaults.outlinedButtonColors(contentColor = InkChirho.INK_CHIRHO),
            border = BorderStroke(1.dp, InkChirho.MARKER_CHIRHO),
            modifier = widthChirho,
        ) {
            Text(stringResource(R.string.tour_chirho) + " ↗", textAlign = TextAlign.Center)
        }
        if (onInfoChirho != null) WelcomeInfoChirho(onInfoChirho, widthChirho)
    }
    if (stackedChirho) {
        Column(Modifier.fillMaxWidth().padding(top = 4.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) { buttonsChirho() }
    } else {
        FlowRow(
            Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp, Alignment.CenterHorizontally),
            verticalArrangement = Arrangement.spacedBy(0.dp),
        ) { buttonsChirho() }
    }
}

/** Info as a quiet underlined ink button; TalkBack hears what it opens. */
@Composable
private fun WelcomeInfoChirho(onInfoChirho: () -> Unit, modifier: Modifier) {
    val infoLabelChirho = stringResource(R.string.info_link_chirho)
    TextButton(
        onClick = onInfoChirho,
        colors = ButtonDefaults.textButtonColors(contentColor = InkChirho.INK_CHIRHO),
        modifier = modifier.semantics { contentDescription = infoLabelChirho },
    ) {
        Text(stringResource(R.string.info_chirho), textDecoration = TextDecoration.Underline, textAlign = TextAlign.Center)
    }
}

private val BAR_MAX_WIDTH_CHIRHO = 560.dp
private val BAR_PADDING_CHIRHO = 20.dp
/** Material3's own button paddings and the row's gap, which the fit check adds to the measured labels. */
private val OUTLINED_PADDING_CHIRHO = 24.dp
private val TEXT_PADDING_CHIRHO = 12.dp
private val ROW_GAP_CHIRHO = 8.dp

/** From this effective text scale (the device's font size times Hinneh's text size) only Start reading stays pinned. */
private const val LARGE_TEXT_SCALE_CHIRHO = 1.5f

/** The hero's share of the height above the pinned bar. */
private const val HERO_SHARE_CHIRHO = 0.31f

/**
 * One real word for the welcome's example card (unit 176): the published token exactly as the app decodes it, its
 * Spanish gloss from the approved Global Bible Tools layer, and its reference. WelcomeSampleTestChirho checks every
 * field against the static content and gloss files, so the example can never drift into made-up text.
 */
internal class WelcomeSampleChirho(
    val wordChirho: WordChirho,
    private val spanishGlossChirho: String,
    private val referenceChirho: String,
    private val spanishReferenceChirho: String,
) {
    fun glossChirho(spanishChirho: Boolean): String = if (spanishChirho) spanishGlossChirho else wordChirho.glossChirho.orEmpty()

    fun referenceChirho(spanishChirho: Boolean): String = if (spanishChirho) spanishReferenceChirho else referenceChirho
}

/**
 * Genesis 1:1 בְּרֵאשִׁית and John 1:1 Λόγος, from /content-chirho/ and /glosses-chirho/es-chirho/. The source-text fields are
 * written as \\u escapes copied from the published JSON, so their exact mark order survives any editor or normalizer.
 */
internal val WELCOME_SAMPLES_CHIRHO = listOf(
    WelcomeSampleChirho(
        HebrewWordChirho(
            idChirho = "01xeN",
            textChirho = "\u05d1\u05bc\u05b0\u05e8\u05b5\u05d0\u05e9\u05c1\u05b4\u0596\u05d9\u05ea",
            segmentsChirho = listOf("\u05d1\u05bc\u05b0", "\u05e8\u05b5\u05d0\u05e9\u05c1\u05b4\u0596\u05d9\u05ea"),
            startChirho = 0,
            endChirho = 12,
            rawMorphologyChirho = "HR/Ncfsa",
            lemmaIdChirho = "H7225",
            lemmaAugmentChirho = null,
            lexicalFormChirho = "\u05e8\u05b5\u05d0\u05e9\u05c1\u05b4\u05d9\u05ea",
            posChirho = "noun",
            genderChirho = "feminine",
            numberChirho = "singular",
            stateChirho = "absolute",
            rootTextChirho = null,
            rootEntryIdChirho = null,
            rootStatusChirho = "unresolved",
            rootNoteChirho = "Not reviewed: no root is assigned to this word yet.",
            glossChirho = "In the beginning",
            analysisChirho = "Preposition + noun, common, feminine, singular, absolute",
            sourceNoteChirho = "Uncurated: lemma and morphology as OSHB gives them; the analysis is generated from its code tables. English gloss: Global Bible Tools approved export.",
        ),
        spanishGlossChirho = "En principio",
        referenceChirho = "Genesis 1:1",
        spanishReferenceChirho = "Génesis 1:1",
    ),
    WelcomeSampleChirho(
        GreekWordChirho(
            idChirho = "John.1.1!5",
            textChirho = "\u039b\u1f79\u03b3\u03bf\u03c2",
            segmentsChirho = listOf("\u039b\u1f79\u03b3\u03bf\u03c2"),
            startChirho = 13,
            endChirho = 18,
            rawMorphologyChirho = "N-NSM",
            rawFormMorphologyChirho = "N-NSM",
            rawStrongsChirho = "3056",
            lemmaIdChirho = "G3056",
            lexicalFormChirho = "\u03bb\u1f79\u03b3\u03bf\u03c2",
            partOfSpeechChirho = "noun",
            caseChirho = "nominative",
            numberChirho = "singular",
            genderChirho = "masculine",
            glossChirho = "Word",
            analysisChirho = "Noun, nominative, singular, masculine",
            sourceNoteChirho = "Uncurated: Nestle 1904 word with the biblicalhumanities CC0 parse as given; the analysis is generated from parsing.txt. English gloss: Berean Interlinear Bible, public domain as Berean states; not a GBT approval.",
        ),
        spanishGlossChirho = "Verbo",
        referenceChirho = "John 1:1",
        spanishReferenceChirho = "Juan 1:1",
    ),
)
