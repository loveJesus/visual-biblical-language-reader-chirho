// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
package us.hinneh.readerchirho.audiochirho

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.runBlocking
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonNull
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import org.junit.Assert.assertEquals
import org.junit.Assume.assumeTrue
import org.junit.Test
import us.hinneh.readerchirho.PublishedWorldChirho
import us.hinneh.readerchirho.staticRootChirho
import java.io.File

/**
 * Opt-in (-Phinneh.fullCorpusChirho=true): every published clip and reading of every verse, one audio chapter at a time,
 * through Android's full path (audio manifest, chapter hash, decode, selection). Each one must bind; a refusal is named
 * with its verse, token, recipe and text, so a gap is measured, never hidden by loosening a rule.
 */
class PublishedClipsCorpusTestChirho {
    // A JSON null (a verse-level token id) is no text; JsonNull's content would read "null".
    private fun JsonObject.textChirho(keyChirho: String) = (this[keyChirho] as? JsonPrimitive)?.takeUnless { it is JsonNull }?.content

    @Test
    fun everyPublishedClipAndReadingBindsThroughTheFullPath() = runBlocking {
        assumeTrue("full corpus: run with -Phinneh.fullCorpusChirho=true", System.getProperty("hinneh.fullCorpusChirho") == "true")
        val worldChirho = PublishedWorldChirho.orSkipChirho(Dispatchers.Unconfined)
        val rootChirho = requireNotNull(staticRootChirho())
        val manifestChirho = Json.parseToJsonElement(File(rootChirho, "audio-chirho/manifest-chirho.json").readText()).jsonObject
        val refusedChirho = mutableListOf<String>()
        var chaptersChirho = 0
        var versesChirho = 0
        var entriesChirho = 0
        var boundChirho = 0
        for ((_, bookChirho) in manifestChirho.getValue("books_chirho").jsonObject) {
            for (entryChirho in bookChirho.jsonObject.getValue("chapters_chirho").jsonArray.map { it.jsonObject }) {
                chaptersChirho++
                val chapterChirho = Json.parseToJsonElement(File(rootChirho, entryChirho.textChirho("path_chirho")!!.removePrefix("/")).readText()).jsonObject
                val byLessonChirho = listOf("clips_chirho", "readings_chirho")
                    .flatMap { keyChirho -> chapterChirho[keyChirho]?.jsonArray?.map { it.jsonObject }.orEmpty() }
                    .groupBy { it.textChirho("lesson_id_chirho")!! }
                for ((lessonChirho, ownChirho) in byLessonChirho.entries.sortedBy { it.key.substringAfterLast('.').toIntOrNull() ?: 0 }) {
                    versesChirho++
                    entriesChirho += ownChirho.size
                    val recordingsChirho = worldChirho.audioChirho.recordingsChirho(worldChirho.loadedChirho(lessonChirho))
                    val selectedChirho = (recordingsChirho.versesChirho + recordingsChirho.wordsChirho.values.flatten())
                        .map { it.tokenIdChirho to it.sha256Chirho }.toSet()
                    boundChirho += selectedChirho.size
                    for (clipChirho in ownChirho) {
                        if ((clipChirho.textChirho("token_id_chirho") to clipChirho.textChirho("sha256_chirho")) in selectedChirho) continue
                        val kindChirho = if ("reading_source_chirho" in clipChirho) "human" else clipChirho.textChirho("recipe_id_chirho") ?: "legacy"
                        refusedChirho += "$lessonChirho\t${clipChirho.textChirho("token_id_chirho") ?: "verse"}\t$kindChirho\t${clipChirho.textChirho("text_chirho")}"
                    }
                }
            }
        }
        println("SUMMARY_CHIRHO\tchapters=$chaptersChirho\tverses=$versesChirho\tentries=$entriesChirho\tbound=$boundChirho\trefused=${refusedChirho.size}")
        refusedChirho.forEach { println("REFUSED_CHIRHO\t$it") }
        assertEquals(emptyList<String>(), refusedChirho)
    }
}
