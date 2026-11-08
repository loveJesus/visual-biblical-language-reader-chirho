// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
package us.hinneh.readerchirho.statechirho

import android.view.Surface
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
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import us.hinneh.readerchirho.PublishedWorldChirho
import us.hinneh.readerchirho.audiochirho.AudioPlaybackChirho
import us.hinneh.readerchirho.audiochirho.AudioSelectionChirho
import us.hinneh.readerchirho.audiochirho.ClipChirho
import us.hinneh.readerchirho.audiochirho.GreekRenditionChirho
import us.hinneh.readerchirho.audiochirho.PlaybackChirho
import us.hinneh.readerchirho.audiochirho.VerseRecordingsChirho
import us.hinneh.readerchirho.FixedStagedVideosChirho
import us.hinneh.readerchirho.domainchirho.PassageChirho
import us.hinneh.readerchirho.mediachirho.VerseMediaChirho
import us.hinneh.readerchirho.sampleVideoChirho
import us.hinneh.readerchirho.videochirho.VideoPlaybackChirho
import us.hinneh.readerchirho.videochirho.VideoRecordChirho
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

private class FakeVideoPlaybackChirho : VideoPlaybackChirho {
    private val stateChirho = MutableStateFlow<PlaybackChirho>(PlaybackChirho.IdleChirho)
    override val playbackChirho: StateFlow<PlaybackChirho> = stateChirho
    val playedChirho = mutableListOf<Pair<String, Float>>()
    val surfacesChirho = mutableListOf<Surface?>()

    override fun playChirho(keyChirho: String, videoChirho: VideoRecordChirho, speedChirho: Float) {
        playedChirho += keyChirho to speedChirho
        stateChirho.value = PlaybackChirho.PlayingChirho(keyChirho)
    }

    override fun stopChirho() {
        stateChirho.value = PlaybackChirho.IdleChirho
    }

    /** What the real player reports when the MP4 cannot be fetched, verified or played. */
    fun failChirho(keyChirho: String) {
        stateChirho.value = PlaybackChirho.FailedChirho(keyChirho)
    }

    override fun surfaceChirho(surfaceChirho: Surface?) {
        surfacesChirho += surfaceChirho
    }
}

private class MemoryPreferencesChirho : ReaderPreferencesChirho {
    override var renditionChirho: GreekRenditionChirho? = null
    override var speedChirho: Float? = null
}

