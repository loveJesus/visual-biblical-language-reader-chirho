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
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.jsonPrimitive
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import us.hinneh.readerchirho.PublishedWorldChirho
import us.hinneh.readerchirho.audiochirho.AudioPlaybackChirho
import us.hinneh.readerchirho.audiochirho.AudioRepositoryChirho
import us.hinneh.readerchirho.audiochirho.GreekIpaGuideChirho
import us.hinneh.readerchirho.audiochirho.GreekIpaSourceChirho
import us.hinneh.readerchirho.audiochirho.AudioSelectionChirho
import us.hinneh.readerchirho.audiochirho.ClipChirho
import us.hinneh.readerchirho.audiochirho.GreekRenditionChirho
import us.hinneh.readerchirho.audiochirho.PlaybackChirho
import us.hinneh.readerchirho.audiochirho.VerseRecordingsChirho
import us.hinneh.readerchirho.FixedStagedVideosChirho
import us.hinneh.readerchirho.contentchirho.HebrewVerseChirho
import us.hinneh.readerchirho.contentchirho.WordChirho
import us.hinneh.readerchirho.SPOKEN_OVERRIDES_CHIRHO
import us.hinneh.readerchirho.domainchirho.PassageChirho
import us.hinneh.readerchirho.domainchirho.SpokenChirho
import us.hinneh.readerchirho.domainchirho.SpokenOverridesChirho
import us.hinneh.readerchirho.mediachirho.VerseMediaChirho
import us.hinneh.readerchirho.bundledCatalogueChirho
import us.hinneh.readerchirho.publishedRecordsChirho
import us.hinneh.readerchirho.publishedVerseClipChirho
import us.hinneh.readerchirho.sampleGreekVideoChirho
import us.hinneh.readerchirho.remotechirho.sha256HexChirho
import us.hinneh.readerchirho.sampleVideoChirho
import us.hinneh.readerchirho.videochirho.VideoPlaybackChirho
import us.hinneh.readerchirho.videochirho.VideoRecordChirho
import us.hinneh.readerchirho.withChirho
import java.io.File
import java.time.LocalDate

private class FakePlaybackChirho : AudioPlaybackChirho {
    private val stateChirho = MutableStateFlow<PlaybackChirho>(PlaybackChirho.IdleChirho)
    override val playbackChirho: StateFlow<PlaybackChirho> = stateChirho
    val playedChirho = mutableListOf<Pair<String, Float>>()
    /** The clips themselves, in play order, so a test can compare a word's IPA with what its speaker played. */
    val clipsChirho = mutableListOf<ClipChirho>()
    var stopsChirho = 0

    override fun playChirho(keyChirho: String, clipChirho: ClipChirho, speedChirho: Float) {
        playedChirho += keyChirho to speedChirho
        clipsChirho += clipChirho
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
    override var openTodayChirho: Boolean = ReaderPreferencesChirho.DEFAULT_OPEN_TODAY_CHIRHO
    override var autoplayChirho: Boolean = ReaderPreferencesChirho.DEFAULT_AUTOPLAY_CHIRHO
    override var lastShownChirho: PassageChirho? = null
    override var showIpaChirho: Boolean = ReaderPreferencesChirho.DEFAULT_SHOW_IPA_CHIRHO
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
        greekIpaChirho: GreekIpaSourceChirho = GreekIpaSourceChirho.NONE_CHIRHO,
    ): ReaderViewModelChirho {
        val factoryChirho = viewModelFactory {
            initializer {
                ReaderViewModelChirho(
                    worldChirho.contentChirho, worldChirho.mediaChirho, worldChirho.audioChirho, { playbackChirho }, { videoChirho }, preferencesChirho,
                    SavedStateHandle(savedChirho?.let { mapOf(ReaderViewModelChirho.SAVED_PASSAGE_CHIRHO to it) } ?: emptyMap()),
                    explicitChirho?.let { PassageChirho.parseChirho(it) }, { todayChirho }, greekIpaChirho = greekIpaChirho,
                )
            }
        }
        return ViewModelProvider.create(storeChirho, factoryChirho)[ReaderViewModelChirho::class]
    }

    private fun ReaderViewModelChirho.shownChirho(): String? =
        (uiStateChirho.value.verseChirho as? VerseLoadChirho.ReadyChirho)?.loadedChirho?.verseChirho?.idChirho

    private fun TestScope.settleChirho() = advanceUntilIdle()

    private fun ReaderViewModelChirho.wordsChirho(): List<WordChirho> =
        (uiStateChirho.value.verseChirho as VerseLoadChirho.ReadyChirho).loadedChirho.verseChirho.wordsChirho

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

