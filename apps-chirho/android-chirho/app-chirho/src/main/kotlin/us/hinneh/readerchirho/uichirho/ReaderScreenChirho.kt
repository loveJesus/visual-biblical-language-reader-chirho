// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
package us.hinneh.readerchirho.uichirho

import android.view.Surface
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.LiveRegionMode
import androidx.compose.ui.semantics.liveRegion
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.launch
import us.hinneh.readerchirho.R
import us.hinneh.readerchirho.audiochirho.AudioSelectionChirho
import us.hinneh.readerchirho.audiochirho.GreekRenditionChirho
import us.hinneh.readerchirho.audiochirho.PlaybackChirho
import us.hinneh.readerchirho.audiochirho.VerseRecordingsChirho
import us.hinneh.readerchirho.contentchirho.HebrewVerseChirho
import us.hinneh.readerchirho.contentchirho.LoadedVerseChirho
import us.hinneh.readerchirho.contentchirho.WordChirho
import us.hinneh.readerchirho.mediachirho.ImageLoaderChirho
import us.hinneh.readerchirho.statechirho.FailureChirho
import us.hinneh.readerchirho.statechirho.InterfaceLanguageChirho
import us.hinneh.readerchirho.statechirho.OptionalChirho
import us.hinneh.readerchirho.statechirho.ReaderUiStateChirho
import us.hinneh.readerchirho.statechirho.VerseLoadChirho
import us.hinneh.readerchirho.videochirho.VideoRecordChirho

/** Everything the reader screen can ask for; the view model and tests both implement it. */
interface ReaderActionsChirho {
    fun onBookChirho(idChirho: String)
    fun onChapterChirho(numberChirho: Int)
    fun onVerseChirho(numberChirho: Int)
    fun onStepChirho(forwardChirho: Boolean)
    fun onRetryChirho()
    fun onToggleWordChirho(wordChirho: WordChirho)
    fun onToggleVerseChirho()
    fun onVideoSurfaceChirho(surfaceChirho: Surface?)
    fun onRenditionChirho(renditionChirho: GreekRenditionChirho)
    fun onSpeedChirho(speedChirho: Float)
    fun onLanguageChirho(languageChirho: InterfaceLanguageChirho)
    fun onTextScaleChirho(scaleChirho: Float)
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ReaderScreenChirho(
    stateChirho: ReaderUiStateChirho,
    playbackChirho: PlaybackChirho,
    languageChirho: InterfaceLanguageChirho,
    textScaleChirho: Float,
    spanishChirho: Boolean,
    imagesChirho: ImageLoaderChirho?,
    actionsChirho: ReaderActionsChirho,
) {
    var settingsOpenChirho by rememberSaveable { mutableStateOf(false) }
    var readingKeyOpenChirho by rememberSaveable { mutableStateOf(false) }
    val scrollChirho = rememberScrollState()
    val scopeChirho = rememberCoroutineScope()
    // Stepping from below the verse or by swiping returns to the top, so the next verse starts at its heading.
    val stepToTopChirho: (Boolean) -> Unit = { forwardChirho ->
        actionsChirho.onStepChirho(forwardChirho)
        scopeChirho.launch { scrollChirho.scrollTo(0) }
    }
    val swipeChirho = rememberVerseSwipeChirho(stateChirho::canStepChirho, stepToTopChirho)
    Scaffold(
        containerColor = InkChirho.PAPER_CHIRHO,
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(stringResource(R.string.app_name_chirho), style = MaterialTheme.typography.headlineSmall)
                        Text(stringResource(R.string.tagline_chirho), style = MaterialTheme.typography.bodySmall)
                    }
                },
                actions = {
                    IconButton(onClick = { readingKeyOpenChirho = true }) {
                        Icon(painterResource(R.drawable.ic_help_chirho), contentDescription = stringResource(R.string.reading_key_chirho))
                    }
                    IconButton(onClick = { settingsOpenChirho = true }) {
                        Icon(painterResource(R.drawable.ic_settings_chirho), contentDescription = stringResource(R.string.settings_chirho))
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = InkChirho.PAPER_CHIRHO),
            )
        },
    ) { paddingChirho ->
        Box(Modifier.fillMaxSize().padding(paddingChirho).verseSwipeChirho(swipeChirho), contentAlignment = Alignment.TopCenter) {
            Column(
                Modifier.widthIn(max = 840.dp).fillMaxWidth().verticalScroll(scrollChirho).padding(horizontal = 16.dp, vertical = 8.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                PassageControlsChirho(
                    stateChirho, spanishChirho,
                    onBookChirho = actionsChirho::onBookChirho,
                    onChapterChirho = actionsChirho::onChapterChirho,
                    onVerseChirho = actionsChirho::onVerseChirho,
                    onStepChirho = actionsChirho::onStepChirho,
                )
                when (val verseChirho = stateChirho.verseChirho) {
                    VerseLoadChirho.LoadingChirho -> LoadingChirho(stateChirho, spanishChirho)
                    is VerseLoadChirho.FailedChirho -> FailedChirho(verseChirho.failureChirho, actionsChirho::onRetryChirho)
                    is VerseLoadChirho.ReadyChirho -> ReadyVerseChirho(
                        stateChirho, verseChirho.loadedChirho, playbackChirho, spanishChirho, imagesChirho, actionsChirho, stepToTopChirho,
                    )
                }
            }
        }
    }
    if (readingKeyOpenChirho) {
        ReadingKeySheetChirho(
            greekChirho = stateChirho.catalogueChirho?.bookChirho(stateChirho.passageChirho.bookIdChirho)?.greekChirho == true,
            spanishChirho = spanishChirho,
            onDismissChirho = { readingKeyOpenChirho = false },
        )
    }
    if (settingsOpenChirho) {
        SettingsSheetChirho(
            languageChirho = languageChirho,
            spanishChirho = spanishChirho,
            textScaleChirho = textScaleChirho,
            renditionChirho = stateChirho.renditionChirho,
            speedChirho = stateChirho.speedChirho,
            onLanguageChirho = actionsChirho::onLanguageChirho,
            onTextScaleChirho = actionsChirho::onTextScaleChirho,
            onRenditionChirho = actionsChirho::onRenditionChirho,
            onSpeedChirho = actionsChirho::onSpeedChirho,
            onDismissChirho = { settingsOpenChirho = false },
        )
    }
}

