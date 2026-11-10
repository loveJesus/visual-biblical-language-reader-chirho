// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: spec-chirho/workflows-chirho/native-chirho/verse-video-chirho.md
package us.hinneh.readerchirho.videochirho

import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import us.hinneh.readerchirho.audiochirho.AudioSelectionChirho
import us.hinneh.readerchirho.audiochirho.ClipChirho
import us.hinneh.readerchirho.audiochirho.HumanReadingChirho
import us.hinneh.readerchirho.contentchirho.ContentJsonChirho
import kotlin.math.abs

/**
 * Which verse video may play: ported exactly from the website's verse-video-chirho.ts (GPT, DM #3399), including its
 * synthesized-clip branch (unit 194, frozen contract 8c33593f, candidate source af63b845; GPT DM #3807).
 */
object VideoSelectionChirho {
    /** Content-addressed like saved audio: the file name is the video's own SHA-256. */
    val ASSET_PATH_CHIRHO = Regex("/video-chirho/sha256-chirho/([a-f0-9]{64})-chirho\\.mp4")
    const val MAX_BYTES_CHIRHO = 16L * 1024 * 1024
    const val CC0_CHIRHO = "CC0"
    const val CC0_URL_CHIRHO = "https://creativecommons.org/publicdomain/zero/1.0/"
    /** The project's recording license, which a video whose sound is a synthesized verse recording carries. */
    const val CC_BY_CHIRHO = "CC BY 4.0"
    const val CC_BY_URL_CHIRHO = "https://creativecommons.org/licenses/by/4.0/"
    /** An embedded clip is one whole published verse MP3, so it keeps a verse recording's own size bound. */
    const val MAX_CLIP_BYTES_CHIRHO = 4_000_000L
    private val SHA_CHIRHO = Regex("[a-f0-9]{64}")
    private val REVIEWS_CHIRHO = setOf("pending", "approved")
    private val RECIPE_ID_CHIRHO = Regex("[a-z0-9]+(?:-[a-z0-9]+)*-chirho")
    private val GREEK_PROFILES_CHIRHO = setOf("modern_greek", "modern_greek_aspirates", "erasmian_greek")

    /**
     * The five fields of a synthesized soundtrack (validEmbeddedClipChirho): a whole published MP3 that is not rejected,
     * within a verse recording's size and length, under a recipe-shaped id and one of the three Greek readings.
     */
    fun validEmbeddedClipChirho(clipChirho: EmbeddedClipChirho): Boolean =
        SHA_CHIRHO.matches(clipChirho.sha256Chirho) && clipChirho.sha256Chirho !in AudioSelectionChirho.REJECTED_CHIRHO &&
            clipChirho.bytesChirho in 1..MAX_CLIP_BYTES_CHIRHO &&
            clipChirho.durationChirho.isFinite() && clipChirho.durationChirho > 0 && clipChirho.durationChirho <= 120 &&
            clipChirho.recipeIdChirho.length <= 128 && RECIPE_ID_CHIRHO.matches(clipChirho.recipeIdChirho) &&
            clipChirho.pronunciationChirho in GREEK_PROFILES_CHIRHO

    /**
     * Valid for this verse only: its exact text, the scene shown in its place, and a Be'eri reading, a synthesized Greek
     * clip or a silent CC0 video. A record with an embedded clip is judged only as one, so a mixed record never plays.
     */
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
        val syntheticChirho = recordChirho.embeddedClipChirho
        if (syntheticChirho != null) {
            return recordChirho.embeddedReadingChirho == null && recordChirho.readingLanguageChirho == "el" &&
                validEmbeddedClipChirho(syntheticChirho) &&
                abs(recordChirho.durationChirho - syntheticChirho.durationChirho) <= 0.3 &&
                recordChirho.licenseChirho == CC_BY_CHIRHO && recordChirho.licenseUrlChirho == CC_BY_URL_CHIRHO
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
     * Whether the video's own sound is exactly this recording (sameEmbeddedReadingChirho). A synthesized soundtrack must
     * be this very admitted whole-verse clip: same verse text, no word token, offset window or human source, and all
     * five descriptor fields equal, so a word clip with the same MP3 never stands for it. A Be'eri soundtrack must be
     * this recording's source: the same verse text and five source identities, with both window ends within 0.3 s.
     * Callers choose the recording first; this never picks another one to make a video playable.
     */
    fun sameEmbeddedReadingChirho(videoChirho: VideoRecordChirho, clipChirho: ClipChirho): Boolean {
        videoChirho.embeddedClipChirho?.let { syntheticChirho ->
            return videoChirho.embeddedReadingChirho == null && videoChirho.readingLanguageChirho == "el" &&
                validEmbeddedClipChirho(syntheticChirho) &&
                abs(videoChirho.durationChirho - syntheticChirho.durationChirho) <= 0.3 &&
                videoChirho.lessonIdChirho == clipChirho.lessonIdChirho &&
                videoChirho.canonicalSha256Chirho == clipChirho.canonicalSha256Chirho &&
                clipChirho.rawWholeVerseShapeChirho &&
                clipChirho.tokenIdChirho == null && clipChirho.languageChirho == "el" && clipChirho.readingSourceChirho == null &&
                clipChirho.startOffsetChirho == null && clipChirho.endOffsetChirho == null &&
                clipChirho.reviewChirho in AudioSelectionChirho.ADMITTED_REVIEWS_CHIRHO &&
                clipChirho.assetPathChirho == "/audio-chirho/sha256-chirho/${syntheticChirho.sha256Chirho}-chirho.mp3" &&
                clipChirho.sha256Chirho == syntheticChirho.sha256Chirho && clipChirho.bytesChirho == syntheticChirho.bytesChirho &&
                clipChirho.durationChirho == syntheticChirho.durationChirho &&
                clipChirho.recipeIdChirho == syntheticChirho.recipeIdChirho &&
                clipChirho.pronunciationChirho == syntheticChirho.pronunciationChirho
        }
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
