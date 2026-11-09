// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
package us.hinneh.readerchirho.statechirho

import android.view.Surface
import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.joinAll
import kotlinx.coroutines.launch
import us.hinneh.readerchirho.audiochirho.AudioPlaybackChirho
import us.hinneh.readerchirho.audiochirho.AudioRepositoryChirho
import us.hinneh.readerchirho.audiochirho.AudioSelectionChirho
import us.hinneh.readerchirho.audiochirho.ClipChirho
import us.hinneh.readerchirho.audiochirho.GreekIpaSourceChirho
import us.hinneh.readerchirho.audiochirho.GreekRenditionChirho
import us.hinneh.readerchirho.audiochirho.PlaybackChirho
import us.hinneh.readerchirho.contentchirho.AbsentVerseChirho
import us.hinneh.readerchirho.contentchirho.ContentRepositoryChirho
import us.hinneh.readerchirho.contentchirho.LoadedVerseChirho
import us.hinneh.readerchirho.contentchirho.WordChirho
import us.hinneh.readerchirho.domainchirho.PassageChirho
import us.hinneh.readerchirho.mediachirho.MediaRepositoryChirho
import us.hinneh.readerchirho.videochirho.VideoPlaybackChirho
import us.hinneh.readerchirho.videochirho.VideoRecordChirho
import java.time.LocalDate

/**
 * Loads one passage at a time. A new selection cancels the previous passage's requests and stops
 * its audio and video; verified text appears first, then optional pictures and recordings beside it.
 * Only one sound plays at a time: a verse video (with its own reading), a verse recording or a word.
 * With autoplay chosen, a verse the reader moves to presses its own Play once; the first verse a
 * launch shows never does (GPT, DM #3642).
 */