    /** Unit 175 (GPT, DM #3669): Show IPA is off until chosen, is kept for a fresh launch, and stops nothing playing. */
    @Test
    fun showIpaIsOffUntilChosenIsKeptAndStopsNothing() = runTest(dispatcherChirho) {
        val viewModelChirho = viewModelChirho(explicitChirho = "Prov.26.1")
        settleChirho()
        assertFalse(viewModelChirho.uiStateChirho.value.showIpaChirho)
        assertFalse("no IPA line until the reader turns it on", viewModelChirho.uiStateChirho.value.ipaLineChirho)
        viewModelChirho.toggleWordChirho(viewModelChirho.wordsChirho().first { viewModelChirho.wordClipAvailableChirho(it) })
        val stopsChirho = playbackChirho.stopsChirho
        viewModelChirho.setShowIpaChirho(true)
        assertTrue(preferencesChirho.showIpaChirho)
        assertTrue(viewModelChirho.uiStateChirho.value.ipaLineChirho)
        assertEquals("the word keeps playing", stopsChirho, playbackChirho.stopsChirho)
        assertTrue(playbackChirho.playbackChirho.value is PlaybackChirho.PlayingChirho)

        storeChirho.clear()
        val relaunchedChirho = viewModelChirho(explicitChirho = "Prov.26.1")
        settleChirho()
        assertTrue("kept for a fresh launch", relaunchedChirho.uiStateChirho.value.ipaLineChirho)
    }

    /** A Hebrew word's IPA is exactly the IPA of the clip its speaker plays; nothing else supplies one. */
    @Test
    fun aHebrewWordsIpaIsTheIpaOfTheClipItsSpeakerPlays() = runTest(dispatcherChirho) {
        val viewModelChirho = viewModelChirho(explicitChirho = "Prov.26.1")
        settleChirho()
        viewModelChirho.setShowIpaChirho(true)
        val wordsChirho = viewModelChirho.wordsChirho()
        for (wordChirho in wordsChirho) {
            val ipaChirho = viewModelChirho.uiStateChirho.value.wordIpaChirho(wordChirho)
            assertNotNull("every word of Proverbs 26:1 has a recording made from IPA: ${wordChirho.textChirho}", ipaChirho)
            viewModelChirho.toggleWordChirho(wordChirho)
            assertEquals(wordChirho.textChirho, playbackChirho.clipsChirho.last().ipaChirho, ipaChirho)
            viewModelChirho.toggleWordChirho(wordChirho)
        }
        assertEquals("each word played its own clip once", wordsChirho.size, playbackChirho.clipsChirho.size)
    }

    private val overridesChirho by lazy { SpokenOverridesChirho.decodeChirho(File(SPOKEN_OVERRIDES_CHIRHO).readBytes()) }

    private fun bundledGuideChirho() = GreekIpaGuideChirho.loadChirho { nameChirho ->
        File("src/main/assets/${GreekIpaGuideChirho.DIRECTORY_CHIRHO}", nameChirho).takeIf { it.isFile }?.readBytes()
    }

    /** The app's Greek source over the bundled guide, on the test's dispatcher so lookups settle with the rest. */
    private fun bundledSourceChirho() = GreekIpaSourceChirho(::bundledGuideChirho, { overridesChirho }, dispatcherChirho)

    /**
     * A Greek word's IPA is the bundled guide's value for the Greek pronunciation in effect (GPT, DM #3669): it follows
     * the reader's choice, never borrows another profile, and is looked up again for the next verse.
     */
    @Test
    fun aGreekWordsIpaFollowsThePronunciationInEffect() = runTest(dispatcherChirho) {
        val viewModelChirho = viewModelChirho(explicitChirho = "John.1.1", greekIpaChirho = bundledSourceChirho())
        settleChirho()
        assertFalse("off until chosen", viewModelChirho.uiStateChirho.value.ipaLineChirho)
        assertNull("nothing is looked up while Show IPA is off", viewModelChirho.uiStateChirho.value.greekIpaChirho)
        viewModelChirho.setShowIpaChirho(true)
        settleChirho()
        val guideChirho = requireNotNull(bundledGuideChirho())
        fun assertGuideValuesChirho() {
            val stateChirho = viewModelChirho.uiStateChirho.value
            assertTrue(stateChirho.ipaLineChirho)
            for (wordChirho in viewModelChirho.wordsChirho()) {
                val rowChirho = requireNotNull(guideChirho.rowChirho(SpokenChirho.wordChirho(wordChirho, overridesChirho)))
                assertEquals(wordChirho.textChirho, rowChirho.valueChirho(stateChirho.renditionChirho), stateChirho.wordIpaChirho(wordChirho))
                assertNotNull(stateChirho.wordIpaChirho(wordChirho))
            }
        }
        assertEquals(GreekRenditionChirho.MODERN_ASPIRATES_CHIRHO, viewModelChirho.uiStateChirho.value.renditionChirho)
        assertGuideValuesChirho()
        val aspiratesChirho = viewModelChirho.wordsChirho().map { viewModelChirho.uiStateChirho.value.wordIpaChirho(it) }
        viewModelChirho.setRenditionChirho(GreekRenditionChirho.ERASMIAN_CHIRHO)
        assertGuideValuesChirho()
        assertTrue(
            "Erasmian gives other values for some words",
            viewModelChirho.wordsChirho().map { viewModelChirho.uiStateChirho.value.wordIpaChirho(it) } != aspiratesChirho,
        )
        viewModelChirho.stepChirho(forwardChirho = true)
        settleChirho()
        assertEquals("John.1.2", viewModelChirho.shownChirho())
        assertGuideValuesChirho()
    }

