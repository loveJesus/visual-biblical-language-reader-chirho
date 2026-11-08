// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
package us.hinneh.readerchirho.audiochirho

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.runBlocking
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonNull
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.put
import kotlinx.serialization.json.putJsonObject
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Assume.assumeTrue
import org.junit.Test
import us.hinneh.readerchirho.PublishedWorldChirho
import us.hinneh.readerchirho.audioEntriesChirho
import us.hinneh.readerchirho.contentchirho.LoadedVerseChirho
import us.hinneh.readerchirho.domainchirho.SpokenChirho
import us.hinneh.readerchirho.publishedRecordsChirho
import us.hinneh.readerchirho.remotechirho.sha256HexChirho
import us.hinneh.readerchirho.staticRootChirho
import java.io.File

/** Rabbi Dan Be'eri's verse readings (GPT, DM #3390), in their own readings_chirho list (DM #3410), beside the published AI clips for Proverbs 26:1. */
class HumanReadingTestChirho {
    private fun canonicalChirho(loadedChirho: LoadedVerseChirho) = sha256HexChirho(loadedChirho.verseChirho.canonicalTextChirho.encodeToByteArray())

    private fun selectChirho(loadedChirho: LoadedVerseChirho, rawChirho: List<JsonObject>, readingsChirho: List<JsonObject> = emptyList()) =
        AudioSelectionChirho.recordingsChirho(
            rawChirho, loadedChirho.verseChirho, loadedChirho.bookChirho.greekChirho, canonicalChirho(loadedChirho), AudioRepositoryChirho::decodeClipChirho,
            readingsChirho = readingsChirho,
        )

    /** A verse cut as the publisher writes it: source provenance, no recipe, IPA, synthesis text or word window. */
    private fun humanClipChirho(loadedChirho: LoadedVerseChirho): JsonObject = buildJsonObject {
        val shaChirho = "d".repeat(64)
        put("id_chirho", "human-prov-26-1-chirho")
        put("lesson_id_chirho", "Prov.26.1")
        put("token_id_chirho", JsonNull)
        put("text_chirho", SpokenChirho.verseChirho(loadedChirho.verseChirho))
        put("canonical_sha256_chirho", canonicalChirho(loadedChirho))
        put("language_chirho", "he")
        put("pronunciation_chirho", "israeli_hebrew")
        put("voice_name_chirho", HumanReadingChirho.BEERI_VOICE_CHIRHO)
        put("asset_path_chirho", "/audio-chirho/sha256-chirho/$shaChirho-chirho.mp3")
        put("sha256_chirho", shaChirho)
        put("bytes_chirho", 98_765)
        put("duration_chirho", 6.42)
        put("review_chirho", "audition")
        putJsonObject("reading_source_chirho") {
            put("kind_chirho", "human")
            put("reader_id_chirho", "rdb-chirho")
            put("gbt_id_chirho", "OT/RDB/Pro")
            put("package_sha256_chirho", "1".repeat(64))
            put("chapter_sha256_chirho", "2".repeat(64))
            put("timings_sha256_chirho", "3".repeat(64))
            put("start_chirho", 0.84)
            put("end_chirho", 7.3)
            put("chapter_duration_chirho", 212.5)
            put("attribution_chirho", HumanReadingChirho.BEERI_ATTRIBUTION_CHIRHO)
            put("license_chirho", HumanReadingChirho.BEERI_LICENSE_CHIRHO)
            put("license_url_chirho", HumanReadingChirho.BEERI_LICENSE_URL_CHIRHO)
        }
    }

    private fun JsonObject.withValueChirho(keyChirho: String, valueChirho: JsonElement) = JsonObject(this + (keyChirho to valueChirho))

    /** The published AI clips for the verse; real Be'eri clips, once installed, are tested on their own below. */
    private fun publishedAiChirho() = publishedRecordsChirho("audio-chirho/proverbs-chirho/chapter-26-chirho.json", "clips_chirho", "Prov.26.1")
        .filter { "reading_source_chirho" !in it }

    private fun JsonObject.withSourceChirho(keyChirho: String, valueChirho: JsonElement) =
        withValueChirho("reading_source_chirho", getValue("reading_source_chirho").jsonObject.withValueChirho(keyChirho, valueChirho))

    @Test
    fun aBeeriReadingPlaysBeforeEveryAiReadingAndLeavesWordClipsAlone() = runBlocking {
        val worldChirho = PublishedWorldChirho.orSkipChirho(Dispatchers.Unconfined)
        val loadedChirho = worldChirho.loadedChirho("Prov.26.1")
        val publishedChirho = publishedAiChirho()
        val withoutChirho = selectChirho(loadedChirho, publishedChirho)
        val recordingsChirho = selectChirho(loadedChirho, publishedChirho, readingsChirho = listOf(humanClipChirho(loadedChirho)))
        val bestChirho = requireNotNull(AudioSelectionChirho.bestChirho(recordingsChirho.versesChirho, false, GreekRenditionChirho.MODERN_ASPIRATES_CHIRHO))
        assertEquals(HumanReadingChirho.BEERI_VOICE_CHIRHO, bestChirho.voiceNameChirho)
        assertNotNull(bestChirho.readingSourceChirho)
        assertEquals(withoutChirho.versesChirho, recordingsChirho.versesChirho.drop(1))
        assertEquals(withoutChirho.wordsChirho, recordingsChirho.wordsChirho)
    }

