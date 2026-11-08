// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
package us.hinneh.readerchirho.domainchirho

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.runBlocking
import kotlinx.serialization.json.JsonNull
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotEquals
import org.junit.Test
import us.hinneh.readerchirho.PublishedWorldChirho
import us.hinneh.readerchirho.SPOKEN_OVERRIDES_CHIRHO
import us.hinneh.readerchirho.contentchirho.HebrewVerseChirho
import us.hinneh.readerchirho.contentchirho.HebrewWordChirho
import us.hinneh.readerchirho.contentchirho.QereChirho
import us.hinneh.readerchirho.publishedAudioEntriesChirho
import java.io.File

/**
 * The reviewed spoken readings exported from the website (GPT, DM #3551) speak as the website does: a word clip speaks
 * its own word, a verse reads a whole written group once, and anything changed falls back to the source words.
 */
class SpokenOverridesTestChirho {
    private val overridesChirho = SpokenOverridesChirho.decodeChirho(File(SPOKEN_OVERRIDES_CHIRHO).readBytes())

    private fun JsonObject.textChirho(keyChirho: String) = (this[keyChirho] as? JsonPrimitive)?.takeUnless { it is JsonNull }?.content

    @Test
    fun theExportedReviewsSpeakExactlyThePublishedTexts() = runBlocking {
        assertEquals(3, overridesChirho.sizeChirho)
        val worldChirho = PublishedWorldChirho.orSkipChirho(Dispatchers.Unconfined)
        val lamChirho = worldChirho.loadedChirho("Lam.4.3").verseChirho
        val lamEntriesChirho = publishedAudioEntriesChirho("audio-chirho/lamentations-chirho/chapter-04-chirho.json", "Lam.4.3")
        val wordsChirho = lamChirho.wordsChirho.associateBy { it.idChirho }
        // Word semantics: each written word of the group speaks the group's reading.
        for (tokenChirho in listOf("257vQ", "25JoL")) {
            val clipChirho = lamEntriesChirho.single { it.textChirho("token_id_chirho") == tokenChirho }
            assertEquals(tokenChirho, clipChirho.textChirho("text_chirho"), SpokenChirho.wordChirho(wordsChirho.getValue(tokenChirho), overridesChirho))
        }
        // Verse semantics: the group is read once, in its place; Be'eri's reading binds to exactly this text.
        val readingChirho = lamEntriesChirho.single { "reading_source_chirho" in it }
        assertEquals(readingChirho.textChirho("text_chirho"), SpokenChirho.verseChirho(lamChirho, overridesChirho))
        assertEquals("without the reviews the written word stands", "כי", SpokenChirho.wordChirho(wordsChirho.getValue("257vQ")))

        val jerChirho = worldChirho.loadedChirho("Jer.48.44").verseChirho
        val jerClipChirho = publishedAudioEntriesChirho("audio-chirho/jeremiah-chirho/chapter-48-chirho.json", "Jer.48.44")
            .single { it.textChirho("token_id_chirho") == "24PtS" }
        assertEquals(jerClipChirho.textChirho("text_chirho"), SpokenChirho.wordChirho(jerChirho.wordsChirho.single { it.idChirho == "24PtS" }, overridesChirho))

        val otherChirho = worldChirho.loadedChirho("Prov.26.1").verseChirho
        assertEquals("a verse without a review is untouched", SpokenChirho.verseChirho(otherChirho), SpokenChirho.verseChirho(otherChirho, overridesChirho))
    }

    @Test
    fun aChangedWordGroupOrVerseKeepsTheSourceWords() = runBlocking {
        val worldChirho = PublishedWorldChirho.orSkipChirho(Dispatchers.Unconfined)
        val lamChirho = worldChirho.loadedChirho("Lam.4.3").verseChirho as HebrewVerseChirho
        fun withWordChirho(idChirho: String, changeChirho: (HebrewWordChirho) -> HebrewWordChirho) =
            lamChirho.copy(tokensChirho = lamChirho.tokensChirho.map { if (it.idChirho == idChirho) changeChirho(it) else it })
        val changedChirho = mapOf(
            "another verse text" to lamChirho.copy(canonicalTextChirho = lamChirho.canonicalTextChirho.dropLast(1) + "."),
            "a changed lemma" to withWordChirho("25JoL") { it.copy(lemmaIdChirho = "H3284") },
            "a changed augment" to withWordChirho("257vQ") { it.copy(lemmaAugmentChirho = null) },
            "a changed morphology" to withWordChirho("25JoL") { it.copy(rawMorphologyChirho = "HNcmsa") },
            "a changed written word" to withWordChirho("257vQ") { it.copy(textChirho = "כִּי") },
            "a qere on a member" to withWordChirho("257vQ") { it.copy(qereChirho = listOf(QereChirho("q1Chirho", "כִּי"))) },
            "a missing member" to lamChirho.copy(tokensChirho = lamChirho.tokensChirho.filter { it.idChirho != "25JoL" }),
        )
        val reviewedChirho = SpokenChirho.verseChirho(lamChirho, overridesChirho)
        for ((nameChirho, verseChirho) in changedChirho) {
            val spokenChirho = SpokenChirho.verseChirho(verseChirho, overridesChirho)
            assertEquals(nameChirho, SpokenChirho.verseChirho(verseChirho), spokenChirho)
            assertNotEquals("$nameChirho: never the reviewed group reading", reviewedChirho, spokenChirho)
        }
        // A word clip still speaks its own reviewed word when only the other member changed, as on the website.
        // The expected text comes from the published clip: typed Hebrew can order its marks differently.
        val groupReadingChirho = publishedAudioEntriesChirho("audio-chirho/lamentations-chirho/chapter-04-chirho.json", "Lam.4.3")
            .single { it.textChirho("token_id_chirho") == "257vQ" }.textChirho("text_chirho")
        val otherChangedChirho = changedChirho.getValue("a changed lemma").wordsChirho.single { it.idChirho == "257vQ" }
        assertEquals(groupReadingChirho, SpokenChirho.wordChirho(otherChangedChirho, overridesChirho))
    }

    @Test
    fun anAssetThatFailsAnyCheckGivesNoReviews() {
        val textChirho = File(SPOKEN_OVERRIDES_CHIRHO).readText()
        val brokenChirho = mapOf(
            "another schema" to textChirho.replace("\"schema_version_chirho\": 1", "\"schema_version_chirho\": 2"),
            "truncated" to textChirho.dropLast(8),
            "a missing field" to textChirho.replaceFirst("\"spoken_reading_chirho\"", "\"spoken_chirho\""),
            "a repeated word" to textChirho.replace("\"token_id_chirho\": \"25JoL\"", "\"token_id_chirho\": \"257vQ\""),
            "a group without its verse" to textChirho.replaceFirst("\"canonical_text_chirho\": \"", "\"canonical_text_chirho\": null, \"unused_chirho\": \""),
        )
        for ((nameChirho, brokenTextChirho) in brokenChirho) {
            assertNotEquals("$nameChirho changes the asset", textChirho, brokenTextChirho)
            assertEquals(nameChirho, 0, SpokenOverridesChirho.decodeChirho(brokenTextChirho.encodeToByteArray()).sizeChirho)
        }
        assertEquals(3, SpokenOverridesChirho.decodeChirho(textChirho.encodeToByteArray()).sizeChirho)
    }
}
