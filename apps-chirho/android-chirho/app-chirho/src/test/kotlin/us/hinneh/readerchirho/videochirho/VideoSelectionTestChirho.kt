// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
package us.hinneh.readerchirho.videochirho

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.runBlocking
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.encodeToJsonElement
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test
import us.hinneh.readerchirho.FixedStagedVideosChirho
import us.hinneh.readerchirho.PublishedWorldChirho
import us.hinneh.readerchirho.audiochirho.ClipChirho
import us.hinneh.readerchirho.audiochirho.HumanReadingChirho
import us.hinneh.readerchirho.bundledCatalogueChirho
import us.hinneh.readerchirho.proverbsVerseIdentityChirho
import us.hinneh.readerchirho.remotechirho.ResourceKindChirho
import us.hinneh.readerchirho.remotechirho.TrustedOriginChirho
import us.hinneh.readerchirho.remotechirho.sha256HexChirho
import us.hinneh.readerchirho.sampleReadingSourceChirho
import us.hinneh.readerchirho.sampleVideoChirho
import us.hinneh.readerchirho.staticRootChirho
import java.io.File

/** Which verse video may play, per GPT's verse-video-chirho.ts (DM #3399): this verse's text and scene, a Be'eri or silent reading. */
class VideoSelectionTestChirho {
    private fun jsonChirho(recordChirho: VideoRecordChirho): JsonObject = Json.encodeToJsonElement(recordChirho).jsonObject
    private val identityChirho by lazy { proverbsVerseIdentityChirho("Prov.1.1") }

    private fun validChirho(recordChirho: VideoRecordChirho) =
        VideoSelectionChirho.validChirho(recordChirho, "Prov.1.1", identityChirho.first, identityChirho.second)

    /** A world whose Proverbs 1 media chapter publishes these video rows, with the summary entry that binds its hash. */
    private fun publishedWorldChirho(videosChirho: List<JsonObject>, stagedChirho: StagedVideosChirho? = null): PublishedWorldChirho {
        val rootChirho = requireNotNull(staticRootChirho())
        val chapterPathChirho = "/media-chirho/proverbs-chirho/chapter-01-chirho.json"
        val chapterChirho = Json.parseToJsonElement(File(rootChirho, chapterPathChirho).readText()).jsonObject
        val chapterBytesChirho = Json.encodeToString(JsonObject.serializer(),
            JsonObject(chapterChirho + ("videos_chirho" to JsonArray(videosChirho)))).encodeToByteArray()
        val summaryPathChirho = "/media-chirho/proverbs-chirho/summary-chirho.json"
        val summaryChirho = Json.parseToJsonElement(File(rootChirho, summaryPathChirho).readText()).jsonObject
        val entriesChirho = summaryChirho.getValue("chapters_chirho").jsonArray.map { entryChirho ->
            val objectChirho = entryChirho.jsonObject
            if (objectChirho["path_chirho"] == JsonPrimitive(chapterPathChirho)) {
                JsonObject(objectChirho + ("sha256_chirho" to JsonPrimitive(sha256HexChirho(chapterBytesChirho))))
            } else {
                objectChirho
            }
        }
        return PublishedWorldChirho(rootChirho, Dispatchers.Unconfined, stagedChirho).also { worldChirho ->
            worldChirho.transportChirho.putChirho(chapterPathChirho, chapterBytesChirho)
            worldChirho.transportChirho.putChirho(summaryPathChirho, Json.encodeToString(JsonObject.serializer(),
                JsonObject(summaryChirho + ("chapters_chirho" to JsonArray(entriesChirho)))))
        }
    }