    /** Without the guide (missing or changed assets), Greek passages carry no IPA line, quietly; nothing is guessed. */
    @Test
    fun withoutTheGuideGreekPassagesHaveNoIpaLine() = runTest(dispatcherChirho) {
        val viewModelChirho = viewModelChirho(explicitChirho = "John.1.1")
        settleChirho()
        viewModelChirho.setShowIpaChirho(true)
        val stateChirho = viewModelChirho.uiStateChirho.value
        assertTrue(stateChirho.showIpaChirho)
        assertFalse(stateChirho.ipaLineChirho)
        assertTrue(viewModelChirho.wordsChirho().all { stateChirho.wordIpaChirho(it) == null })
    }

    /**
     * The IPA line inherits every binding rule: an Aramaic word, or a word whose published clip no longer matches its
     * text, binds no clip and so has no IPA, while the other words keep theirs.
     */
    @Test
    fun aWordWithoutAnAcceptedClipHasNoIpa() = runTest(dispatcherChirho) {
        val loadedChirho = worldChirho.loadedChirho("Prov.26.1")
        val verseChirho = loadedChirho.verseChirho as HebrewVerseChirho
        val rawChirho = publishedRecordsChirho("audio-chirho/proverbs-chirho/chapter-26-chirho.json", "clips_chirho", "Prov.26.1")
        fun stateChirho(versionChirho: HebrewVerseChirho, clipsChirho: List<JsonObject>) = ReaderUiStateChirho(
            passageChirho = loadedChirho.passageChirho,
            recordingsChirho = OptionalChirho.ReadyChirho(
                AudioSelectionChirho.recordingsChirho(
                    clipsChirho, versionChirho, greekChirho = false,
                    canonicalSha256Chirho = sha256HexChirho(versionChirho.canonicalTextChirho.encodeToByteArray()),
                    decodeChirho = AudioRepositoryChirho::decodeClipChirho,
                ),
            ),
            showIpaChirho = true,
        )
        val targetChirho = verseChirho.tokensChirho.first()
        val otherChirho = verseChirho.tokensChirho.last()
        val publishedChirho = stateChirho(verseChirho, rawChirho)
        assertNotNull(publishedChirho.wordIpaChirho(targetChirho))

        val aramaicChirho = verseChirho.copy(
            tokensChirho = verseChirho.tokensChirho.map { if (it.idChirho == targetChirho.idChirho) it.copy(sourceLanguageChirho = "arc") else it },
        )
        val aramaicStateChirho = stateChirho(aramaicChirho, rawChirho)
        assertNull("an Aramaic word never takes a Hebrew recording's IPA", aramaicStateChirho.wordIpaChirho(aramaicChirho.tokensChirho.first()))
        assertEquals(publishedChirho.wordIpaChirho(otherChirho), aramaicStateChirho.wordIpaChirho(otherChirho))

        val changedChirho = rawChirho.map {
            if (it["token_id_chirho"]?.jsonPrimitive?.contentOrNull == targetChirho.idChirho) it.withChirho("text_chirho", "שָׁלוֹם") else it
        }
        assertNull("a clip made for other text binds nothing", stateChirho(verseChirho, changedChirho).wordIpaChirho(targetChirho))
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
        assertEquals("no video here: Play's label names the recording", VersePlayChirho.RECORDING_CHIRHO, stateChirho.versePlayChirho)
        val roughChirho = (stateChirho.verseChirho as VerseLoadChirho.ReadyChirho).loadedChirho.verseChirho.wordsChirho.first { it.textChirho == "ὁ" }
        assertTrue("a plain Modern word clip plays under Modern", viewModelChirho.wordClipAvailableChirho(roughChirho))
        viewModelChirho.toggleVerseChirho()
        assertEquals("verse:Matt.1.16" to 1f, playbackChirho.playedChirho.single())

        viewModelChirho.setRenditionChirho(GreekRenditionChirho.MODERN_ASPIRATES_CHIRHO)
        assertEquals("a switch stops the old reading at once", PlaybackChirho.IdleChirho, playbackChirho.playbackChirho.value)
        assertEquals(GreekRenditionChirho.MODERN_ASPIRATES_CHIRHO, preferencesChirho.renditionChirho)
        assertTrue("a silent rough breathing never stands for Aspirates", !viewModelChirho.verseClipAvailableChirho())
        assertEquals(VersePlayChirho.NONE_CHIRHO, viewModelChirho.uiStateChirho.value.versePlayChirho)
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
        assertEquals("Play's label names the video it will play", VersePlayChirho.VIDEO_CHIRHO, viewModelChirho.uiStateChirho.value.versePlayChirho)
        viewModelChirho.toggleVerseChirho()
        videoChirho.failChirho("verse:Prov.1.1")
        settleChirho()
        val failedChirho = viewModelChirho.uiStateChirho.value
        assertTrue(failedChirho.videoFailedChirho)
        assertNull("the still returns in the video's place", failedChirho.playableVideoChirho)
        assertEquals("then the label names the recording Play will read", VersePlayChirho.RECORDING_CHIRHO, failedChirho.versePlayChirho)
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
        assertEquals(VersePlayChirho.VIDEO_CHIRHO, viewModelChirho.uiStateChirho.value.versePlayChirho)
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
        assertEquals("with no recording to read, the label still names the video", VersePlayChirho.VIDEO_CHIRHO, stateChirho.versePlayChirho)
        val nothingChirho = stateChirho.copy(mediaChirho = OptionalChirho.ReadyChirho(VerseMediaChirho.EMPTY_CHIRHO))
        assertEquals("with neither, Play has nothing to name", VersePlayChirho.NONE_CHIRHO, nothingChirho.versePlayChirho)
    }