@OptIn(ExperimentalCoroutinesApi::class)
class ReaderViewModelTestChirho {
    private val dispatcherChirho = StandardTestDispatcher()
    private val storeChirho = ViewModelStore()
    private val playbackChirho = FakePlaybackChirho()
    private val videoChirho = FakeVideoPlaybackChirho()
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
                    worldChirho.contentChirho, worldChirho.mediaChirho, worldChirho.audioChirho, { playbackChirho }, { videoChirho }, preferencesChirho,
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
        // John 1:1 has an Aspirates reading, so the automatic choice is Aspirates, and nothing is saved.
        assertEquals(GreekRenditionChirho.MODERN_ASPIRATES_CHIRHO, viewModelChirho.uiStateChirho.value.renditionChirho)
        assertNull(preferencesChirho.renditionChirho)
        assertTrue(!viewModelChirho.wordClipAvailableChirho(articleChirho))
        viewModelChirho.setRenditionChirho(GreekRenditionChirho.MODERN_CHIRHO)
        assertEquals(GreekRenditionChirho.MODERN_CHIRHO, preferencesChirho.renditionChirho)
        assertTrue(viewModelChirho.wordClipAvailableChirho(articleChirho))
        viewModelChirho.toggleWordChirho(articleChirho)
        assertEquals("Normal by default, Greek too", "word:John.1.1:${articleChirho.idChirho}" to 1f, playbackChirho.playedChirho.single())
        assertNull("the default speed is never saved", preferencesChirho.speedChirho)
        val stopsChirho = playbackChirho.stopsChirho
        viewModelChirho.toggleWordChirho(articleChirho)
        assertEquals(stopsChirho + 1, playbackChirho.stopsChirho)
        assertEquals(1, playbackChirho.playedChirho.size)
    }

    @Test
    fun aVerseVideoPlaysInsteadOfItsRecordingAndAnyOtherSoundStopsIt() = runTest(dispatcherChirho) {
        worldChirho = PublishedWorldChirho.orSkipChirho(dispatcherChirho, FixedStagedVideosChirho(sampleVideoChirho()))
        val viewModelChirho = viewModelChirho(explicitChirho = "Prov.1.1")
        settleChirho()
        val mediaChirho = (viewModelChirho.uiStateChirho.value.mediaChirho as OptionalChirho.ReadyChirho).valueChirho
        assertEquals(sampleVideoChirho(), mediaChirho.videoChirho)
        assertTrue(viewModelChirho.verseClipAvailableChirho())

        viewModelChirho.toggleVerseChirho()
        settleChirho()
        assertEquals("the video follows the Speed setting (Normal by default)", listOf("verse:Prov.1.1" to 1f), videoChirho.playedChirho)
        assertTrue("its reading is the video's own sound, not a second recording", playbackChirho.playedChirho.isEmpty())
        assertEquals(PlaybackChirho.PlayingChirho("verse:Prov.1.1"), viewModelChirho.playbackStateChirho.value)
        viewModelChirho.toggleVerseChirho()
        settleChirho()
        assertEquals(PlaybackChirho.IdleChirho, videoChirho.playbackChirho.value)

        viewModelChirho.toggleVerseChirho()
        val wordChirho = (viewModelChirho.uiStateChirho.value.verseChirho as VerseLoadChirho.ReadyChirho).loadedChirho.verseChirho
            .wordsChirho.first { viewModelChirho.wordClipAvailableChirho(it) }
        viewModelChirho.toggleWordChirho(wordChirho)
        settleChirho()
        assertEquals("a word stops the video", PlaybackChirho.IdleChirho, videoChirho.playbackChirho.value)
        assertEquals("word:Prov.1.1:${wordChirho.idChirho}", playbackChirho.playedChirho.single().first)

        viewModelChirho.setSpeedChirho(0.85f)
        assertEquals(0.85f, preferencesChirho.speedChirho)
        viewModelChirho.toggleVerseChirho()
        assertEquals("a new speed choice applies to the next video play", "verse:Prov.1.1" to 0.85f, videoChirho.playedChirho.last())
        assertTrue(videoChirho.playbackChirho.value is PlaybackChirho.PlayingChirho)
        viewModelChirho.stepChirho(forwardChirho = true)
        settleChirho()
        assertEquals("Prov.1.2", viewModelChirho.shownChirho())
        assertEquals("the next verse stops the video", PlaybackChirho.IdleChirho, videoChirho.playbackChirho.value)
        assertEquals(null, (viewModelChirho.uiStateChirho.value.mediaChirho as OptionalChirho.ReadyChirho).valueChirho.videoChirho)
    }

    /**
     * Matthew 1:16 has rough breathing (ἧς, ὁ) and only a plain Modern Chatterbox reading. With nothing saved
     * the reading follows the verse, as on the website, so it plays; a saved Aspirates choice still never
     * borrows it, and that choice survives a fresh launch.
     */
    @Test
    fun theAutomaticRenditionFollowsTheVerseUntilAChoiceIsSaved() = runTest(dispatcherChirho) {
        val viewModelChirho = viewModelChirho(explicitChirho = "Matt.1.16")
        settleChirho()
        val stateChirho = viewModelChirho.uiStateChirho.value
        assertEquals(GreekRenditionChirho.MODERN_CHIRHO, stateChirho.renditionChirho)
        val versesChirho = (stateChirho.recordingsChirho as OptionalChirho.ReadyChirho).valueChirho.versesChirho
        assertEquals(listOf(AudioSelectionChirho.LOCAL_GREEK_VERSE_RECIPE_CHIRHO), versesChirho.map { it.recipeIdChirho })
        assertTrue(viewModelChirho.verseClipAvailableChirho())
        val roughChirho = (stateChirho.verseChirho as VerseLoadChirho.ReadyChirho).loadedChirho.verseChirho.wordsChirho.first { it.textChirho == "ὁ" }
        assertTrue("a plain Modern word clip plays under Modern", viewModelChirho.wordClipAvailableChirho(roughChirho))
        viewModelChirho.toggleVerseChirho()
        assertEquals("verse:Matt.1.16" to 1f, playbackChirho.playedChirho.single())

        viewModelChirho.setRenditionChirho(GreekRenditionChirho.MODERN_ASPIRATES_CHIRHO)
        assertEquals("a switch stops the old reading at once", PlaybackChirho.IdleChirho, playbackChirho.playbackChirho.value)
        assertEquals(GreekRenditionChirho.MODERN_ASPIRATES_CHIRHO, preferencesChirho.renditionChirho)
        assertTrue("a silent rough breathing never stands for Aspirates", !viewModelChirho.verseClipAvailableChirho())
        assertTrue(!viewModelChirho.wordClipAvailableChirho(roughChirho))

        storeChirho.clear()
        val relaunchedChirho = viewModelChirho(explicitChirho = "Matt.1.16")
        settleChirho()
        assertEquals(GreekRenditionChirho.MODERN_ASPIRATES_CHIRHO, relaunchedChirho.uiStateChirho.value.renditionChirho)
        assertTrue(!relaunchedChirho.verseClipAvailableChirho())
    }

    /**
     * GPT, DM #3498, as the website's speech-controls does: a video that failed is not tried again on this visit;
     * the next Play reads the verse's recording over the still. A later visit may try the video again.
     */
    @Test
    fun aFailedVideoGivesWayToTheRecordingOverTheStillForThisVisit() = runTest(dispatcherChirho) {
        worldChirho = PublishedWorldChirho.orSkipChirho(dispatcherChirho, FixedStagedVideosChirho(sampleVideoChirho()))
        val viewModelChirho = viewModelChirho(explicitChirho = "Prov.1.1")
        settleChirho()
        assertEquals(sampleVideoChirho(), viewModelChirho.uiStateChirho.value.playableVideoChirho)
        viewModelChirho.toggleVerseChirho()
        videoChirho.failChirho("verse:Prov.1.1")
        settleChirho()
        val failedChirho = viewModelChirho.uiStateChirho.value
        assertTrue(failedChirho.videoFailedChirho)
        assertNull("the still returns in the video's place", failedChirho.playableVideoChirho)
        assertTrue(viewModelChirho.verseClipAvailableChirho())

        viewModelChirho.toggleVerseChirho()
        assertEquals("the next Play reads Be'eri's recording", listOf("verse:Prov.1.1" to 1f), playbackChirho.playedChirho)
        assertEquals("the video is not tried again", 1, videoChirho.playedChirho.size)

        viewModelChirho.stepChirho(forwardChirho = true)
        settleChirho()
        viewModelChirho.stepChirho(forwardChirho = false)
        settleChirho()
        assertEquals("Prov.1.1", viewModelChirho.shownChirho())
        assertEquals("a new visit may try the video again", sampleVideoChirho(), viewModelChirho.uiStateChirho.value.playableVideoChirho)
    }

    @Test
    fun withNoRecordingToReadAFailedVideoMayBeTriedAgain() {
        val videoRecordChirho = sampleVideoChirho()
        val stateChirho = ReaderUiStateChirho(
            passageChirho = PassageChirho("Prov", 1, 1),
            mediaChirho = OptionalChirho.ReadyChirho(VerseMediaChirho.EMPTY_CHIRHO.copy(videoChirho = videoRecordChirho)),
            recordingsChirho = OptionalChirho.ReadyChirho(VerseRecordingsChirho.EMPTY_CHIRHO),
            videoFailedChirho = true,
        )
        assertEquals(videoRecordChirho, stateChirho.playableVideoChirho)
    }
}