    @Test
    fun aBeeriVideoAndASilentVideoValidateForTheirOwnVerse() {
        val goodChirho = sampleVideoChirho()
        assertTrue(validChirho(goodChirho))
        assertTrue(TrustedOriginChirho.isTrustedPathChirho(goodChirho.assetPathChirho, ResourceKindChirho.VERSE_VIDEO_CHIRHO))
        val silentChirho = goodChirho.copy(
            embeddedReadingChirho = null, readingLanguageChirho = null, attributionChirho = "Scene animation",
            licenseChirho = VideoSelectionChirho.CC0_CHIRHO, licenseUrlChirho = VideoSelectionChirho.CC0_URL_CHIRHO,
        )
        assertTrue(validChirho(silentChirho))
        val oneChirho = jsonChirho(goodChirho)
        assertEquals(goodChirho, VideoSelectionChirho.verseRecordChirho(listOf(oneChirho), "Prov.1.1"))
        assertNull("no list means no video", VideoSelectionChirho.verseRecordChirho(null, "Prov.1.1"))
        assertNull("two records for one verse", VideoSelectionChirho.verseRecordChirho(listOf(oneChirho, oneChirho), "Prov.1.1"))
        assertNull("a silent video says so explicitly", VideoSelectionChirho.verseRecordChirho(listOf(JsonObject(oneChirho - "embedded_reading_chirho")), "Prov.1.1"))
        assertNull("another verse's record", VideoSelectionChirho.verseRecordChirho(listOf(oneChirho), "Prov.1.2"))
    }

    @Test
    fun aVideoForAnotherTextSceneFileOrReadingNeverPlays() {
        val goodChirho = sampleVideoChirho()
        val sourceChirho = sampleReadingSourceChirho()
        val badChirho = mapOf(
            "another text" to goodChirho.copy(canonicalSha256Chirho = "0".repeat(64)),
            "an older scene" to goodChirho.copy(sceneSha256Chirho = "f".repeat(64)),
            "another file's path" to goodChirho.copy(assetPathChirho = "/video-chirho/sha256-chirho/${"d".repeat(64)}-chirho.mp4"),
            "too large" to goodChirho.copy(bytesChirho = VideoSelectionChirho.MAX_BYTES_CHIRHO + 1),
            "no length" to goodChirho.copy(durationChirho = 0.0),
            "no width" to goodChirho.copy(widthChirho = 0),
            "an audition" to goodChirho.copy(reviewChirho = "audition"),
            "a blank credit" to goodChirho.copy(attributionChirho = " "),
            "an insecure license link" to goodChirho.copy(licenseUrlChirho = "http://creativecommons.org/licenses/by-sa/3.0/"),
            "a sound longer than its video" to goodChirho.copy(embeddedReadingChirho = sourceChirho.copy(endChirho = 4.5)),
            "another book's reading" to goodChirho.copy(embeddedReadingChirho = sourceChirho.copy(gbtIdChirho = "OT/RDB/Gen")),
            "an English label on Be'eri" to goodChirho.copy(readingLanguageChirho = "en"),
            "a silent video with a language" to goodChirho.copy(embeddedReadingChirho = null, licenseChirho = "CC0",
                licenseUrlChirho = VideoSelectionChirho.CC0_URL_CHIRHO),
            "a silent video under CC BY-SA" to goodChirho.copy(embeddedReadingChirho = null, readingLanguageChirho = null),
        )
        for ((nameChirho, recordChirho) in badChirho) assertFalse(nameChirho, validChirho(recordChirho))
    }

    @Test
    fun aPublishedVideoWinsAndAStagedOneMustMatchTheVerseToo() = runBlocking {
        val stagedChirho = sampleVideoChirho(sha256Chirho = "e".repeat(64))
        val worldChirho = PublishedWorldChirho.orSkipChirho(Dispatchers.Unconfined, FixedStagedVideosChirho(stagedChirho))
        val catalogueChirho = bundledCatalogueChirho()
        val loadedChirho = worldChirho.loadedChirho("Prov.1.1")
        val onlyStagedChirho = worldChirho.mediaChirho.verseMediaChirho(loadedChirho, catalogueChirho)
        assertEquals(stagedChirho, onlyStagedChirho.videoChirho)
        assertTrue(onlyStagedChirho.videoStagedChirho)

        val oldSceneChirho = PublishedWorldChirho(requireNotNull(staticRootChirho()), Dispatchers.Unconfined,
            FixedStagedVideosChirho(stagedChirho.copy(sceneSha256Chirho = "f".repeat(64))))
        val refusedChirho = oldSceneChirho.mediaChirho.verseMediaChirho(oldSceneChirho.loadedChirho("Prov.1.1"), catalogueChirho)
        assertNull("a staged video of an older scene", refusedChirho.videoChirho)
        assertTrue("the scene still shows", refusedChirho.sceneChirho != null)

        // A fresh world, because the first one has already cached this book's summary.
        val publishedChirho = sampleVideoChirho()
        val publishedWorldChirho = publishedWorldChirho(listOf(jsonChirho(publishedChirho)), FixedStagedVideosChirho(stagedChirho))
        val bothChirho = publishedWorldChirho.mediaChirho.verseMediaChirho(loadedChirho, catalogueChirho)
        assertEquals(publishedChirho, bothChirho.videoChirho)
        assertFalse("a published video is never labelled staged", bothChirho.videoStagedChirho)
        assertTrue("the scene still loads beside it", bothChirho.sceneChirho != null)
    }