@Composable
private fun LoadingChirho(stateChirho: ReaderUiStateChirho, spanishChirho: Boolean) {
    val passageChirho = stateChirho.passageChirho
    val bookChirho = stateChirho.catalogueChirho?.bookChirho(passageChirho.bookIdChirho)
    Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(vertical = 24.dp)) {
        CircularProgressIndicator(Modifier.size(22.dp), strokeWidth = 2.dp)
        Text(
            stringResource(
                R.string.loading_chirho, bookLabelChirho(bookChirho, passageChirho.bookIdChirho, spanishChirho),
                passageChirho.chapterChirho, passageChirho.verseChirho,
            ),
            style = MaterialTheme.typography.bodyMedium,
            modifier = Modifier.padding(start = 12.dp).semantics { liveRegion = LiveRegionMode.Polite },
        )
    }
}

@Composable
private fun FailedChirho(failureChirho: FailureChirho, onRetryChirho: () -> Unit) {
    Column(Modifier.padding(vertical = 20.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
        Text(
            stringResource(
                when (failureChirho) {
                    FailureChirho.BOOK_CHIRHO -> R.string.error_book_chirho
                    FailureChirho.VERSE_CHIRHO -> R.string.error_verse_chirho
                    FailureChirho.ABSENT_CHIRHO -> R.string.absent_verse_chirho
                },
            ),
            style = MaterialTheme.typography.bodyLarge,
            modifier = Modifier.semantics { liveRegion = LiveRegionMode.Polite },
        )
        if (failureChirho != FailureChirho.ABSENT_CHIRHO) Button(onClick = onRetryChirho) { Text(stringResource(R.string.retry_chirho)) }
    }
}

@Composable
private fun ReadyVerseChirho(
    stateChirho: ReaderUiStateChirho,
    loadedChirho: LoadedVerseChirho,
    playbackChirho: PlaybackChirho,
    spanishChirho: Boolean,
    imagesChirho: ImageLoaderChirho?,
    actionsChirho: ReaderActionsChirho,
    onStepFromBelowChirho: (Boolean) -> Unit,
) {
    val verseChirho = loadedChirho.verseChirho
    val greekChirho = loadedChirho.bookChirho.greekChirho
    val mediaChirho = (stateChirho.mediaChirho as? OptionalChirho.ReadyChirho)?.valueChirho
    val recordingsChirho = (stateChirho.recordingsChirho as? OptionalChirho.ReadyChirho)?.valueChirho
    var selectedWordChirho by rememberSaveable(verseChirho.idChirho) { mutableStateOf<String?>(null) }
    var translationOpenChirho by rememberSaveable(verseChirho.idChirho) { mutableStateOf(false) }
    val wordPrefixChirho = "word:${verseChirho.idChirho}:"
    val playingWordChirho = playbackChirho.keyChirho?.takeIf {
        it.startsWith(wordPrefixChirho) && (playbackChirho is PlaybackChirho.PlayingChirho || playbackChirho is PlaybackChirho.LoadingChirho)
    }?.removePrefix(wordPrefixChirho)
    fun bestWordChirho(wordChirho: WordChirho) =
        AudioSelectionChirho.bestChirho(recordingsChirho?.wordsChirho?.get(wordChirho.idChirho), greekChirho, stateChirho.renditionChirho)

    // AI and review status is stated once in About, never as a note under each picture (L.J., 2026-11-05).
    when (stateChirho.mediaChirho) {
        OptionalChirho.LoadingChirho -> Unit
        OptionalChirho.UnavailableChirho -> Text(stringResource(R.string.scene_unavailable_chirho), style = MaterialTheme.typography.bodySmall)
        is OptionalChirho.ReadyChirho -> {
            // After a failed video, the still returns and Play reads the recording over it.
            val videoChirho = stateChirho.playableVideoChirho
            if (videoChirho != null) {
                val verseKeyChirho = "verse:${verseChirho.idChirho}"
                VerseVideoChirho(
                    videoChirho = videoChirho,
                    posterChirho = mediaChirho?.sceneChirho,
                    imagesChirho = imagesChirho,
                    playingChirho = playbackChirho.keyChirho == verseKeyChirho && playbackChirho is PlaybackChirho.PlayingChirho,
                    loadingChirho = playbackChirho.keyChirho == verseKeyChirho && playbackChirho is PlaybackChirho.LoadingChirho,
                    stagedChirho = mediaChirho?.videoStagedChirho == true,
                    onToggleChirho = actionsChirho::onToggleVerseChirho,
                    onSurfaceChirho = actionsChirho::onVideoSurfaceChirho,
                )
            } else {
                mediaChirho?.sceneChirho?.let { SceneViewChirho(imagesChirho, it) }
            }
        }
    }
    Text(stringResource(if (greekChirho) R.string.read_ltr_chirho else R.string.read_rtl_chirho), style = MaterialTheme.typography.bodySmall)
    VerseViewChirho(
        verseChirho = verseChirho,
        greekChirho = greekChirho,
        spanishChirho = spanishChirho,
        picturesChirho = mediaChirho?.picturesChirho.orEmpty(),
        imagesChirho = imagesChirho,
        hasRecordingChirho = { bestWordChirho(it) != null },
        playingWordChirho = playingWordChirho,
        onWordChirho = { selectedWordChirho = it.idChirho },
        onSpeakChirho = actionsChirho::onToggleWordChirho,
    )
    (verseChirho as? HebrewVerseChirho)?.translationChirho?.let { translationChirho ->
        TextButton(onClick = { translationOpenChirho = !translationOpenChirho }) {
            Text(stringResource(if (translationOpenChirho) R.string.hide_translation_chirho else R.string.show_translation_chirho))
        }
        if (translationOpenChirho) Text(englishDataChirho(translationChirho), style = MaterialTheme.typography.bodyLarge)
    }
    VerseAudioChirho(stateChirho, verseChirho.idChirho, recordingsChirho, stateChirho.playableVideoChirho != null, greekChirho, playbackChirho, actionsChirho)
    VerseStepRowChirho(stateChirho, spanishChirho, onStepFromBelowChirho, headingChirho = false)
    SourcesViewChirho(
        verseChirho, greekChirho,
        kjvReferenceChirho(verseChirho) { idChirho ->
            stateChirho.catalogueChirho?.bookChirho(idChirho)?.let { bookLabelChirho(it, idChirho, spanishChirho) }
        },
        playedCreditChirho(stateChirho.playableVideoChirho, recordingsChirho, greekChirho, stateChirho.renditionChirho),
    )

    val selectedChirho = verseChirho.wordsChirho.firstOrNull { it.idChirho == selectedWordChirho } ?: return
    WordSheetChirho(
        verseChirho = verseChirho,
        wordChirho = selectedChirho,
        greekChirho = greekChirho,
        spanishChirho = spanishChirho,
        pictureChirho = mediaChirho?.picturesChirho?.get(selectedChirho.idChirho),
        imagesChirho = imagesChirho,
        clipChirho = bestWordChirho(selectedChirho),
        playingChirho = playingWordChirho == selectedChirho.idChirho,
        onSpeakChirho = { actionsChirho.onToggleWordChirho(selectedChirho) },
        onDismissChirho = { selectedWordChirho = null },
    )
}

/**
 * The credit of what Play plays: a video's own (its sound is the reading), otherwise a human reading's.
 * It is given once, in the verse's Sources fold (GPT, DM #3386 and #3486). AI readings carry no credit line.
 */
fun playedCreditChirho(
    videoChirho: VideoRecordChirho?,
    recordingsChirho: VerseRecordingsChirho?,
    greekChirho: Boolean,
    renditionChirho: GreekRenditionChirho,
): MediaCreditChirho? {
    if (videoChirho != null) return MediaCreditChirho(videoChirho.attributionChirho, videoChirho.licenseChirho, videoChirho.licenseUrlChirho)
    val sourceChirho = AudioSelectionChirho.bestChirho(recordingsChirho?.versesChirho, greekChirho, renditionChirho)?.readingSourceChirho
        ?: return null
    return MediaCreditChirho(sourceChirho.attributionChirho, sourceChirho.licenseChirho, sourceChirho.licenseUrlChirho)
}

@Composable
private fun VerseAudioChirho(
    stateChirho: ReaderUiStateChirho,
    verseIdChirho: String,
    recordingsChirho: VerseRecordingsChirho?,
    hasVideoChirho: Boolean,
    greekChirho: Boolean,
    playbackChirho: PlaybackChirho,
    actionsChirho: ReaderActionsChirho,
) {
    val verseClipChirho = AudioSelectionChirho.bestChirho(recordingsChirho?.versesChirho, greekChirho, stateChirho.renditionChirho)
    val anyWordChirho = recordingsChirho?.wordsChirho?.values?.any {
        AudioSelectionChirho.bestChirho(it, greekChirho, stateChirho.renditionChirho) != null
    } == true
    val keyChirho = "verse:$verseIdChirho"
    val activeChirho = playbackChirho.keyChirho == keyChirho &&
        (playbackChirho is PlaybackChirho.PlayingChirho || playbackChirho is PlaybackChirho.LoadingChirho)
    if (hasVideoChirho || verseClipChirho != null) {
        // With a video, Play plays the video, whose sound is the verse's reading (L.J., 2026-11-06).
        val idleIconChirho = if (hasVideoChirho) R.drawable.ic_play_chirho else R.drawable.ic_speaker_chirho
        val idleLabelChirho = if (hasVideoChirho) R.string.play_verse_video_chirho else R.string.listen_verse_chirho
        OutlinedButton(onClick = actionsChirho::onToggleVerseChirho) {
            Icon(painterResource(if (activeChirho) R.drawable.ic_stop_chirho else idleIconChirho), contentDescription = null)
            Text(stringResource(if (activeChirho) R.string.stop_chirho else idleLabelChirho), modifier = Modifier.padding(start = 8.dp))
        }
    } else if (greekChirho && recordingsChirho != null && !anyWordChirho) {
        Text(stringResource(R.string.rendition_unavailable_chirho), style = MaterialTheme.typography.bodySmall)
    }
    if (playbackChirho is PlaybackChirho.FailedChirho) {
        Text(
            stringResource(R.string.recorded_failed_chirho),
            style = MaterialTheme.typography.bodySmall,
            modifier = Modifier.semantics { liveRegion = LiveRegionMode.Polite },
        )
    }
}
