// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
package us.hinneh.readerchirho.statechirho

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.ViewModelStore
import androidx.lifecycle.viewmodel.initializer
import androidx.lifecycle.viewmodel.viewModelFactory
import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.test.StandardTestDispatcher
import kotlinx.coroutines.test.TestScope
import kotlinx.coroutines.test.advanceUntilIdle
import kotlinx.coroutines.test.resetMain
import kotlinx.coroutines.test.runTest
import kotlinx.coroutines.test.setMain
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import us.hinneh.readerchirho.PublishedWorldChirho
import us.hinneh.readerchirho.audiochirho.AudioPlaybackChirho
import us.hinneh.readerchirho.audiochirho.ClipChirho
import us.hinneh.readerchirho.audiochirho.GreekRenditionChirho
import us.hinneh.readerchirho.audiochirho.PlaybackChirho
import us.hinneh.readerchirho.domainchirho.PassageChirho
import java.time.LocalDate

private class FakePlaybackChirho : AudioPlaybackChirho {
    private val stateChirho = MutableStateFlow<PlaybackChirho>(PlaybackChirho.IdleChirho)
    override val playbackChirho: StateFlow<PlaybackChirho> = stateChirho
    val playedChirho = mutableListOf<Pair<String, Float>>()
    var stopsChirho = 0

    override fun playChirho(keyChirho: String, clipChirho: ClipChirho, speedChirho: Float) {
        playedChirho += keyChirho to speedChirho
        stateChirho.value = PlaybackChirho.PlayingChirho(keyChirho)
    }

    override fun stopChirho() {
        stopsChirho++
        stateChirho.value = PlaybackChirho.IdleChirho
    }
}

private class MemoryPreferencesChirho : ReaderPreferencesChirho {
    override var renditionChirho = GreekRenditionChirho.MODERN_ASPIRATES_CHIRHO
    override var speedChirho: Float? = null
}

@OptIn(ExperimentalCoroutinesApi::class)
class ReaderViewModelTestChirho {
    private val dispatcherChirho = StandardTestDispatcher()
    private val storeChirho = ViewModelStore()
    private val playbackChirho = FakePlaybackChirho()
    private val preferencesChirho = MemoryPreferencesChirho()
    private lateinit var worldChirho: PublishedWorldChirho

    @Before
    fun setUpChirho() {
        Dispatchers.setMain(dispatcherChirho)
        worldChirho = PublishedWorldChirho.orSkipChirho(dispatcherChirho)
    }

    @After
    fun tearDownChirho() {
        storeChirho.clear()
        Dispatchers.resetMain()
    }

    private fun viewModelChirho(
        explicitChirho: String? = null,
        savedChirho: String? = null,
        todayChirho: LocalDate = LocalDate.of(2026, 11, 3),
    ): ReaderViewModelChirho {
        val factoryChirho = viewModelFactory {
            initializer {
                ReaderViewModelChirho(
                    worldChirho.contentChirho, worldChirho.mediaChirho, worldChirho.audioChirho, { playbackChirho }, preferencesChirho,
                    SavedStateHandle(savedChirho?.let { mapOf(ReaderViewModelChirho.SAVED_PASSAGE_CHIRHO to it) } ?: emptyMap()),
                    explicitChirho?.let { PassageChirho.parseChirho(it) }, { todayChirho },
                )
            }
        }
        return ViewModelProvider.create(storeChirho, factoryChirho)[ReaderViewModelChirho::class]
    }

    private fun ReaderViewModelChirho.shownChirho(): String? =
        (uiStateChirho.value.verseChirho as? VerseLoadChirho.ReadyChirho)?.loadedChirho?.verseChirho?.idChirho

    private fun TestScope.settleChirho() = advanceUntilIdle()

    @Test
    fun freshVisitOpensTheLocalDaysProverbsChapter() = runTest(dispatcherChirho) {
        val viewModelChirho = viewModelChirho(todayChirho = LocalDate.of(2026, 11, 3))
        settleChirho()
        assertEquals("Prov.3.1", viewModelChirho.shownChirho())
        assertTrue(viewModelChirho.uiStateChirho.value.mediaChirho is OptionalChirho.ReadyChirho)
        assertTrue(viewModelChirho.uiStateChirho.value.recordingsChirho is OptionalChirho.ReadyChirho)
    }