    /**
     * GPT, DM #3498: an absent reading key is not an explicit null, so a record missing either key is no silent
     * video; and two published rows for one verse withhold its video while its scene and pictures still load.
     */
    @Test
    fun aSilentVideoNamesBothNullsAndDuplicateRowsWithholdOnlyTheVideo() = runBlocking {
        val silentChirho = sampleVideoChirho().copy(
            embeddedReadingChirho = null, readingLanguageChirho = null, attributionChirho = "Scene animation",
            licenseChirho = VideoSelectionChirho.CC0_CHIRHO, licenseUrlChirho = VideoSelectionChirho.CC0_URL_CHIRHO,
        )
        val explicitChirho = jsonChirho(silentChirho)
        assertTrue(explicitChirho.containsKey("reading_language_chirho") && explicitChirho.containsKey("embedded_reading_chirho"))
        assertEquals(silentChirho, VideoSelectionChirho.verseRecordChirho(listOf(explicitChirho), "Prov.1.1"))
        for (keyChirho in listOf("reading_language_chirho", "embedded_reading_chirho")) {
            assertNull("an absent $keyChirho", VideoSelectionChirho.verseRecordChirho(listOf(JsonObject(explicitChirho - keyChirho)), "Prov.1.1"))
        }

        val duplicatedChirho = publishedWorldChirho(listOf(jsonChirho(sampleVideoChirho()), jsonChirho(sampleVideoChirho(sha256Chirho = "e".repeat(64)))))
        val mediaChirho = duplicatedChirho.mediaChirho.verseMediaChirho(duplicatedChirho.loadedChirho("Prov.1.1"), bundledCatalogueChirho())
        assertNull("two rows for one verse", mediaChirho.videoChirho)
        assertTrue("the still stays", mediaChirho.sceneChirho != null)
        assertTrue("the word pictures stay", mediaChirho.picturesChirho.isNotEmpty())
    }

    @Test
    fun theVideosOwnSoundStandsForAReadingOnlyWhenItIsThatExactSource() {
        val videoChirho = sampleVideoChirho()
        val clipChirho = ClipChirho(
            lessonIdChirho = "Prov.1.1", tokenIdChirho = null, textChirho = "verse", canonicalSha256Chirho = videoChirho.canonicalSha256Chirho,
            languageChirho = "he", pronunciationChirho = "israeli_hebrew", voiceNameChirho = HumanReadingChirho.BEERI_VOICE_CHIRHO,
            assetPathChirho = "/audio-chirho/sha256-chirho/${"9".repeat(64)}-chirho.mp3", sha256Chirho = "9".repeat(64), bytesChirho = 40_000,
            durationChirho = 4.95, reviewChirho = "audition", readingSourceChirho = sampleReadingSourceChirho().copy(endChirho = 5.2),
        )
        assertTrue("window ends within 0.3 s", VideoSelectionChirho.sameEmbeddedReadingChirho(videoChirho, clipChirho))
        val sourceChirho = requireNotNull(clipChirho.readingSourceChirho)
        val otherChirho = listOf(
            clipChirho.copy(readingSourceChirho = sourceChirho.copy(timingsSha256Chirho = "4".repeat(64))),
            clipChirho.copy(readingSourceChirho = sourceChirho.copy(endChirho = 5.3)),
            clipChirho.copy(canonicalSha256Chirho = "0".repeat(64)),
            clipChirho.copy(readingSourceChirho = null),
        )
        for (oneChirho in otherChirho) assertFalse(oneChirho.toString(), VideoSelectionChirho.sameEmbeddedReadingChirho(videoChirho, oneChirho))
        assertFalse("a silent video has no sound to share", VideoSelectionChirho.sameEmbeddedReadingChirho(videoChirho.copy(embeddedReadingChirho = null), clipChirho))
    }
}