    @Test
    fun aClaimedHumanSourceThatDoesNotMatchExactlyIsWithheldNotReread() = runBlocking {
        val worldChirho = PublishedWorldChirho.orSkipChirho(Dispatchers.Unconfined)
        val loadedChirho = worldChirho.loadedChirho("Prov.26.1")
        val publishedChirho = publishedAiChirho()
        val goodChirho = humanClipChirho(loadedChirho)
        val wordIdChirho = loadedChirho.verseChirho.wordsChirho.first().idChirho
        val mutationsChirho = mapOf<String, (JsonObject) -> JsonObject>(
            "another reader" to { it.withSourceChirho("reader_id_chirho", JsonPrimitive("other-chirho")) },
            "another book's source" to { it.withSourceChirho("gbt_id_chirho", JsonPrimitive("OT/RDB/Gen")) },
            "not human" to { it.withSourceChirho("kind_chirho", JsonPrimitive("ai")) },
            "a short hash" to { it.withSourceChirho("timings_sha256_chirho", JsonPrimitive("3".repeat(63))) },
            "an empty window" to { it.withSourceChirho("end_chirho", JsonPrimitive(0.84)) },
            "a window past the chapter" to { it.withSourceChirho("chapter_duration_chirho", JsonPrimitive(7.0)) },
            "a window over two minutes" to { it.withSourceChirho("start_chirho", JsonPrimitive(0.0)).withSourceChirho("end_chirho", JsonPrimitive(121.0)) },
            "a length unlike its window" to { it.withValueChirho("duration_chirho", JsonPrimitive(6.7)) },
            "other attribution" to { it.withSourceChirho("attribution_chirho", JsonPrimitive("Hebrew reading")) },
            "another license" to { it.withSourceChirho("license_url_chirho", JsonPrimitive("https://creativecommons.org/licenses/by-sa/4.0/")) },
            "another voice" to { it.withValueChirho("voice_name_chirho", JsonPrimitive("Itamar - Israeli Hebrew Narrator")) },
            "an AI recipe" to { it.withValueChirho("recipe_id_chirho", JsonPrimitive(AudioSelectionChirho.HEBREW_CONNECTED_RECIPE_CHIRHO)) },
            "IPA" to { it.withValueChirho("ipa_chirho", JsonPrimitive("ki")) },
            "a word window, even null" to { it.withValueChirho("start_offset_chirho", JsonNull) },
            "a word's slot" to { it.withValueChirho("token_id_chirho", JsonPrimitive(wordIdChirho)) },
            "a malformed source" to { it.withSourceChirho("start_chirho", JsonPrimitive("soon")) },
            "no source at all" to { JsonObject(it - "reading_source_chirho") },
        )
        assertEquals(1, selectChirho(loadedChirho, emptyList(), readingsChirho = listOf(goodChirho)).versesChirho.size)
        for ((nameChirho, mutationChirho) in mutationsChirho) {
            val recordingsChirho = selectChirho(loadedChirho, publishedChirho, readingsChirho = listOf(mutationChirho(goodChirho)))
            assertTrue(nameChirho, recordingsChirho.versesChirho.none { it.readingSourceChirho != null || it.voiceNameChirho == HumanReadingChirho.BEERI_VOICE_CHIRHO })
            assertEquals(nameChirho, selectChirho(loadedChirho, publishedChirho), recordingsChirho)
        }
        // An AI recording placed among the human readings is refused there; in clips_chirho it is unchanged.
        val aiVerseChirho = publishedChirho.first { it["token_id_chirho"] is JsonNull }
        assertEquals(selectChirho(loadedChirho, publishedChirho), selectChirho(loadedChirho, publishedChirho, readingsChirho = listOf(aiVerseChirho)))
    }

    /**
     * Every Be'eri reading in the static tree, in readings_chirho (or, before root's migration, clips_chirho), passes the
     * full path (manifest and chapter hashes, decoding, the human rules) and plays first; every other entry still binds.
     */
    @Test
    fun everyInstalledBeeriReadingIsAcceptedAndPlaysFirst() = runBlocking {
        val worldChirho = PublishedWorldChirho.orSkipChirho(Dispatchers.Unconfined)
        val chaptersChirho = File(requireNotNull(staticRootChirho()), "audio-chirho").walkTopDown()
            .filter { it.name.endsWith("-chirho.json") && it.readText().contains("\"reading_source_chirho\"") }
            .associate { it.relativeTo(requireNotNull(staticRootChirho())).path to Json.parseToJsonElement(it.readText()).jsonObject }
        val humanChirho = chaptersChirho.flatMap { (relativeChirho, chapterChirho) ->
            listOf("clips_chirho", "readings_chirho").flatMap { keyChirho -> chapterChirho[keyChirho]?.jsonArray?.map { it.jsonObject }.orEmpty() }
                .filter { "reading_source_chirho" in it }.map { relativeChirho to (it.getValue("lesson_id_chirho") as JsonPrimitive).content }
        }
        assumeTrue("no Be'eri readings installed in this static tree yet", humanChirho.isNotEmpty())
        for ((relativeChirho, lessonIdChirho) in humanChirho.distinct()) {
            val recordingsChirho = worldChirho.audioChirho.recordingsChirho(worldChirho.loadedChirho(lessonIdChirho))
            val firstChirho = recordingsChirho.versesChirho.firstOrNull()
            assertEquals("$relativeChirho $lessonIdChirho", HumanReadingChirho.BEERI_VOICE_CHIRHO, firstChirho?.voiceNameChirho)
            assertEquals(lessonIdChirho, audioEntriesChirho(chaptersChirho.getValue(relativeChirho), lessonIdChirho).size,
                recordingsChirho.versesChirho.size + recordingsChirho.wordsChirho.values.sumOf { it.size })
        }
        val inReadingsChirho = chaptersChirho.values.sumOf { chapterChirho -> chapterChirho["readings_chirho"]?.jsonArray?.size ?: 0 }
        println("Be'eri readings accepted and first: ${humanChirho.size} in ${chaptersChirho.size} chapters ($inReadingsChirho in readings_chirho)")
    }
}
