// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
package us.hinneh.readerchirho.uichirho

import kotlinx.coroutines.runBlocking
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import org.junit.Assert.assertEquals
import org.junit.Assume.assumeTrue
import org.junit.Test
import us.hinneh.readerchirho.FileTransportChirho
import us.hinneh.readerchirho.bundledCatalogueChirho
import us.hinneh.readerchirho.contentchirho.ContentRepositoryChirho
import us.hinneh.readerchirho.domainchirho.PassageChirho
import us.hinneh.readerchirho.remotechirho.RemoteClientChirho
import us.hinneh.readerchirho.staticRootChirho
import java.io.File

/**
 * The welcome's reader example (unit 176) shows real words, never made-up ones (GPT, DM #3677 and #3679): each sample
 * is its published token field for field, its English meaning is that token's gloss, its Spanish meaning is the
 * approved Global Bible Tools Spanish gloss bound to the same chapter text, and its reference uses the bundled
 * catalogue's book names.
 */
class WelcomeSampleTestChirho {
    @Test
    fun theWelcomeExampleWordsAreThePublishedOnes() = runBlocking {
        val rootChirho = staticRootChirho()
        assumeTrue("repository static tree unavailable", rootChirho != null && File(rootChirho, "content-chirho").isDirectory)
        val repositoryChirho = ContentRepositoryChirho(RemoteClientChirho(FileTransportChirho(rootChirho!!), null), { ByteArray(0) })
        val catalogueChirho = bundledCatalogueChirho()
        val passagesChirho = listOf("Gen.1.1", "John.1.1")
        assertEquals(passagesChirho.size, WELCOME_SAMPLES_CHIRHO.size)
        for ((passageIdChirho, sampleChirho) in passagesChirho.zip(WELCOME_SAMPLES_CHIRHO)) {
            val passageChirho = requireNotNull(PassageChirho.parseChirho(passageIdChirho))
            val bookChirho = requireNotNull(catalogueChirho.bookChirho(passageChirho.bookIdChirho))
            val loadedChirho = repositoryChirho.verseChirho(bookChirho, passageChirho)
            val publishedChirho = loadedChirho.verseChirho.wordsChirho.single { it.idChirho == sampleChirho.wordChirho.idChirho }
            assertEquals("the sample is the published token, field for field", publishedChirho, sampleChirho.wordChirho)
            assertEquals(publishedChirho.glossChirho, sampleChirho.glossChirho(spanishChirho = false))

            val layerChirho = Json.parseToJsonElement(
                File(rootChirho, "glosses-chirho/es-chirho/${bookChirho.slugChirho}/chapter-%02d-chirho.json".format(passageChirho.chapterChirho)).readText(),
            ).jsonObject
            assertEquals("the Spanish layer is bound to this chapter's exact text", loadedChirho.entryChirho.sha256Chirho, layerChirho["content_sha256_chirho"]!!.jsonPrimitive.content)
            assertEquals("gbt_approved", layerChirho["gloss_state_chirho"]!!.jsonPrimitive.content)
            assertEquals(
                layerChirho["glosses_chirho"]!!.jsonObject[sampleChirho.wordChirho.idChirho]!!.jsonPrimitive.content,
                sampleChirho.glossChirho(spanishChirho = true),
            )

            val placeChirho = "${passageChirho.chapterChirho}:${passageChirho.verseChirho}"
            assertEquals("${bookChirho.labelChirho} $placeChirho", sampleChirho.referenceChirho(spanishChirho = false))
            assertEquals("${bookChirho.spanishLabelChirho} $placeChirho", sampleChirho.referenceChirho(spanishChirho = true))
        }
    }
}