    /** Root's launch rules (GPT, DM #3642): a verse is kept once it loads, and resumed only with today's Proverbs off. */
    @Test
    fun aFreshLaunchOpensTodaysProverbsOrWithThatSwitchOffTheLastVerseShown() = runTest(dispatcherChirho) {
        val readerChirho = viewModelChirho(explicitChirho = "John.1.1")
        settleChirho()
        readerChirho.stepChirho(forwardChirho = true)
        settleChirho()
        assertEquals(PassageChirho("John", 1, 2), preferencesChirho.lastShownChirho)
        storeChirho.clear()

        val todayChirho = viewModelChirho()
        settleChirho()
        assertEquals("today's Proverbs is on by default", "Prov.3.1", todayChirho.shownChirho())
        todayChirho.setOpenTodayChirho(false)
        assertFalse(preferencesChirho.openTodayChirho)
        assertEquals("the verse being read stays", "Prov.3.1", todayChirho.shownChirho())
        todayChirho.selectBookChirho("John")
        settleChirho()
        storeChirho.clear()

        preferencesChirho.autoplayChirho = true
        val playedBeforeChirho = playbackChirho.playedChirho.size to videoChirho.playedChirho.size
        val resumedChirho = viewModelChirho()
        settleChirho()
        assertEquals("with it off, a fresh launch opens the last verse shown", "John.1.1", resumedChirho.shownChirho())
        assertEquals("a launch's first verse never plays by itself", playedBeforeChirho, playbackChirho.playedChirho.size to videoChirho.playedChirho.size)
    }

    @Test
    fun aVerseThatFailsToLoadIsNeverKeptForALaterLaunch() = runTest(dispatcherChirho) {
        worldChirho.transportChirho.failingChirho += "/content-chirho/proverbs-chirho/chapter-04-chirho.json"
        viewModelChirho(explicitChirho = "Prov.4.1")
        settleChirho()
        assertNull("a launch's failed first verse is not kept", preferencesChirho.lastShownChirho)
        storeChirho.clear()

        val readerChirho = viewModelChirho(explicitChirho = "Prov.3.1")
        settleChirho()
        readerChirho.selectChapterChirho(4)
        settleChirho()
        assertEquals(VerseLoadChirho.FailedChirho(FailureChirho.VERSE_CHIRHO), readerChirho.uiStateChirho.value.verseChirho)
        assertEquals("a verse the reader moved to but which failed is not kept either", PassageChirho("Prov", 3, 1), preferencesChirho.lastShownChirho)
    }

