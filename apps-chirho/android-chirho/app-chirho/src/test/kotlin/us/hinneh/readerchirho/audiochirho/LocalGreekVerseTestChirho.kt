// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
package us.hinneh.readerchirho.audiochirho

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.runBlocking
import kotlinx.serialization.json.JsonNull
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Test
import us.hinneh.readerchirho.PublishedWorldChirho
import us.hinneh.readerchirho.audiochirho.GreekRenditionChirho.ERASMIAN_CHIRHO
import us.hinneh.readerchirho.audiochirho.GreekRenditionChirho.MODERN_ASPIRATES_CHIRHO
import us.hinneh.readerchirho.audiochirho.GreekRenditionChirho.MODERN_CHIRHO
import us.hinneh.readerchirho.contentchirho.LoadedVerseChirho
import us.hinneh.readerchirho.domainchirho.SpokenChirho
import us.hinneh.readerchirho.remotechirho.sha256HexChirho
import us.hinneh.readerchirho.withChirho

/**
 * Local Chatterbox V3 whole-verse readings (GPT, DM #3449) over published Matthew verses. They are plain
 * Modern with rough breathing silent: they serve Modern, serve Modern with Aspirates only when the spoken
 * verse has no rough breathing, and never serve Erasmian. The bound text stays the exact canonical verse;
 * the monotonic spelling is only the model's input.
 */
class LocalGreekVerseTestChirho {
    /** Matthew 1:2 has only smooth breathings. Inputs are the producer's plain_sent_chirho for each verse. */
    private val smoothSentChirho =
        "Αβραάμ εγέννησεν τον Ισαάκ, Ισαάκ δε εγέννησεν τον Ιακώβ, Ιακώβ δε εγέννησεν τον Ιούδαν και τους αδελφούς αυτού,"

    /** Matthew 1:16 has two rough breathings (ἧς, ὁ). */
    private val roughSentChirho = "Ιακώβ δε εγέννησεν τον Ιωσήφ τον άνδρα Μαρίας, εξ ης εγεννήθη Ιησούς ο λεγόμενος Χριστός."

    private fun canonicalShaChirho(loadedChirho: LoadedVerseChirho) =
        sha256HexChirho(loadedChirho.verseChirho.canonicalTextChirho.encodeToByteArray())

    /** The record shape root publishes for this recipe: exact spoken text, monotonic synthesis text, audition. */
    private fun clipChirho(loadedChirho: LoadedVerseChirho, sentChirho: String): JsonObject {
        val shaChirho = "c".repeat(64)
        return buildJsonObject {
            put("lesson_id_chirho", loadedChirho.verseChirho.idChirho)
            put("token_id_chirho", JsonNull)
            put("text_chirho", SpokenChirho.verseChirho(loadedChirho.verseChirho))
            put("synthesis_text_chirho", sentChirho)
            put("recipe_id_chirho", AudioSelectionChirho.LOCAL_GREEK_VERSE_RECIPE_CHIRHO)
            put("canonical_sha256_chirho", canonicalShaChirho(loadedChirho))
            put("language_chirho", "el")
            put("pronunciation_chirho", "modern_greek")
            put("voice_name_chirho", "Chatterbox Multilingual V3 (built-in voice)")
            put("asset_path_chirho", "/audio-chirho/sha256-chirho/$shaChirho-chirho.mp3")
            put("sha256_chirho", shaChirho)
            put("bytes_chirho", 55_148)
            put("duration_chirho", 6.888)
            put("review_chirho", "audition")
        }
    }

    private fun versesChirho(loadedChirho: LoadedVerseChirho, rawChirho: List<JsonObject>) =
        AudioSelectionChirho.recordingsChirho(
            rawChirho, loadedChirho.verseChirho, loadedChirho.bookChirho.greekChirho, canonicalShaChirho(loadedChirho),
            AudioRepositoryChirho::decodeClipChirho,
        ).versesChirho

    @Test
    fun plainModernReadingsStandForAspiratesOnlyWithoutRoughBreathing() = runBlocking {
        val worldChirho = PublishedWorldChirho.orSkipChirho(Dispatchers.Unconfined)
        val smoothChirho = worldChirho.loadedChirho("Matt.1.2")
        val roughChirho = worldChirho.loadedChirho("Matt.1.16")
        fun bestChirho(loadedChirho: LoadedVerseChirho, sentChirho: String, renditionChirho: GreekRenditionChirho) =
            AudioSelectionChirho.bestChirho(versesChirho(loadedChirho, listOf(clipChirho(loadedChirho, sentChirho))), true, renditionChirho)
        assertNotNull(bestChirho(smoothChirho, smoothSentChirho, MODERN_CHIRHO))
        assertNotNull(bestChirho(smoothChirho, smoothSentChirho, MODERN_ASPIRATES_CHIRHO))
        assertNull("Erasmian never borrows a Modern reading", bestChirho(smoothChirho, smoothSentChirho, ERASMIAN_CHIRHO))
        assertNotNull(bestChirho(roughChirho, roughSentChirho, MODERN_CHIRHO))
        assertNull("a silent rough breathing never stands for Aspirates", bestChirho(roughChirho, roughSentChirho, MODERN_ASPIRATES_CHIRHO))
        assertNull(bestChirho(roughChirho, roughSentChirho, ERASMIAN_CHIRHO))
    }

    @Test
    fun theRecipeKeepsItsPlainModernProfileAndItsExactSourceVerse() = runBlocking {
        val worldChirho = PublishedWorldChirho.orSkipChirho(Dispatchers.Unconfined)
        val loadedChirho = worldChirho.loadedChirho("Matt.1.2")
        val goodChirho = clipChirho(loadedChirho, smoothSentChirho)
        assertEquals(1, versesChirho(loadedChirho, listOf(goodChirho)).size)
        val mutationsChirho = listOf<(JsonObject) -> JsonObject>(
            { it.withChirho("pronunciation_chirho", "modern_greek_aspirates") },
            { it.withChirho("pronunciation_chirho", "erasmian_greek") },
            { it.withChirho("lesson_id_chirho", "Matt.1.3") },
            { it.withChirho("canonical_sha256_chirho", "0".repeat(64)) },
            // The monotonic model input is never the bound text.
            { it.withChirho("text_chirho", smoothSentChirho) },
            { it.withChirho("language_chirho", "he") },
        )
        for ((indexChirho, mutationChirho) in mutationsChirho.withIndex()) {
            assertEquals("mutation $indexChirho", 0, versesChirho(loadedChirho, listOf(mutationChirho(goodChirho))).size)
        }
        // A Greek recipe never voices a Hebrew verse.
        val hebrewChirho = worldChirho.loadedChirho("Prov.26.1")
        val hebrewClipChirho = clipChirho(hebrewChirho, smoothSentChirho)
            .withChirho("language_chirho", "he").withChirho("pronunciation_chirho", "israeli_hebrew")
        assertEquals(0, versesChirho(hebrewChirho, listOf(hebrewClipChirho)).size)
    }
}
