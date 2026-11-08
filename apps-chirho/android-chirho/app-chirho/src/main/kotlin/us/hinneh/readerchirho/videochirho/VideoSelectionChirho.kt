// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: spec-chirho/workflows-chirho/native-chirho/verse-video-chirho.md
package us.hinneh.readerchirho.videochirho

import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import us.hinneh.readerchirho.audiochirho.ClipChirho
import us.hinneh.readerchirho.audiochirho.HumanReadingChirho
import us.hinneh.readerchirho.contentchirho.ContentJsonChirho
import kotlin.math.abs

/** Which verse video may play: ported exactly from the website's verse-video-chirho.ts (GPT, DM #3399). */
object VideoSelectionChirho {
    /** Content-addressed like saved audio: the file name is the video's own SHA-256. */
    val ASSET_PATH_CHIRHO = Regex("/video-chirho/sha256-chirho/([a-f0-9]{64})-chirho\\.mp4")
    const val MAX_BYTES_CHIRHO = 16L * 1024 * 1024
    const val CC0_CHIRHO = "CC0"
    const val CC0_URL_CHIRHO = "https://creativecommons.org/publicdomain/zero/1.0/"
    private val SHA_CHIRHO = Regex("[a-f0-9]{64}")
    private val REVIEWS_CHIRHO = setOf("pending", "approved")

    /** Valid for this verse only: its exact text, the scene shown in its place, and a Be'eri or silent CC0 reading. */
    fun validChirho(recordChirho: VideoRecordChirho, lessonIdChirho: String, canonicalShaChirho: String, sceneShaChirho: String): Boolean {
        if (recordChirho.lessonIdChirho != lessonIdChirho || recordChirho.canonicalSha256Chirho != canonicalShaChirho ||
            recordChirho.sceneSha256Chirho != sceneShaChirho ||
            !SHA_CHIRHO.matches(recordChirho.sha256Chirho) || !SHA_CHIRHO.matches(canonicalShaChirho) || !SHA_CHIRHO.matches(sceneShaChirho)
        ) {
            return false
        }
        if (recordChirho.assetPathChirho != "/video-chirho/sha256-chirho/${recordChirho.sha256Chirho}-chirho.mp4" ||
            recordChirho.bytesChirho !in 1..MAX_BYTES_CHIRHO ||
            !recordChirho.durationChirho.isFinite() || recordChirho.durationChirho <= 0 || recordChirho.durationChirho > 120 ||
            recordChirho.widthChirho !in 1..4096 || recordChirho.heightChirho !in 1..4096 ||
            recordChirho.reviewChirho !in REVIEWS_CHIRHO ||
            recordChirho.attributionChirho.isBlank() || recordChirho.attributionChirho.length > 1000
        ) {
            return false
        }
        val embeddedChirho = recordChirho.embeddedReadingChirho
            ?: return recordChirho.readingLanguageChirho == null &&
                recordChirho.licenseChirho == CC0_CHIRHO && recordChirho.licenseUrlChirho == CC0_URL_CHIRHO
        return HumanReadingChirho.validSourceChirho(embeddedChirho, lessonIdChirho) &&
            recordChirho.readingLanguageChirho == "he" &&
            abs(recordChirho.durationChirho - (embeddedChirho.endChirho - embeddedChirho.startChirho)) <= 0.3 &&
            recordChirho.licenseChirho == HumanReadingChirho.BEERI_LICENSE_CHIRHO &&
            recordChirho.licenseUrlChirho == HumanReadingChirho.BEERI_LICENSE_URL_CHIRHO
    }

    /** This verse's single published record, decoded; none when absent, malformed or listed more than once. */
    fun verseRecordChirho(rawChirho: List<JsonObject>?, lessonIdChirho: String): VideoRecordChirho? {
        val ownChirho = rawChirho.orEmpty().filter { (it["lesson_id_chirho"] as? JsonPrimitive)?.content == lessonIdChirho }
        val singleChirho = ownChirho.singleOrNull() ?: return null
        return try {
            ContentJsonChirho.decodeFromJsonElement(VideoRecordChirho.serializer(), singleChirho)
        } catch (invalidChirho: IllegalArgumentException) {
            null
        }
    }

    /**
     * Whether the video's own sound is exactly this recording's source (sameEmbeddedReadingChirho): the same verse
     * text and five source identities, with both window ends within 0.3 s. Otherwise a separate reading track is needed.
     */
    fun sameEmbeddedReadingChirho(videoChirho: VideoRecordChirho, clipChirho: ClipChirho): Boolean {
        val embeddedChirho = videoChirho.embeddedReadingChirho ?: return false
        val selectedChirho = clipChirho.readingSourceChirho ?: return false
        if (videoChirho.lessonIdChirho != clipChirho.lessonIdChirho || videoChirho.canonicalSha256Chirho != clipChirho.canonicalSha256Chirho ||
            !HumanReadingChirho.validSourceChirho(selectedChirho, clipChirho.lessonIdChirho)
        ) {
            return false
        }
        return embeddedChirho.readerIdChirho == selectedChirho.readerIdChirho &&
            embeddedChirho.gbtIdChirho == selectedChirho.gbtIdChirho &&
            embeddedChirho.packageSha256Chirho == selectedChirho.packageSha256Chirho &&
            embeddedChirho.chapterSha256Chirho == selectedChirho.chapterSha256Chirho &&
            embeddedChirho.timingsSha256Chirho == selectedChirho.timingsSha256Chirho &&
            abs(embeddedChirho.startChirho - selectedChirho.startChirho) <= 0.3 &&
            abs(embeddedChirho.endChirho - selectedChirho.endChirho) <= 0.3
    }
}
