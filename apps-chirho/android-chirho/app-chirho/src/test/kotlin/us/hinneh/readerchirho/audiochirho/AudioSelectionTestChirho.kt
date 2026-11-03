// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
package us.hinneh.readerchirho.audiochirho

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.runBlocking
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test
import us.hinneh.readerchirho.PublishedWorldChirho
import us.hinneh.readerchirho.audiochirho.GreekRenditionChirho.ERASMIAN_CHIRHO
import us.hinneh.readerchirho.audiochirho.GreekRenditionChirho.MODERN_ASPIRATES_CHIRHO
import us.hinneh.readerchirho.audiochirho.GreekRenditionChirho.MODERN_CHIRHO
import us.hinneh.readerchirho.contentchirho.LoadedVerseChirho
import us.hinneh.readerchirho.contentchirho.WordChirho
import us.hinneh.readerchirho.publishedRecordsChirho
import us.hinneh.readerchirho.remotechirho.ResourceKindChirho
import us.hinneh.readerchirho.remotechirho.TrustedOriginChirho
import us.hinneh.readerchirho.remotechirho.sha256HexChirho
import us.hinneh.readerchirho.withChirho

/** Recording binding and choice over the repository's published Proverbs 26 and John 1 audio. */
class AudioSelectionTestChirho {
    private val rejectedChirho = "6a404d94c40e869718b48a3aa3c2083cb42ecd1596d720465fb2d7dac9d8975e"

    private fun countChirho(recordingsChirho: VerseRecordingsChirho) =
        recordingsChirho.versesChirho.size + recordingsChirho.wordsChirho.values.sumOf { it.size }

    private fun selectChirho(loadedChirho: LoadedVerseChirho, rawChirho: List<JsonObject>, canonicalChirho: String? = null) =
        AudioSelectionChirho.recordingsChirho(
            rawChirho, loadedChirho.verseChirho, loadedChirho.bookChirho.greekChirho,
            canonicalChirho ?: sha256HexChirho(loadedChirho.verseChirho.canonicalTextChirho.encodeToByteArray()),
            AudioRepositoryChirho::decodeClipChirho,
        )

    @Test
    fun hebrewVerseBindsEveryWordAndPrefersTheConnectedReading() = runBlocking {
        val worldChirho = PublishedWorldChirho.orSkipChirho(Dispatchers.Unconfined)
        val loadedChirho = worldChirho.loadedChirho("Prov.26.1")
        val recordingsChirho = worldChirho.audioChirho.recordingsChirho(loadedChirho)
        for (wordChirho in loadedChirho.verseChirho.wordsChirho) {
            assertNotNull(wordChirho.textChirho, AudioSelectionChirho.bestChirho(recordingsChirho.wordsChirho[wordChirho.idChirho], false, MODERN_ASPIRATES_CHIRHO))
        }
        val verseChirho = requireNotNull(AudioSelectionChirho.bestChirho(recordingsChirho.versesChirho, false, MODERN_ASPIRATES_CHIRHO))
        assertEquals(AudioSelectionChirho.HEBREW_CONNECTED_RECIPE_CHIRHO, verseChirho.recipeIdChirho)
        val clipsChirho = recordingsChirho.versesChirho + recordingsChirho.wordsChirho.values.flatten()
        assertTrue(clipsChirho.all { TrustedOriginChirho.isTrustedPathChirho(it.assetPathChirho, ResourceKindChirho.AUDIO_CLIP_CHIRHO) })
        // Every clip published for this verse passes the same rules the website applies.
        val rawChirho = publishedRecordsChirho("audio-chirho/proverbs-chirho/chapter-26-chirho.json", "clips_chirho", "Prov.26.1")
        assertEquals(rawChirho.size, countChirho(recordingsChirho))
    }

    @Test
    fun rejectedBytesChangedTextAndUnknownShapesAreWithheld() = runBlocking {
        val worldChirho = PublishedWorldChirho.orSkipChirho(Dispatchers.Unconfined)
        val loadedChirho = worldChirho.loadedChirho("Prov.26.1")
        val rawChirho = publishedRecordsChirho("audio-chirho/proverbs-chirho/chapter-26-chirho.json", "clips_chirho", "Prov.26.1")
        assertEquals(VerseRecordingsChirho.EMPTY_CHIRHO, selectChirho(loadedChirho, rawChirho, canonicalChirho = "0".repeat(64)))
        val mutationsChirho = listOf<(JsonObject) -> JsonObject>(
            { it.withChirho("sha256_chirho", rejectedChirho).withChirho("asset_path_chirho", "/audio-chirho/sha256-chirho/$rejectedChirho-chirho.mp3") },
            { it.withChirho("text_chirho", "שָׁלוֹם") },
            { it.withChirho("recipe_id_chirho", "unknown-recipe-chirho") },
            { it.withChirho("asset_path_chirho", "/audio-chirho/other-chirho.mp3") },
            { it.withChirho("review_chirho", "rejected") },
            { it.withChirho("lesson_id_chirho", "Prov.26.2") },
            { it.withChirho("language_chirho", "el") },
        )
        for ((indexChirho, mutationChirho) in mutationsChirho.withIndex()) {
            assertEquals("mutation $indexChirho", 0, countChirho(selectChirho(loadedChirho, rawChirho.map(mutationChirho))))
        }
    }

