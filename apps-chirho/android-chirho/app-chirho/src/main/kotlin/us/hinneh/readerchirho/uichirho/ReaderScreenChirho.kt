// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
package us.hinneh.readerchirho.uichirho

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

/** Everything the reader screen can ask for; the view model and tests both implement it. */
interface ReaderActionsChirho {
    fun onBookChirho(idChirho: String)
    fun onChapterChirho(numberChirho: Int)
    fun onVerseChirho(numberChirho: Int)
    fun onStepChirho(forwardChirho: Boolean)
    fun onRetryChirho()
    fun onToggleWordChirho(wordChirho: WordChirho)
    fun onToggleVerseChirho()
    fun onRenditionChirho(renditionChirho: GreekRenditionChirho)
    fun onSpeedChirho(speedChirho: Float)
    fun onLanguageChirho(languageChirho: InterfaceLanguageChirho)
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ReaderScreenChirho(
    stateChirho: ReaderUiStateChirho,
    playbackChirho: PlaybackChirho,
    languageChirho: InterfaceLanguageChirho,
    spanishChirho: Boolean,
    imagesChirho: ImageLoaderChirho?,
    actionsChirho: ReaderActionsChirho,
) {
    var settingsOpenChirho by rememberSaveable { mutableStateOf(false) }
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
                    IconButton(onClick = { settingsOpenChirho = true }) {
                        Icon(painterResource(R.drawable.ic_settings_chirho), contentDescription = stringResource(R.string.settings_chirho))
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = InkChirho.PAPER_CHIRHO),
            )
        },
    ) { paddingChirho ->
        Box(Modifier.fillMaxSize().padding(paddingChirho), contentAlignment = Alignment.TopCenter) {
            Column(
                Modifier.widthIn(max = 840.dp).fillMaxWidth().verticalScroll(rememberScrollState()).padding(horizontal = 16.dp, vertical = 8.dp),
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
                        stateChirho, verseChirho.loadedChirho, playbackChirho, spanishChirho, imagesChirho, actionsChirho,
                    )
                }
            }
        }
    }
    if (settingsOpenChirho) {
        SettingsSheetChirho(
            languageChirho = languageChirho,
            renditionChirho = stateChirho.renditionChirho,
            speedChirho = stateChirho.speedChirho,
            onLanguageChirho = actionsChirho::onLanguageChirho,
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

    when (stateChirho.mediaChirho) {
        OptionalChirho.LoadingChirho -> Unit
        OptionalChirho.UnavailableChirho -> Text(stringResource(R.string.scene_unavailable_chirho), style = MaterialTheme.typography.bodySmall)
        is OptionalChirho.ReadyChirho -> mediaChirho?.sceneChirho?.let { SceneViewChirho(imagesChirho, it) }
            ?: Text(stringResource(R.string.scene_awaiting_note_chirho), style = MaterialTheme.typography.bodySmall)
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
    VerseAudioChirho(stateChirho, verseChirho.idChirho, recordingsChirho, greekChirho, playbackChirho, actionsChirho)
    SourcesViewChirho(verseChirho, greekChirho, kjvReferenceChirho(verseChirho) { idChirho ->
        stateChirho.catalogueChirho?.bookChirho(idChirho)?.let { bookLabelChirho(it, idChirho, spanishChirho) }
    })

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

@Composable
private fun VerseAudioChirho(
    stateChirho: ReaderUiStateChirho,
    verseIdChirho: String,
    recordingsChirho: VerseRecordingsChirho?,
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
    if (verseClipChirho != null) {
        OutlinedButton(onClick = actionsChirho::onToggleVerseChirho) {
            Icon(painterResource(if (activeChirho) R.drawable.ic_stop_chirho else R.drawable.ic_speaker_chirho), contentDescription = null)
            Text(stringResource(if (activeChirho) R.string.stop_chirho else R.string.listen_verse_chirho), modifier = Modifier.padding(start = 8.dp))
        }
        Text(stringResource(R.string.audition_note_chirho, verseClipChirho.voiceNameChirho), style = MaterialTheme.typography.bodySmall)
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
