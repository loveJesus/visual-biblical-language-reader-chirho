// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
package us.hinneh.readerchirho.videochirho

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.runBlocking
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Assume.assumeTrue
import org.junit.Test
import us.hinneh.readerchirho.BUNDLED_BOOKS_CHIRHO
import us.hinneh.readerchirho.audiochirho.AudioRepositoryChirho
import us.hinneh.readerchirho.audiochirho.AudioSelectionChirho
import us.hinneh.readerchirho.audiochirho.HumanReadingChirho
import us.hinneh.readerchirho.contentchirho.ContentRepositoryChirho
import us.hinneh.readerchirho.domainchirho.PassageChirho
import us.hinneh.readerchirho.mediachirho.MediaRepositoryChirho
import us.hinneh.readerchirho.remotechirho.HttpTransportChirho
import us.hinneh.readerchirho.remotechirho.RemoteClientChirho
import us.hinneh.readerchirho.remotechirho.ResourceKindChirho
import us.hinneh.readerchirho.statechirho.OptionalChirho
import us.hinneh.readerchirho.statechirho.ReaderUiStateChirho
import us.hinneh.readerchirho.staticRootChirho
import java.io.File

/**
 * The live site, read by the app's own network path (opt in: -Phinneh.liveChirho=true). Android shows a video for exactly
 * the verses root published (data-chirho/video-chirho/catalogue-chirho.json), each in place of the scene now shown, and
 * with bytes that verify (GPT, DM #3431). A Be'eri video's sound is the human reading the verse plays first; a synthesized
 * Greek video's sound (unit 194) is exactly the recording its verse's automatic reading chooses, whose MP3 verifies too.
 */
class LivePublishedVideosTestChirho {
    @Test
    fun everyPublishedVerseVideoMatchesItsSceneAndTheReadingItsVersePlays() = runBlocking {
        assumeTrue("live check: run with -Phinneh.liveChirho=true", System.getProperty("hinneh.liveChirho") == "true")
        val catalogueFileChirho = File(requireNotNull(staticRootChirho()).parentFile, "data-chirho/video-chirho/catalogue-chirho.json")
        val publishedChirho = Json.parseToJsonElement(catalogueFileChirho.readText()).jsonObject.getValue("entries_chirho").jsonArray
            .map { ((it.jsonObject.getValue("video_chirho").jsonObject["lesson_id_chirho"]) as JsonPrimitive).content }.toSet()
        val remoteChirho = RemoteClientChirho(HttpTransportChirho(), null, Dispatchers.IO)
        val contentChirho = ContentRepositoryChirho(remoteChirho, { File(BUNDLED_BOOKS_CHIRHO).readBytes() }, Dispatchers.IO)
        val mediaChirho = MediaRepositoryChirho(remoteChirho, workDispatcherChirho = Dispatchers.IO)
        val audioChirho = AudioRepositoryChirho(remoteChirho, workDispatcherChirho = Dispatchers.IO)
        val catalogueChirho = contentChirho.catalogueChirho()
        val shownChirho = mutableSetOf<String>()
        val candidatesChirho = (publishedChirho + (1..31).map { "Prov.$it.1" }).sorted()
        for (verseIdChirho in candidatesChirho) {
            val passageChirho = requireNotNull(PassageChirho.parseChirho(verseIdChirho))
            val loadedChirho = contentChirho.verseChirho(requireNotNull(catalogueChirho.bookChirho(passageChirho.bookIdChirho)), passageChirho)
            val verseMediaChirho = mediaChirho.verseMediaChirho(loadedChirho, catalogueChirho)
            val videoChirho = verseMediaChirho.videoChirho ?: continue
            shownChirho += verseIdChirho
            assertFalse(verseIdChirho, verseMediaChirho.videoStagedChirho)
            assertEquals(verseIdChirho, verseMediaChirho.sceneChirho?.standardChirho?.sha256Chirho, videoChirho.sceneSha256Chirho)
            val recordingsChirho = audioChirho.recordingsChirho(loadedChirho)
            if (videoChirho.embeddedClipChirho == null) {
                val firstChirho = recordingsChirho.versesChirho.first()
                assertEquals(verseIdChirho, HumanReadingChirho.BEERI_VOICE_CHIRHO, firstChirho.voiceNameChirho)
                assertTrue("$verseIdChirho: the video's sound is the reading played first", VideoSelectionChirho.sameEmbeddedReadingChirho(videoChirho, firstChirho))
            } else {
                val greekChirho = requireNotNull(catalogueChirho.bookChirho(passageChirho.bookIdChirho)).greekChirho
                val automaticChirho = ReaderUiStateChirho.automaticRenditionChirho(OptionalChirho.ReadyChirho(recordingsChirho))
                val chosenChirho = requireNotNull(AudioSelectionChirho.bestChirho(recordingsChirho.versesChirho, greekChirho, automaticChirho)) { verseIdChirho }
                assertTrue(
                    "$verseIdChirho: the video's sound is the recording its automatic reading chooses",
                    VideoSelectionChirho.sameEmbeddedReadingChirho(videoChirho, chosenChirho),
                )
                val clipChirho = remoteChirho.fetchVerifiedChirho(
                    chosenChirho.assetPathChirho, ResourceKindChirho.AUDIO_CLIP_CHIRHO, chosenChirho.sha256Chirho, chosenChirho.bytesChirho.toInt(),
                )
                assertEquals(verseIdChirho, chosenChirho.bytesChirho.toInt(), clipChirho.size)
            }
            val bytesChirho = remoteChirho.fetchVerifiedChirho(
                videoChirho.assetPathChirho, ResourceKindChirho.VERSE_VIDEO_CHIRHO, videoChirho.sha256Chirho, videoChirho.bytesChirho.toInt(),
            )
            assertEquals(verseIdChirho, videoChirho.bytesChirho.toInt(), bytesChirho.size)
        }
        assertEquals("Android shows exactly the published videos", publishedChirho, shownChirho)
        println("Live published videos shown and verified on Android's path: ${shownChirho.size} (${shownChirho.sorted().joinToString()})")
    }
}