    /** A reader who turned autoplay off keeps it off: moving to a verse plays nothing (GPT, DM #3664). */
    @Test
    fun withAutoplaySavedOffMovingToAVersePlaysNothing() = runTest(dispatcherChirho) {
        preferencesChirho.autoplayChirho = false
        val viewModelChirho = viewModelChirho(explicitChirho = "Prov.26.1")
        settleChirho()
        assertFalse("the saved choice wins over the default", viewModelChirho.uiStateChirho.value.autoplayChirho)
        viewModelChirho.stepChirho(forwardChirho = true)
        settleChirho()
        assertEquals("Prov.26.2", viewModelChirho.shownChirho())
        assertTrue(playbackChirho.playedChirho.isEmpty() && videoChirho.playedChirho.isEmpty())
    }

    /** With nothing saved, as on a new install, a verse the reader moves to plays by itself; the launch's first verse stays quiet. */
    @Test
    fun withNothingSavedAVerseTheReaderMovesToPlaysByItself() = runTest(dispatcherChirho) {
        val viewModelChirho = viewModelChirho(explicitChirho = "Prov.26.1")
        settleChirho()
        assertTrue("on by default (L.J., via GPT DM #3664)", viewModelChirho.uiStateChirho.value.autoplayChirho)
        assertTrue("the launch's first verse stays quiet", playbackChirho.playedChirho.isEmpty() && videoChirho.playedChirho.isEmpty())
        viewModelChirho.stepChirho(forwardChirho = true)
        settleChirho()
        assertEquals(listOf("verse:Prov.26.2" to 1f), playbackChirho.playedChirho)
    }

    /** A verse the reader moves to presses its own Play once, at the saved speed; the launch's first verse never does (GPT, DM #3642). */
    @Test
    fun withAutoplayOnOnlyAVerseTheReaderMovesToPlaysByItself() = runTest(dispatcherChirho) {
        preferencesChirho.speedChirho = 0.85f
        val firstChirho = viewModelChirho(explicitChirho = "Prov.26.1")
        settleChirho()
        firstChirho.setAutoplayChirho(true)
        assertTrue(preferencesChirho.autoplayChirho)
        assertTrue("choosing autoplay starts nothing for the verse being read", playbackChirho.playedChirho.isEmpty())
        storeChirho.clear()

        val relaunchedChirho = viewModelChirho(explicitChirho = "Prov.26.1")
        settleChirho()
        assertTrue("the launch's first verse never plays by itself", playbackChirho.playedChirho.isEmpty() && videoChirho.playedChirho.isEmpty())
        relaunchedChirho.stepChirho(forwardChirho = true)
        settleChirho()
        assertEquals("Prov.26.2", relaunchedChirho.shownChirho())
        assertEquals("Be'eri's reading of the new verse, at the saved speed", listOf("verse:Prov.26.2" to 0.85f), playbackChirho.playedChirho)
        relaunchedChirho.selectVerseChirho(5)
        settleChirho()
        assertEquals("a verse chosen from the list plays too", listOf("verse:Prov.26.2" to 0.85f, "verse:Prov.26.5" to 0.85f), playbackChirho.playedChirho)
    }

    @Test
    fun aNewerSelectionCancelsAPendingAutoplay() = runTest(dispatcherChirho) {
        preferencesChirho.autoplayChirho = true
        val viewModelChirho = viewModelChirho(explicitChirho = "Prov.26.28")
        settleChirho()
        val gateChirho = CompletableDeferred<Unit>()
        worldChirho.transportChirho.gatesChirho["/audio-chirho/proverbs-chirho/chapter-27-chirho.json"] = gateChirho
        viewModelChirho.stepChirho(forwardChirho = true)
        settleChirho()
        assertEquals("Prov.27.1", viewModelChirho.shownChirho())
        assertTrue("Play waits until it can choose between a video and a recording", playbackChirho.playedChirho.isEmpty())
        viewModelChirho.stepChirho(forwardChirho = false)
        settleChirho()
        gateChirho.complete(Unit)
        settleChirho()
        assertEquals("Prov.26.28", viewModelChirho.shownChirho())
        assertEquals("only the newest verse plays", listOf("verse:Prov.26.28" to 1f), playbackChirho.playedChirho)
    }

