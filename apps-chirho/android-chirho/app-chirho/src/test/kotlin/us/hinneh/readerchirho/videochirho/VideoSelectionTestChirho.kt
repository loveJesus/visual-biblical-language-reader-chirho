// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
package us.hinneh.readerchirho.videochirho

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.runBlocking
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonNull
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
import us.hinneh.readerchirho.audiochirho.AudioRepositoryChirho
import us.hinneh.readerchirho.audiochirho.AudioSelectionChirho
import us.hinneh.readerchirho.audiochirho.ClipChirho
import us.hinneh.readerchirho.audiochirho.HumanReadingChirho
import us.hinneh.readerchirho.bundledCatalogueChirho
import us.hinneh.readerchirho.proverbsVerseIdentityChirho
import us.hinneh.readerchirho.publishedVerseClipChirho
import us.hinneh.readerchirho.sampleGreekVideoChirho
import us.hinneh.readerchirho.verseIdentityChirho
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

    /** A world whose chapter-1 media file of one book publishes these video rows, with the summary entry that binds its hash. */
    private fun publishedWorldChirho(
        videosChirho: List<JsonObject>,
        stagedChirho: StagedVideosChirho? = null,
        folderChirho: String = "proverbs-chirho",
    ): PublishedWorldChirho {
        val rootChirho = requireNotNull(staticRootChirho())
        val chapterPathChirho = "/media-chirho/$folderChirho/chapter-01-chirho.json"
        val chapterChirho = Json.parseToJsonElement(File(rootChirho, chapterPathChirho).readText()).jsonObject
        val chapterBytesChirho = Json.encodeToString(JsonObject.serializer(),
            JsonObject(chapterChirho + ("videos_chirho" to JsonArray(videosChirho)))).encodeToByteArray()
        val summaryPathChirho = "/media-chirho/$folderChirho/summary-chirho.json"
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

    // Unit 194 (frozen contract 8c33593f, candidate verse-video-chirho.ts af63b845): a Greek video whose sound is one
    // exact published verse recording, here John 1:1's Modern with Aspirates reading.
    private val johnRowChirho by lazy { publishedVerseClipChirho("john-chirho", "John.1.1", "modern_greek_aspirates") }
    private val johnIdentityChirho by lazy { verseIdentityChirho("john-chirho", "John.1.1") }
    private fun johnVideoChirho() = sampleGreekVideoChirho("john-chirho", "John.1.1", johnRowChirho)
    private fun validJohnChirho(recordChirho: VideoRecordChirho) =
        VideoSelectionChirho.validChirho(recordChirho, "John.1.1", johnIdentityChirho.first, johnIdentityChirho.second)

    @Test
    fun aGreekVideoNamingItsExactClipValidatesAndOldRecordsDecodeAsBefore() = runBlocking {
        val greekChirho = johnVideoChirho()
        assertTrue(validJohnChirho(greekChirho))
        val jsonGreekChirho = jsonChirho(greekChirho)
        assertEquals("the old human key stays, explicitly null", JsonNull, jsonGreekChirho["embedded_reading_chirho"])
        assertEquals(JsonPrimitive("el"), jsonGreekChirho["reading_language_chirho"])
        assertEquals(greekChirho, VideoSelectionChirho.verseRecordChirho(listOf(jsonGreekChirho), "John.1.1"))

        val humanChirho = jsonChirho(sampleVideoChirho())
        assertFalse("a Be'eri record carries no descriptor key", humanChirho.containsKey("embedded_clip_chirho"))
        for (shapeChirho in listOf(humanChirho, JsonObject(humanChirho + ("embedded_clip_chirho" to JsonNull)))) {
            assertEquals("absent and explicit null decode alike", sampleVideoChirho(), VideoSelectionChirho.verseRecordChirho(listOf(shapeChirho), "Prov.1.1"))
        }
        assertTrue(validChirho(sampleVideoChirho()))

        val worldChirho = publishedWorldChirho(listOf(jsonGreekChirho), folderChirho = "john-chirho")
        val mediaChirho = worldChirho.mediaChirho.verseMediaChirho(worldChirho.loadedChirho("John.1.1"), bundledCatalogueChirho())
        assertEquals("the app's own path selects it in the scene's place", greekChirho, mediaChirho.videoChirho)
    }

    @Test
    fun eachMalformedOrMixedGreekVideoIsWithheldAndOnlyTheVideo() = runBlocking {
        val greekChirho = johnVideoChirho()
        val clipChirho = requireNotNull(greekChirho.embeddedClipChirho)
        fun withChirho(changedChirho: EmbeddedClipChirho) = greekChirho.copy(embeddedClipChirho = changedChirho)
        val refusedChirho = mapOf(
            "a Be'eri source beside the clip" to greekChirho.copy(embeddedReadingChirho = sampleReadingSourceChirho()),
            "no reading language" to greekChirho.copy(readingLanguageChirho = null),
            "a Hebrew reading language" to greekChirho.copy(readingLanguageChirho = "he"),
            "a CC0 label" to greekChirho.copy(licenseChirho = VideoSelectionChirho.CC0_CHIRHO, licenseUrlChirho = VideoSelectionChirho.CC0_URL_CHIRHO),
            "Be'eri's license" to greekChirho.copy(
                licenseChirho = HumanReadingChirho.BEERI_LICENSE_CHIRHO, licenseUrlChirho = HumanReadingChirho.BEERI_LICENSE_URL_CHIRHO,
            ),
            "another license address" to greekChirho.copy(licenseUrlChirho = "https://creativecommons.org/licenses/by/4.0"),
            "a malformed clip hash" to withChirho(clipChirho.copy(sha256Chirho = "E".repeat(64))),
            "rejected clip bytes" to withChirho(clipChirho.copy(sha256Chirho = AudioSelectionChirho.REJECTED_CHIRHO.first())),
            "an empty clip" to withChirho(clipChirho.copy(bytesChirho = 0)),
            "a clip larger than a verse recording may be" to withChirho(clipChirho.copy(bytesChirho = VideoSelectionChirho.MAX_CLIP_BYTES_CHIRHO + 1)),
            "a clip of no length" to withChirho(clipChirho.copy(durationChirho = 0.0)).copy(durationChirho = 0.2),
            "a clip over two minutes" to withChirho(clipChirho.copy(durationChirho = 120.2)).copy(durationChirho = 120.0),
            "an endless clip" to withChirho(clipChirho.copy(durationChirho = Double.POSITIVE_INFINITY)),
            "a recipe that is no id" to withChirho(clipChirho.copy(recipeIdChirho = "Modern Greek")),
            "a recipe without its suffix" to withChirho(clipChirho.copy(recipeIdChirho = "modern-greek-phrasing-v1")),
            "a recipe over 128 characters" to withChirho(clipChirho.copy(recipeIdChirho = "a".repeat(122) + "-chirho")),
            "a Hebrew pronunciation" to withChirho(clipChirho.copy(pronunciationChirho = "israeli_hebrew")),
            "a soundtrack 0.31 s off" to greekChirho.copy(durationChirho = clipChirho.durationChirho + 0.31),
        )
        for ((reasonChirho, recordChirho) in refusedChirho) assertFalse(reasonChirho, validJohnChirho(recordChirho))
        assertTrue("128 characters is the limit", validJohnChirho(withChirho(clipChirho.copy(recipeIdChirho = "a".repeat(121) + "-chirho"))))
        assertTrue("within 0.3 s the soundtrack still fits", validJohnChirho(greekChirho.copy(durationChirho = clipChirho.durationChirho + 0.25)))

        val jsonGreekChirho = jsonChirho(greekChirho)
        val descriptorChirho = jsonGreekChirho.getValue("embedded_clip_chirho").jsonObject
        assertEquals(5, descriptorChirho.size)
        for (keyChirho in descriptorChirho.keys) {
            val missingChirho = JsonObject(jsonGreekChirho + ("embedded_clip_chirho" to JsonObject(descriptorChirho - keyChirho)))
            assertNull("a descriptor without $keyChirho", VideoSelectionChirho.verseRecordChirho(listOf(missingChirho), "John.1.1"))
        }
        val worldChirho = publishedWorldChirho(
            listOf(JsonObject(jsonGreekChirho + ("embedded_clip_chirho" to JsonObject(descriptorChirho - "recipe_id_chirho")))),
            folderChirho = "john-chirho",
        )
        val mediaChirho = worldChirho.mediaChirho.verseMediaChirho(worldChirho.loadedChirho("John.1.1"), bundledCatalogueChirho())
        assertNull(mediaChirho.videoChirho)
        assertTrue("the still stays", mediaChirho.sceneChirho != null)
        assertTrue("the word pictures stay", mediaChirho.picturesChirho.isNotEmpty())
    }

    /** Callers choose the recording first; the video's sound stands for it only when it is that exact whole-verse clip. */
    @Test
    fun aGreekVideosSoundIsOnlyItsExactWholeVerseClip() {
        val greekChirho = johnVideoChirho()
        val clipChirho = requireNotNull(AudioRepositoryChirho.decodeClipChirho(johnRowChirho))
        assertTrue("the published row itself", VideoSelectionChirho.sameEmbeddedReadingChirho(greekChirho, clipChirho))
        val otherPathChirho = "/audio-chirho/sha256-chirho/${"f".repeat(64)}-chirho.mp3"
        val otherChirho = mapOf(
            "other bytes" to clipChirho.copy(sha256Chirho = "f".repeat(64), assetPathChirho = otherPathChirho),
            "another size" to clipChirho.copy(bytesChirho = clipChirho.bytesChirho + 1),
            "another length" to clipChirho.copy(durationChirho = clipChirho.durationChirho + 0.001),
            "another recipe" to clipChirho.copy(recipeIdChirho = "modern-greek-phrasing-v1-chirho"),
            "another pronunciation" to clipChirho.copy(pronunciationChirho = "modern_greek"),
            "a word clip with the same MP3" to clipChirho.copy(tokenIdChirho = "John.1.1!1"),
            "a window inside the file" to clipChirho.copy(startOffsetChirho = 0.0, endOffsetChirho = 1.0),
            "a human reading" to clipChirho.copy(readingSourceChirho = sampleReadingSourceChirho()),
            "another verse" to clipChirho.copy(lessonIdChirho = "John.1.2"),
            "another text" to clipChirho.copy(canonicalSha256Chirho = "0".repeat(64)),
            "a Hebrew clip" to clipChirho.copy(languageChirho = "he"),
            "a pending review" to clipChirho.copy(reviewChirho = "pending"),
            "another file path" to clipChirho.copy(assetPathChirho = otherPathChirho),
        )
        for ((reasonChirho, oneChirho) in otherChirho) {
            assertFalse(reasonChirho, VideoSelectionChirho.sameEmbeddedReadingChirho(greekChirho, oneChirho))
        }
        assertFalse("a Be'eri video's sound is never a synthesized clip", VideoSelectionChirho.sameEmbeddedReadingChirho(sampleVideoChirho(), clipChirho))
        assertFalse(
            "a mixed record matches nothing",
            VideoSelectionChirho.sameEmbeddedReadingChirho(greekChirho.copy(embeddedReadingChirho = sampleReadingSourceChirho()), clipChirho),
        )
    }

    /**
     * GPT, DM #3813: as the website's matcher reads raw rows, a synthesized soundtrack's row names token_id_chirho as null
     * and has no human-source or window key at all. Decoding cannot tell an absent key from a null one, so the decoder
     * records the row's shape; audio admission does not change.
     */
    @Test
    fun onlyABareWholeVerseRowCanBeASynthesizedSoundtrack() = runBlocking {
        val greekChirho = johnVideoChirho()
        val decodedChirho = requireNotNull(AudioRepositoryChirho.decodeClipChirho(johnRowChirho))
        assertTrue(decodedChirho.rawWholeVerseShapeChirho)
        for (keyChirho in listOf("reading_source_chirho", "start_offset_chirho", "end_offset_chirho")) {
            val nullKeyChirho = requireNotNull(AudioRepositoryChirho.decodeClipChirho(JsonObject(johnRowChirho + (keyChirho to JsonNull))))
            assertEquals("an explicit null $keyChirho decodes as before", decodedChirho.copy(rawWholeVerseShapeChirho = false), nullKeyChirho)
            assertFalse("but never stands for the video's sound", VideoSelectionChirho.sameEmbeddedReadingChirho(greekChirho, nullKeyChirho))
        }
        assertNull("a row without token_id_chirho is no recording at all", AudioRepositoryChirho.decodeClipChirho(JsonObject(johnRowChirho - "token_id_chirho")))
        assertFalse(
            "a clip made in code, not read from a published row, never matches",
            VideoSelectionChirho.sameEmbeddedReadingChirho(greekChirho, decodedChirho.copy(rawWholeVerseShapeChirho = false)),
        )

        val worldChirho = PublishedWorldChirho.orSkipChirho(Dispatchers.Unconfined)
        val loadedChirho = worldChirho.loadedChirho("John.1.1")
        val withNullsChirho = JsonObject(johnRowChirho + ("start_offset_chirho" to JsonNull) + ("end_offset_chirho" to JsonNull))
        val admittedChirho = AudioSelectionChirho.recordingsChirho(
            listOf(withNullsChirho), loadedChirho.verseChirho, greekChirho = true,
            canonicalSha256Chirho = sha256HexChirho(loadedChirho.verseChirho.canonicalTextChirho.encodeToByteArray()),
            decodeChirho = AudioRepositoryChirho::decodeClipChirho,
        )
        assertEquals("audio admission is unchanged: it still plays as a recording", listOf(decodedChirho.sha256Chirho), admittedChirho.versesChirho.map { it.sha256Chirho })
        assertFalse(admittedChirho.versesChirho.single().rawWholeVerseShapeChirho)
    }
}