class ReaderViewModelChirho(
    private val contentChirho: ContentRepositoryChirho,
    private val mediaChirho: MediaRepositoryChirho,
    private val audioChirho: AudioRepositoryChirho,
    playbackFactoryChirho: (CoroutineScope) -> AudioPlaybackChirho,
    videoFactoryChirho: (CoroutineScope) -> VideoPlaybackChirho,
    private val preferencesChirho: ReaderPreferencesChirho,
    private val savedChirho: SavedStateHandle,
    explicitPassageChirho: PassageChirho?,
    todayChirho: () -> LocalDate = LocalDate::now,
    /** Root's bundled draft Greek IPA guide (unit 175); none means Greek passages carry no IPA line. */
    private val greekIpaChirho: GreekIpaSourceChirho = GreekIpaSourceChirho.NONE_CHIRHO,
) : ViewModel() {
    private val playbackChirho: AudioPlaybackChirho = playbackFactoryChirho(viewModelScope)
    private val videoChirho: VideoPlaybackChirho = videoFactoryChirho(viewModelScope)

    /** [autoplayChirho] is set only for a verse change the reader makes, never for the launch's first verse. */
    private data class RequestChirho(
        val passageChirho: PassageChirho,
        val snapChirho: Boolean,
        val attemptChirho: Int = 0,
        val autoplayChirho: Boolean = false,
    )

    private val initialChirho = LaunchChirho.passageChirho(
        explicitChirho = explicitPassageChirho,
        restoredChirho = savedChirho.get<String>(SAVED_PASSAGE_CHIRHO)?.let { PassageChirho.parseChirho(it) },
        openTodayChirho = preferencesChirho.openTodayChirho,
        lastShownChirho = preferencesChirho.lastShownChirho,
        todayChirho = todayChirho(),
    )
    private val requestChirho = MutableStateFlow(RequestChirho(initialChirho, snapChirho = explicitPassageChirho == null))
    private val stateChirho = MutableStateFlow(
        ReaderUiStateChirho(
            passageChirho = initialChirho,
            renditionChoiceChirho = preferencesChirho.renditionChirho,
            speedChoiceChirho = preferencesChirho.speedChirho,
            openTodayChirho = preferencesChirho.openTodayChirho,
            autoplayChirho = preferencesChirho.autoplayChirho,
            showIpaChirho = preferencesChirho.showIpaChirho,
        ),
    )
    val uiStateChirho: StateFlow<ReaderUiStateChirho> = stateChirho.asStateFlow()

    /** What is sounding now; a verse video uses the verse key, so the verse control shows it too. */
    val playbackStateChirho: StateFlow<PlaybackChirho> =
        combine(playbackChirho.playbackChirho, videoChirho.playbackChirho) { audioChirho, videoStateChirho ->
            if (videoStateChirho is PlaybackChirho.IdleChirho) audioChirho else videoStateChirho
        }.stateIn(viewModelScope, SharingStarted.Eagerly, PlaybackChirho.IdleChirho)

    init {
        viewModelScope.launch { requestChirho.collectLatest { loadChirho(it) } }
        // A superseded or stopped play never reports (PlaybackSlotChirho), so a failure here is this verse's video.
        viewModelScope.launch {
            videoChirho.playbackChirho.collect { videoStateChirho ->
                if (videoStateChirho is PlaybackChirho.FailedChirho &&
                    videoStateChirho.keyChirho == "verse:${stateChirho.value.passageChirho.idChirho}"
                ) {
                    stateChirho.update { it.copy(videoFailedChirho = true) }
                }
            }
        }
    }

    fun selectBookChirho(bookIdChirho: String) = requestPassageChirho(PassageChirho(bookIdChirho, 1, 1), snapChirho = true)

    fun selectChapterChirho(chapterChirho: Int) =
        requestPassageChirho(stateChirho.value.passageChirho.copy(chapterChirho = chapterChirho, verseChirho = 1), snapChirho = true)

    fun selectVerseChirho(verseChirho: Int) =
        requestPassageChirho(stateChirho.value.passageChirho.copy(verseChirho = verseChirho), snapChirho = false)

    fun stepChirho(forwardChirho: Boolean) {
        val manifestChirho = stateChirho.value.manifestChirho ?: return
        neighborChirho(manifestChirho, stateChirho.value.passageChirho, forwardChirho)?.let { requestPassageChirho(it, snapChirho = false) }
    }

    fun retryChirho() = requestChirho.update { it.copy(attemptChirho = it.attemptChirho + 1) }

    /** Every caller is a choice the reader made: a book, chapter or verse, Previous/Next or a swipe. */
    private fun requestPassageChirho(passageChirho: PassageChirho, snapChirho: Boolean) {
        savedChirho[SAVED_PASSAGE_CHIRHO] = passageChirho.idChirho
        requestChirho.value = RequestChirho(passageChirho, snapChirho, autoplayChirho = stateChirho.value.autoplayChirho)
    }

    private suspend fun loadChirho(requestChirho: RequestChirho): Unit = coroutineScope {
        stopAllChirho()
        var passageChirho = requestChirho.passageChirho
        stateChirho.update {
            it.copy(
                passageChirho = passageChirho,
                verseChirho = VerseLoadChirho.LoadingChirho,
                mediaChirho = OptionalChirho.LoadingChirho,
                recordingsChirho = OptionalChirho.LoadingChirho,
                videoFailedChirho = false,
                greekIpaChirho = null,
            )
        }
        val catalogueChirho = attemptChirho { contentChirho.catalogueChirho() } ?: return@coroutineScope failChirho(FailureChirho.BOOK_CHIRHO)
        stateChirho.update { it.copy(catalogueChirho = catalogueChirho) }
        val bookChirho = catalogueChirho.bookChirho(passageChirho.bookIdChirho) ?: return@coroutineScope failChirho(FailureChirho.ABSENT_CHIRHO)
        val manifestChirho = attemptChirho { contentChirho.manifestChirho(bookChirho) } ?: return@coroutineScope failChirho(FailureChirho.BOOK_CHIRHO)
        stateChirho.update { it.copy(manifestChirho = manifestChirho) }
        val entryChirho = manifestChirho.chaptersChirho.getOrNull(passageChirho.chapterChirho - 1)
        if (requestChirho.snapChirho && entryChirho != null && passageChirho.verseChirho !in entryChirho.versesChirho) {
            // A book or chapter choice opens at that chapter's first verse in the source numbering.
            passageChirho = passageChirho.copy(verseChirho = entryChirho.versesChirho.first())
            stateChirho.update { it.copy(passageChirho = passageChirho) }
        }
        val loadedChirho = try {
            contentChirho.verseChirho(bookChirho, passageChirho)
        } catch (cancelledChirho: CancellationException) {
            throw cancelledChirho
        } catch (absentChirho: AbsentVerseChirho) {
            return@coroutineScope failChirho(FailureChirho.ABSENT_CHIRHO)
        } catch (errorChirho: Exception) {
            return@coroutineScope failChirho(FailureChirho.VERSE_CHIRHO)
        }
        stateChirho.update { it.copy(verseChirho = VerseLoadChirho.ReadyChirho(loadedChirho)) }
        // Only a verse that loaded and verified is resumed by a later launch with today's Proverbs off.
        preferencesChirho.lastShownChirho = passageChirho
        val mediaJobChirho = launch {
            val mediaResultChirho = attemptChirho { mediaChirho.verseMediaChirho(loadedChirho, catalogueChirho) }
            stateChirho.update { stateNowChirho ->
                stateNowChirho.copy(
                    mediaChirho = mediaResultChirho?.let { mediaReadyChirho -> OptionalChirho.ReadyChirho(mediaReadyChirho) }
                        ?: OptionalChirho.UnavailableChirho,
                )
            }
        }
        val audioJobChirho = launch {
            val audioResultChirho = attemptChirho { audioChirho.recordingsChirho(loadedChirho) }
            stateChirho.update { stateNowChirho ->
                stateNowChirho.copy(
                    recordingsChirho = audioResultChirho?.let { audioReadyChirho -> OptionalChirho.ReadyChirho(audioReadyChirho) }
                        ?: OptionalChirho.UnavailableChirho,
                )
            }
        }
        // The Greek IPA guide is looked up beside them and never holds back Play or autoplay.
        launch { lookUpGreekIpaChirho(loadedChirho) }
        // Play decides between the video and the recording only once both are known. A newer selection
        // cancels this whole load, so a superseded verse never starts.
        if (requestChirho.autoplayChirho) {
            joinAll(mediaJobChirho, audioJobChirho)
            autoplayChirho()
        }
    }

    /**
     * One automatic press of Play: the verse's playable video with its reading, otherwise its best recording,
     * under the speed and reading now in effect. A sound the reader started meanwhile is never interrupted,
     * and a verse with nothing to play stays silent.
     */
    private fun autoplayChirho() {
        if (playbackChirho.playbackChirho.value != PlaybackChirho.IdleChirho ||
            videoChirho.playbackChirho.value != PlaybackChirho.IdleChirho
        ) {
            return
        }
        val stateNowChirho = stateChirho.value
        val keyChirho = "verse:${stateNowChirho.passageChirho.idChirho}"
        val verseVideoChirho = currentVideoChirho()
        if (verseVideoChirho != null) {
            startVideoChirho(keyChirho, verseVideoChirho, stateNowChirho.speedChirho)
            return
        }
        AudioSelectionChirho.bestChirho(currentRecordingsChirho()?.versesChirho, stateNowChirho.greekChirho, stateNowChirho.renditionChirho)
            ?.let { startClipChirho(keyChirho, it, stateNowChirho.speedChirho) }
    }

    private fun failChirho(failureChirho: FailureChirho) {
        stateChirho.update { it.copy(verseChirho = VerseLoadChirho.FailedChirho(failureChirho)) }
    }

    private suspend fun <T> attemptChirho(blockChirho: suspend () -> T): T? = try {
        blockChirho()
    } catch (cancelledChirho: CancellationException) {
        throw cancelledChirho
    } catch (errorChirho: Exception) {
        null
    }

    private fun currentRecordingsChirho() =
        (stateChirho.value.recordingsChirho as? OptionalChirho.ReadyChirho)?.valueChirho

    private fun currentVideoChirho() = stateChirho.value.playableVideoChirho

    fun wordClipAvailableChirho(wordChirho: WordChirho): Boolean = stateChirho.value.wordClipChirho(wordChirho.idChirho) != null

    /** Plays a word's complete recording, or stops it when it is already playing. */
    fun toggleWordChirho(wordChirho: WordChirho) {
        val stateNowChirho = stateChirho.value
        val clipChirho = stateNowChirho.wordClipChirho(wordChirho.idChirho) ?: return
        toggleChirho("word:${stateNowChirho.passageChirho.idChirho}:${wordChirho.idChirho}") { keyChirho ->
            startClipChirho(keyChirho, clipChirho, stateNowChirho.speedChirho)
        }
    }

    /** Whether Play has something to play: the verse's playable video, or its recording (ReaderUiStateChirho.versePlayChirho). */
    fun verseClipAvailableChirho(): Boolean = stateChirho.value.versePlayChirho != VersePlayChirho.NONE_CHIRHO

    /**
     * A verse with a video plays the video, whose sound is the verse's reading; otherwise, or after its video
     * failed on this visit, its saved recording over the still (ReaderUiStateChirho.playableVideoChirho).
     */
    fun toggleVerseChirho() {
        val stateNowChirho = stateChirho.value
        val keyChirho = "verse:${stateNowChirho.passageChirho.idChirho}"
        currentVideoChirho()?.let { verseVideoChirho ->
            val currentChirho = videoChirho.playbackChirho.value
            if (currentChirho.keyChirho == keyChirho &&
                (currentChirho is PlaybackChirho.PlayingChirho || currentChirho is PlaybackChirho.LoadingChirho)
            ) {
                videoChirho.stopChirho()
            } else {
                startVideoChirho(keyChirho, verseVideoChirho, stateNowChirho.speedChirho)
            }
            return
        }
        val clipChirho = AudioSelectionChirho.bestChirho(
            currentRecordingsChirho()?.versesChirho, stateNowChirho.greekChirho, stateNowChirho.renditionChirho,
        ) ?: return
        toggleChirho(keyChirho) { verseKeyChirho -> startClipChirho(verseKeyChirho, clipChirho, stateNowChirho.speedChirho) }
    }

    /** The video and its reading follow the Speed setting, pitch kept (L.J., 2026-11-06: "change video speed"). */
    private fun startVideoChirho(keyChirho: String, verseVideoChirho: VideoRecordChirho, speedChirho: Float) {
        playbackChirho.stopChirho()
        videoChirho.playChirho(keyChirho, verseVideoChirho, speedChirho)
    }

    private fun startClipChirho(keyChirho: String, clipChirho: ClipChirho, speedChirho: Float) {
        videoChirho.stopChirho()
        playbackChirho.playChirho(keyChirho, clipChirho, speedChirho)
    }

    private fun toggleChirho(keyChirho: String, startChirho: (String) -> Unit) {
        val currentChirho = playbackChirho.playbackChirho.value
        if (currentChirho.keyChirho == keyChirho &&
            (currentChirho is PlaybackChirho.PlayingChirho || currentChirho is PlaybackChirho.LoadingChirho)
        ) {
            playbackChirho.stopChirho()
        } else {
            startChirho(keyChirho)
        }
    }

    /** A choice made in Settings is saved and from then on replaces the automatic one, as on the website. */
    fun setRenditionChirho(renditionChirho: GreekRenditionChirho) {
        stopAllChirho()
        preferencesChirho.renditionChirho = renditionChirho
        stateChirho.update { it.copy(renditionChoiceChirho = renditionChirho) }
    }

    fun setSpeedChirho(speedChirho: Float?) {
        preferencesChirho.speedChirho = speedChirho
        stateChirho.update { it.copy(speedChoiceChirho = speedChirho) }
    }

    /** Applies from the next fresh launch; the verse being read stays. */
    fun setOpenTodayChirho(openTodayChirho: Boolean) {
        preferencesChirho.openTodayChirho = openTodayChirho
        stateChirho.update { it.copy(openTodayChirho = openTodayChirho) }
    }

    /** Applies from the next verse the reader moves to; nothing starts for the verse being read. */
    fun setAutoplayChirho(autoplayChirho: Boolean) {
        preferencesChirho.autoplayChirho = autoplayChirho
        stateChirho.update { it.copy(autoplayChirho = autoplayChirho) }
    }

    /** Shows or hides the IPA line at once; nothing that is playing stops. */
    fun setShowIpaChirho(showIpaChirho: Boolean) {
        preferencesChirho.showIpaChirho = showIpaChirho
        stateChirho.update { it.copy(showIpaChirho = showIpaChirho) }
        val loadedChirho = (stateChirho.value.verseChirho as? VerseLoadChirho.ReadyChirho)?.loadedChirho ?: return
        if (stateChirho.value.greekIpaChirho == null) viewModelScope.launch { lookUpGreekIpaChirho(loadedChirho) }
    }

    /**
     * With Show IPA on, a Greek verse's rows from the bundled guide, looked up off the main thread. They are kept only
     * while that same verse is still the one shown; an unavailable guide leaves the line off.
     */
    private suspend fun lookUpGreekIpaChirho(loadedChirho: LoadedVerseChirho) {
        if (!stateChirho.value.showIpaChirho || !loadedChirho.bookChirho.greekChirho) return
        val rowsChirho = attemptChirho { greekIpaChirho.wordsChirho(loadedChirho.verseChirho) } ?: return
        stateChirho.update {
            if ((it.verseChirho as? VerseLoadChirho.ReadyChirho)?.loadedChirho === loadedChirho) it.copy(greekIpaChirho = rowsChirho) else it
        }
    }

    /** The verse video's drawing surface, lent by the screen while it is shown. */
    fun videoSurfaceChirho(surfaceChirho: Surface?) = videoChirho.surfaceChirho(surfaceChirho)

    fun stopAudioChirho() = stopAllChirho()

    private fun stopAllChirho() {
        playbackChirho.stopChirho()
        videoChirho.stopChirho()
    }

    override fun onCleared() {
        stopAllChirho()
        videoChirho.surfaceChirho(null)
    }

    companion object {
        const val SAVED_PASSAGE_CHIRHO = "passage_chirho"
    }
}