    @Test
    fun autoplayNeverInterruptsASoundTheReaderStarted() = runTest(dispatcherChirho) {
        preferencesChirho.autoplayChirho = true
        val viewModelChirho = viewModelChirho(explicitChirho = "Prov.26.28")
        settleChirho()
        val gateChirho = CompletableDeferred<Unit>()
        worldChirho.transportChirho.gatesChirho["/media-chirho/proverbs-chirho/chapter-27-chirho.json"] = gateChirho
        viewModelChirho.stepChirho(forwardChirho = true)
        settleChirho()
        val wordChirho = (viewModelChirho.uiStateChirho.value.verseChirho as VerseLoadChirho.ReadyChirho).loadedChirho.verseChirho
            .wordsChirho.first { viewModelChirho.wordClipAvailableChirho(it) }
        viewModelChirho.toggleWordChirho(wordChirho)
        gateChirho.complete(Unit)
        settleChirho()
        assertEquals("the reader's word plays; the verse never starts over it", listOf("word:Prov.27.1:${wordChirho.idChirho}" to 1f), playbackChirho.playedChirho)
        assertTrue(videoChirho.playedChirho.isEmpty())
    }

    @Test
    fun withAutoplayAVerseVideoPlaysInTheScenesPlace() = runTest(dispatcherChirho) {
        worldChirho = PublishedWorldChirho.orSkipChirho(dispatcherChirho, FixedStagedVideosChirho(sampleVideoChirho()))
        preferencesChirho.autoplayChirho = true
        val viewModelChirho = viewModelChirho(explicitChirho = "Prov.1.2")
        settleChirho()
        viewModelChirho.stepChirho(forwardChirho = false)
        settleChirho()
        assertEquals("Prov.1.1", viewModelChirho.shownChirho())
        assertEquals(listOf("verse:Prov.1.1" to 1f), videoChirho.playedChirho)
        assertTrue("its reading is the video's own sound, not a second recording", playbackChirho.playedChirho.isEmpty())
    }

    /** Matthew 1:16 has rough breathing and only a plain Modern reading (theAutomaticRenditionFollowsTheVerseUntilAChoiceIsSaved). */
    @Test
    fun autoplayFollowsTheReadingInEffect() = runTest(dispatcherChirho) {
        preferencesChirho.autoplayChirho = true
        val automaticChirho = viewModelChirho(explicitChirho = "Matt.1.15")
        settleChirho()
        automaticChirho.stepChirho(forwardChirho = true)
        settleChirho()
        assertEquals("with nothing saved, the verse's automatic Modern reading plays", listOf("verse:Matt.1.16" to 1f), playbackChirho.playedChirho)
        storeChirho.clear()

        preferencesChirho.renditionChirho = GreekRenditionChirho.MODERN_ASPIRATES_CHIRHO
        val aspiratesChirho = viewModelChirho(explicitChirho = "Matt.1.15")
        settleChirho()
        aspiratesChirho.stepChirho(forwardChirho = true)
        settleChirho()
        assertEquals("Matt.1.16", aspiratesChirho.shownChirho())
        assertEquals("a saved Aspirates choice never borrows that plain Modern reading", 1, playbackChirho.playedChirho.size)
    }

    // Unit 194 (frozen contract 8c33593f, GPT DM #3807): a video whose sound is a synthesized Greek recording plays only
    // while that exact recording is the one chosen under the reading in effect; otherwise the same Play reads the chosen one.

    /** John 1:1 has Modern with Aspirates, Modern and Erasmian readings; with nothing saved it follows Aspirates. */
    private fun johnGreekVideoChirho() =
        sampleGreekVideoChirho("john-chirho", "John.1.1", publishedVerseClipChirho("john-chirho", "John.1.1", "modern_greek_aspirates"))

    @Test
    fun aGreekVideoPlaysOnlyWhileItsClipIsTheReadingInEffect() = runTest(dispatcherChirho) {
        val greekVideoChirho = johnGreekVideoChirho()
        worldChirho = PublishedWorldChirho.orSkipChirho(dispatcherChirho, FixedStagedVideosChirho(greekVideoChirho))
        val viewModelChirho = viewModelChirho(explicitChirho = "John.1.1")
        settleChirho()
        val automaticChirho = viewModelChirho.uiStateChirho.value
        assertEquals(GreekRenditionChirho.MODERN_ASPIRATES_CHIRHO, automaticChirho.renditionChirho)
        assertEquals(greekVideoChirho, automaticChirho.playableVideoChirho)
        assertEquals(VersePlayChirho.VIDEO_CHIRHO, automaticChirho.versePlayChirho)
        viewModelChirho.toggleVerseChirho()
        settleChirho()
        assertEquals(listOf("verse:John.1.1" to 1f), videoChirho.playedChirho)
        assertTrue("its sound is the chosen recording, not a second track", playbackChirho.playedChirho.isEmpty())

        viewModelChirho.setRenditionChirho(GreekRenditionChirho.MODERN_CHIRHO)
        assertEquals("a reading change stops the video at once", PlaybackChirho.IdleChirho, videoChirho.playbackChirho.value)
        val modernChirho = viewModelChirho.uiStateChirho.value
        assertNull("a saved Modern choice is never overridden by the Aspirates video", modernChirho.playableVideoChirho)
        assertEquals("the same Play now names the chosen recording", VersePlayChirho.RECORDING_CHIRHO, modernChirho.versePlayChirho)
        assertEquals("modern_greek", modernChirho.verseClipChirho?.pronunciationChirho)
        viewModelChirho.toggleVerseChirho()
        assertEquals(listOf(modernChirho.verseClipChirho), playbackChirho.clipsChirho)
        assertEquals("the video is not started again", 1, videoChirho.playedChirho.size)

        viewModelChirho.setRenditionChirho(GreekRenditionChirho.ERASMIAN_CHIRHO)
        val erasmianChirho = viewModelChirho.uiStateChirho.value
        assertNull(erasmianChirho.playableVideoChirho)
        assertEquals("erasmian_greek", erasmianChirho.verseClipChirho?.pronunciationChirho)

        viewModelChirho.setRenditionChirho(GreekRenditionChirho.MODERN_ASPIRATES_CHIRHO)
        assertEquals("back on its own reading, the video returns", greekVideoChirho, viewModelChirho.uiStateChirho.value.playableVideoChirho)
    }

