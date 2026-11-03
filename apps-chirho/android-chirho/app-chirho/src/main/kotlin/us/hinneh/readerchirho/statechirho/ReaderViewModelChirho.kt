// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
package us.hinneh.readerchirho.statechirho

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import us.hinneh.readerchirho.audiochirho.AudioPlaybackChirho
import us.hinneh.readerchirho.audiochirho.AudioRepositoryChirho
import us.hinneh.readerchirho.audiochirho.AudioSelectionChirho
import us.hinneh.readerchirho.audiochirho.GreekRenditionChirho
import us.hinneh.readerchirho.audiochirho.PlaybackChirho
import us.hinneh.readerchirho.contentchirho.AbsentVerseChirho
import us.hinneh.readerchirho.contentchirho.ContentRepositoryChirho
import us.hinneh.readerchirho.contentchirho.WordChirho
import us.hinneh.readerchirho.domainchirho.PassageChirho
import us.hinneh.readerchirho.mediachirho.MediaRepositoryChirho
import java.time.LocalDate

/**
 * Loads one passage at a time. A new selection cancels the previous passage's requests and stops
 * its audio; verified text appears first, then optional pictures and recordings beside it.
 */
class ReaderViewModelChirho(
    private val contentChirho: ContentRepositoryChirho,
    private val mediaChirho: MediaRepositoryChirho,
    private val audioChirho: AudioRepositoryChirho,
    playbackFactoryChirho: (CoroutineScope) -> AudioPlaybackChirho,
    private val preferencesChirho: ReaderPreferencesChirho,
    private val savedChirho: SavedStateHandle,
    explicitPassageChirho: PassageChirho?,
    todayChirho: () -> LocalDate = LocalDate::now,
) : ViewModel() {
    private val playbackChirho: AudioPlaybackChirho = playbackFactoryChirho(viewModelScope)

    private data class RequestChirho(val passageChirho: PassageChirho, val snapChirho: Boolean, val attemptChirho: Int = 0)

    private val initialChirho = explicitPassageChirho
        ?: savedChirho.get<String>(SAVED_PASSAGE_CHIRHO)?.let { PassageChirho.parseChirho(it) }
        ?: PassageChirho.dailyChirho(todayChirho())
    private val requestChirho = MutableStateFlow(RequestChirho(initialChirho, snapChirho = explicitPassageChirho == null))
    private val stateChirho = MutableStateFlow(
        ReaderUiStateChirho(
            passageChirho = initialChirho,
            renditionChirho = preferencesChirho.renditionChirho,
            speedChoiceChirho = preferencesChirho.speedChirho,
        ),
    )
    val uiStateChirho: StateFlow<ReaderUiStateChirho> = stateChirho.asStateFlow()
    val playbackStateChirho: StateFlow<PlaybackChirho> = playbackChirho.playbackChirho

    init {
        viewModelScope.launch { requestChirho.collectLatest { loadChirho(it) } }
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

    private fun requestPassageChirho(passageChirho: PassageChirho, snapChirho: Boolean) {
        savedChirho[SAVED_PASSAGE_CHIRHO] = passageChirho.idChirho
        requestChirho.value = RequestChirho(passageChirho, snapChirho)
    }

    private suspend fun loadChirho(requestChirho: RequestChirho): Unit = coroutineScope {
        playbackChirho.stopChirho()
        var passageChirho = requestChirho.passageChirho
        stateChirho.update {
            it.copy(
                passageChirho = passageChirho,
                verseChirho = VerseLoadChirho.LoadingChirho,
                mediaChirho = OptionalChirho.LoadingChirho,
                recordingsChirho = OptionalChirho.LoadingChirho,
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
        launch {
            val mediaResultChirho = attemptChirho { mediaChirho.verseMediaChirho(loadedChirho, catalogueChirho) }
            stateChirho.update { stateNowChirho ->
                stateNowChirho.copy(
                    mediaChirho = mediaResultChirho?.let { mediaReadyChirho -> OptionalChirho.ReadyChirho(mediaReadyChirho) }
                        ?: OptionalChirho.UnavailableChirho,
                )
            }
        }
        launch {
            val audioResultChirho = attemptChirho { audioChirho.recordingsChirho(loadedChirho) }
            stateChirho.update { stateNowChirho ->
                stateNowChirho.copy(
                    recordingsChirho = audioResultChirho?.let { audioReadyChirho -> OptionalChirho.ReadyChirho(audioReadyChirho) }
                        ?: OptionalChirho.UnavailableChirho,
                )
            }
        }
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

    fun wordClipAvailableChirho(wordChirho: WordChirho): Boolean = currentRecordingsChirho()?.let {
        AudioSelectionChirho.bestChirho(it.wordsChirho[wordChirho.idChirho], stateChirho.value.greekChirho, stateChirho.value.renditionChirho) != null
    } == true

    /** Plays a word's complete recording, or stops it when it is already playing. */
    fun toggleWordChirho(wordChirho: WordChirho) {
        val stateNowChirho = stateChirho.value
        val clipChirho = AudioSelectionChirho.bestChirho(
            currentRecordingsChirho()?.wordsChirho?.get(wordChirho.idChirho), stateNowChirho.greekChirho, stateNowChirho.renditionChirho,
        ) ?: return
        toggleChirho("word:${stateNowChirho.passageChirho.idChirho}:${wordChirho.idChirho}") { keyChirho ->
            playbackChirho.playChirho(keyChirho, clipChirho, stateNowChirho.speedChirho)
        }
    }

    fun verseClipAvailableChirho(): Boolean = currentRecordingsChirho()?.let {
        AudioSelectionChirho.bestChirho(it.versesChirho, stateChirho.value.greekChirho, stateChirho.value.renditionChirho) != null
    } == true

    fun toggleVerseChirho() {
        val stateNowChirho = stateChirho.value
        val clipChirho = AudioSelectionChirho.bestChirho(
            currentRecordingsChirho()?.versesChirho, stateNowChirho.greekChirho, stateNowChirho.renditionChirho,
        ) ?: return
        toggleChirho("verse:${stateNowChirho.passageChirho.idChirho}") { keyChirho ->
            playbackChirho.playChirho(keyChirho, clipChirho, stateNowChirho.speedChirho)
        }
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

    fun setRenditionChirho(renditionChirho: GreekRenditionChirho) {
        playbackChirho.stopChirho()
        preferencesChirho.renditionChirho = renditionChirho
        stateChirho.update { it.copy(renditionChirho = renditionChirho) }
    }

    fun setSpeedChirho(speedChirho: Float?) {
        preferencesChirho.speedChirho = speedChirho
        stateChirho.update { it.copy(speedChoiceChirho = speedChirho) }
    }

    fun stopAudioChirho() = playbackChirho.stopChirho()

    override fun onCleared() {
        playbackChirho.stopChirho()
    }

    companion object {
        const val SAVED_PASSAGE_CHIRHO = "passage_chirho"
    }
}