    @Test
    fun explicitSelectionWinsOverSavedAndDailyPassages() = runTest(dispatcherChirho) {
        val explicitChirho = viewModelChirho(explicitChirho = "John.1.1", savedChirho = "Prov.2.3")
        settleChirho()
        assertEquals("John.1.1", explicitChirho.shownChirho())
        storeChirho.clear()
        val restoredChirho = viewModelChirho(savedChirho = "Prov.2.3")
        settleChirho()
        assertEquals("Prov.2.3", restoredChirho.shownChirho())
    }

    @Test
    fun aNewerSelectionCancelsTheOlderLoadAndItsAudio() = runTest(dispatcherChirho) {
        val viewModelChirho = viewModelChirho(explicitChirho = "Prov.26.1")
        settleChirho()
        val gateChirho = CompletableDeferred<Unit>()
        worldChirho.transportChirho.gatesChirho["/content-chirho/proverbs-chirho/chapter-05-chirho.json"] = gateChirho
        viewModelChirho.selectChapterChirho(5)
        settleChirho()
        assertTrue(viewModelChirho.uiStateChirho.value.verseChirho is VerseLoadChirho.LoadingChirho)
        viewModelChirho.selectBookChirho("John")
        settleChirho()
        gateChirho.complete(Unit)
        settleChirho()
        assertEquals("John.1.1", viewModelChirho.shownChirho())
        assertEquals(PassageChirho("John", 1, 1), viewModelChirho.uiStateChirho.value.passageChirho)
        assertTrue("each new passage stops the previous audio", playbackChirho.stopsChirho >= 3)
    }

    @Test
    fun failuresKeepTheirKindAndRetryRecovers() = runTest(dispatcherChirho) {
        val chapterChirho = "/content-chirho/proverbs-chirho/chapter-04-chirho.json"
        worldChirho.transportChirho.failingChirho += chapterChirho
        val viewModelChirho = viewModelChirho(explicitChirho = "Prov.4.1")
        settleChirho()
        assertEquals(VerseLoadChirho.FailedChirho(FailureChirho.VERSE_CHIRHO), viewModelChirho.uiStateChirho.value.verseChirho)
        worldChirho.transportChirho.failingChirho -= chapterChirho
        viewModelChirho.retryChirho()
        settleChirho()
        assertEquals("Prov.4.1", viewModelChirho.shownChirho())
        viewModelChirho.selectVerseChirho(199)
        settleChirho()
        assertEquals(VerseLoadChirho.FailedChirho(FailureChirho.ABSENT_CHIRHO), viewModelChirho.uiStateChirho.value.verseChirho)
    }

    @Test
    fun optionalMediaFailureNeverRemovesTheVerifiedText() = runTest(dispatcherChirho) {
        worldChirho.transportChirho.failingChirho += "/media-chirho/proverbs-chirho/summary-chirho.json"
        worldChirho.transportChirho.failingChirho += "/audio-chirho/manifest-chirho.json"
        val viewModelChirho = viewModelChirho(explicitChirho = "Prov.26.1")
        settleChirho()
        assertEquals("Prov.26.1", viewModelChirho.shownChirho())
        assertEquals(OptionalChirho.UnavailableChirho, viewModelChirho.uiStateChirho.value.mediaChirho)
        assertEquals(OptionalChirho.UnavailableChirho, viewModelChirho.uiStateChirho.value.recordingsChirho)
    }

    @Test
    fun wordPlaybackTogglesAndAReadingChangeStopsIt() = runTest(dispatcherChirho) {
        val viewModelChirho = viewModelChirho(explicitChirho = "John.1.1")
        settleChirho()
        val wordsChirho = requireNotNull((viewModelChirho.uiStateChirho.value.verseChirho as VerseLoadChirho.ReadyChirho)).loadedChirho.verseChirho.wordsChirho
        val articleChirho = wordsChirho.first { it.textChirho == "ὁ" }
        assertTrue(!viewModelChirho.wordClipAvailableChirho(articleChirho))
        viewModelChirho.setRenditionChirho(GreekRenditionChirho.MODERN_CHIRHO)
        assertEquals(GreekRenditionChirho.MODERN_CHIRHO, preferencesChirho.renditionChirho)
        assertTrue(viewModelChirho.wordClipAvailableChirho(articleChirho))
        viewModelChirho.toggleWordChirho(articleChirho)
        assertEquals("word:John.1.1:${articleChirho.idChirho}" to 0.88f, playbackChirho.playedChirho.single())
        val stopsChirho = playbackChirho.stopsChirho
        viewModelChirho.toggleWordChirho(articleChirho)
        assertEquals(stopsChirho + 1, playbackChirho.stopsChirho)
        assertEquals(1, playbackChirho.playedChirho.size)
    }
}