    /** Matthew 1:16 has rough breathing and only a plain Modern reading (theAutomaticRenditionFollowsTheVerseUntilAChoiceIsSaved). */
    @Test
    fun withoutAChosenRecordingAGreekVideoNeverPlays() = runTest(dispatcherChirho) {
        val greekVideoChirho = sampleGreekVideoChirho(
            "matthew-chirho", "Matt.1.16", publishedVerseClipChirho("matthew-chirho", "Matt.1.16", "modern_greek"),
        )
        worldChirho = PublishedWorldChirho.orSkipChirho(dispatcherChirho, FixedStagedVideosChirho(greekVideoChirho))
        val viewModelChirho = viewModelChirho(explicitChirho = "Matt.1.16")
        settleChirho()
        assertEquals("with nothing saved its Modern reading is chosen, and so the video", greekVideoChirho, viewModelChirho.uiStateChirho.value.playableVideoChirho)
        viewModelChirho.setRenditionChirho(GreekRenditionChirho.MODERN_ASPIRATES_CHIRHO)
        val aspiratesChirho = viewModelChirho.uiStateChirho.value
        assertNull("no recording is chosen for Aspirates here", aspiratesChirho.verseClipChirho)
        assertNull("so no video either", aspiratesChirho.playableVideoChirho)
        assertEquals(VersePlayChirho.NONE_CHIRHO, aspiratesChirho.versePlayChirho)
        viewModelChirho.toggleVerseChirho()
        assertTrue(videoChirho.playedChirho.isEmpty() && playbackChirho.playedChirho.isEmpty())

        // While recordings load, after they fail, or with none, a synthesized soundtrack is never assumed.
        val mediaChirho = OptionalChirho.ReadyChirho(VerseMediaChirho.EMPTY_CHIRHO.copy(videoChirho = greekVideoChirho))
        val pendingChirho = listOf(
            OptionalChirho.LoadingChirho, OptionalChirho.UnavailableChirho, OptionalChirho.ReadyChirho(VerseRecordingsChirho.EMPTY_CHIRHO),
        )
        for (recordingsChirho in pendingChirho) {
            val stateChirho = ReaderUiStateChirho(
                passageChirho = PassageChirho("Matt", 1, 16), catalogueChirho = bundledCatalogueChirho(),
                mediaChirho = mediaChirho, recordingsChirho = recordingsChirho,
            )
            assertNull(stateChirho.playableVideoChirho)
            assertEquals(VersePlayChirho.NONE_CHIRHO, stateChirho.versePlayChirho)
        }
        val humanChirho = ReaderUiStateChirho(
            passageChirho = PassageChirho("Prov", 1, 1),
            mediaChirho = OptionalChirho.ReadyChirho(VerseMediaChirho.EMPTY_CHIRHO.copy(videoChirho = sampleVideoChirho())),
            recordingsChirho = OptionalChirho.UnavailableChirho,
        )
        assertEquals("a Be'eri video still plays with its own reading", sampleVideoChirho(), humanChirho.playableVideoChirho)
    }