    @Test
    fun recordingsForAnotherTextEditionOrAnUnlistedChapterNeverPlay() = runBlocking {
        val worldChirho = PublishedWorldChirho.orSkipChirho(Dispatchers.Unconfined)
        val loadedChirho = worldChirho.loadedChirho("Prov.26.1")
        val otherEditionChirho = loadedChirho.copy(entryChirho = loadedChirho.entryChirho.copy(sha256Chirho = "0".repeat(64)))
        assertEquals(VerseRecordingsChirho.EMPTY_CHIRHO, worldChirho.audioChirho.recordingsChirho(otherEditionChirho))
        worldChirho.transportChirho.requestsChirho.clear()
        val unlistedChirho = loadedChirho.copy(passageChirho = loadedChirho.passageChirho.copy(chapterChirho = 99))
        assertEquals(VerseRecordingsChirho.EMPTY_CHIRHO, worldChirho.audioChirho.recordingsChirho(unlistedChirho))
        assertTrue(worldChirho.transportChirho.requestsChirho.none { it.contains("chapter-99") })
    }

    @Test
    fun greekWordsAndVersesFollowTheChosenReading() = runBlocking {
        val worldChirho = PublishedWorldChirho.orSkipChirho(Dispatchers.Unconfined)
        val loadedChirho = worldChirho.loadedChirho("John.1.1")
        val recordingsChirho = worldChirho.audioChirho.recordingsChirho(loadedChirho)
        val wordsChirho = loadedChirho.verseChirho.wordsChirho
        fun bestChirho(wordChirho: WordChirho, renditionChirho: GreekRenditionChirho) =
            AudioSelectionChirho.bestChirho(recordingsChirho.wordsChirho[wordChirho.idChirho], true, renditionChirho)
        val smoothChirho = wordsChirho.first { it.textChirho == "Ἐν" }
        val roughChirho = wordsChirho.first { it.textChirho == "ὁ" }
        assertEquals(wordsChirho.size, recordingsChirho.wordsChirho.size)
        assertNotNull(bestChirho(smoothChirho, MODERN_ASPIRATES_CHIRHO))
        assertNull("a bulk Modern clip never stands for an aspirated word", bestChirho(roughChirho, MODERN_ASPIRATES_CHIRHO))
        assertNotNull(bestChirho(roughChirho, MODERN_CHIRHO))
        assertNull("Erasmian never borrows a Modern recording", bestChirho(smoothChirho, ERASMIAN_CHIRHO))
        fun verseProfileChirho(renditionChirho: GreekRenditionChirho) =
            AudioSelectionChirho.bestChirho(recordingsChirho.versesChirho, true, renditionChirho)?.pronunciationChirho
        assertEquals("modern_greek_aspirates", verseProfileChirho(MODERN_ASPIRATES_CHIRHO))
        assertEquals("modern_greek", verseProfileChirho(MODERN_CHIRHO))
        assertEquals("erasmian_greek", verseProfileChirho(ERASMIAN_CHIRHO))
        val rawChirho = publishedRecordsChirho("audio-chirho/john-chirho/chapter-01-chirho.json", "clips_chirho", "John.1.1")
        assertEquals(rawChirho.size, countChirho(recordingsChirho))
    }

    @Test
    fun greekWordLibraryClipsMustSpeakTheExactLowercaseSourceForm() = runBlocking {
        val worldChirho = PublishedWorldChirho.orSkipChirho(Dispatchers.Unconfined)
        val loadedChirho = worldChirho.loadedChirho("John.1.1")
        val libraryChirho = publishedRecordsChirho("audio-chirho/john-chirho/chapter-01-chirho.json", "clips_chirho", "John.1.1")
            .filter { (it["recipe_id_chirho"] as? JsonPrimitive)?.content == AudioSelectionChirho.GREEK_WORD_RECIPE_CHIRHO }
        assertTrue(libraryChirho.isNotEmpty())
        assertEquals(libraryChirho.size, countChirho(selectChirho(loadedChirho, libraryChirho)))
        val capitalChirho = libraryChirho.map { it.withChirho("synthesis_text_chirho", (it["text_chirho"] as JsonPrimitive).content) }
            .filter { (it["text_chirho"] as JsonPrimitive).content.first().isUpperCase() }
        assertTrue(capitalChirho.isNotEmpty())
        assertEquals(0, countChirho(selectChirho(loadedChirho, capitalChirho)))
    }
}