    /** A word clip that shares the soundtrack's MP3 bytes is still a word's: it never unlocks the verse's video. */
    @Test
    fun aWordClipWithTheSameMp3NeverUnlocksAGreekVideo() = runTest(dispatcherChirho) {
        val rowChirho = publishedVerseClipChirho("john-chirho", "John.1.1", "modern_greek_aspirates")
        val greekVideoChirho = sampleGreekVideoChirho("john-chirho", "John.1.1", rowChirho)
        val verseClipChirho = requireNotNull(AudioRepositoryChirho.decodeClipChirho(rowChirho))
        val wordClipChirho = requireNotNull(AudioRepositoryChirho.decodeClipChirho(rowChirho.withChirho("token_id_chirho", "John.1.1!1")))
        fun stateChirho(recordingsChirho: VerseRecordingsChirho) = ReaderUiStateChirho(
            passageChirho = PassageChirho("John", 1, 1), catalogueChirho = bundledCatalogueChirho(),
            mediaChirho = OptionalChirho.ReadyChirho(VerseMediaChirho.EMPTY_CHIRHO.copy(videoChirho = greekVideoChirho)),
            recordingsChirho = OptionalChirho.ReadyChirho(recordingsChirho),
        )
        assertEquals(greekVideoChirho, stateChirho(VerseRecordingsChirho(emptyMap(), listOf(verseClipChirho))).playableVideoChirho)
        assertNull(
            "as a word's clip it is no verse recording",
            stateChirho(VerseRecordingsChirho(mapOf("John.1.1!1" to listOf(wordClipChirho)), emptyList())).playableVideoChirho,
        )
        assertNull(
            "even where a verse recording would be, a word token refuses",
            stateChirho(VerseRecordingsChirho(emptyMap(), listOf(wordClipChirho))).playableVideoChirho,
        )

        worldChirho = PublishedWorldChirho.orSkipChirho(dispatcherChirho, FixedStagedVideosChirho(greekVideoChirho))
        val viewModelChirho = viewModelChirho(explicitChirho = "John.1.1")
        settleChirho()
        val wordChirho = viewModelChirho.wordsChirho().first { viewModelChirho.wordClipAvailableChirho(it) }
        viewModelChirho.toggleWordChirho(wordChirho)
        settleChirho()
        assertTrue("a word speaker never starts the video", videoChirho.playedChirho.isEmpty())
        assertEquals("word:John.1.1:${wordChirho.idChirho}", playbackChirho.playedChirho.single().first)
    }

    @Test
    fun aFailedGreekVideoGivesWayToItsChosenRecordingOverTheStill() = runTest(dispatcherChirho) {
        val greekVideoChirho = johnGreekVideoChirho()
        worldChirho = PublishedWorldChirho.orSkipChirho(dispatcherChirho, FixedStagedVideosChirho(greekVideoChirho))
        val viewModelChirho = viewModelChirho(explicitChirho = "John.1.1")
        settleChirho()
        viewModelChirho.toggleVerseChirho()
        videoChirho.failChirho("verse:John.1.1")
        settleChirho()
        val failedChirho = viewModelChirho.uiStateChirho.value
        assertNull("the still returns in the video's place", failedChirho.playableVideoChirho)
        assertEquals(VersePlayChirho.RECORDING_CHIRHO, failedChirho.versePlayChirho)
        viewModelChirho.toggleVerseChirho()
        assertEquals(
            "the same Play reads the very recording the video carried",
            greekVideoChirho.embeddedClipChirho?.sha256Chirho, playbackChirho.clipsChirho.single().sha256Chirho,
        )
        assertEquals("the video is not tried again", 1, videoChirho.playedChirho.size)
    }

    @Test
    fun withAutoplayAGreekVideoStartsOnlyWhenItsClipIsChosen() = runTest(dispatcherChirho) {
        val greekVideoChirho = johnGreekVideoChirho()
        worldChirho = PublishedWorldChirho.orSkipChirho(dispatcherChirho, FixedStagedVideosChirho(greekVideoChirho))
        preferencesChirho.autoplayChirho = true
        val automaticChirho = viewModelChirho(explicitChirho = "John.1.2")
        settleChirho()
        automaticChirho.stepChirho(forwardChirho = false)
        settleChirho()
        assertEquals("John.1.1", automaticChirho.shownChirho())
        assertEquals(listOf("verse:John.1.1" to 1f), videoChirho.playedChirho)
        assertTrue(playbackChirho.playedChirho.isEmpty())
        storeChirho.clear()

        preferencesChirho.renditionChirho = GreekRenditionChirho.MODERN_CHIRHO
        val modernChirho = viewModelChirho(explicitChirho = "John.1.2")
        settleChirho()
        modernChirho.stepChirho(forwardChirho = false)
        settleChirho()
        assertEquals("John.1.1", modernChirho.shownChirho())
        assertEquals("a saved Modern choice autoplays its own recording", listOf("verse:John.1.1" to 1f), playbackChirho.playedChirho)
        assertEquals("modern_greek", playbackChirho.clipsChirho.single().pronunciationChirho)
        assertEquals("and not the video", 1, videoChirho.playedChirho.size)
    }
}
