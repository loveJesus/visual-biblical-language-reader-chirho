// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
package us.hinneh.readerchirho.videochirho

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import us.hinneh.readerchirho.audiochirho.ReadingSourceChirho

/**
 * One verse video in the media chapter file's videos_chirho array: the verse's current scene in motion,
 * with its reading's own source identity (GPT's verse-video-chirho.ts, DM #3399). The two reading fields
 * are required keys: a silent video says null explicitly. Only the embedded clip may be absent. A record
 * that does not validate never plays.
 */
@Serializable
data class VideoRecordChirho(
    @SerialName("lesson_id_chirho") val lessonIdChirho: String,
    @SerialName("asset_path_chirho") val assetPathChirho: String,
    @SerialName("sha256_chirho") val sha256Chirho: String,
    @SerialName("bytes_chirho") val bytesChirho: Long,
    @SerialName("duration_chirho") val durationChirho: Double,
    @SerialName("width_chirho") val widthChirho: Int,
    @SerialName("height_chirho") val heightChirho: Int,
    /** The scene picture the video starts from; it stands in for the video until playback. */
    @SerialName("scene_sha256_chirho") val sceneSha256Chirho: String,
    /** The exact verse text the video belongs to. */
    @SerialName("canonical_sha256_chirho") val canonicalSha256Chirho: String,
    /** "he" with an embedded Be'eri reading, "el" with an embedded synthesized clip, null for a silent video. */
    @SerialName("reading_language_chirho") val readingLanguageChirho: String?,
    /** Where the video's Be'eri sound was cut from; null for a silent (CC0) video and for a synthesized clip's video. */
    @SerialName("embedded_reading_chirho") val embeddedReadingChirho: ReadingSourceChirho?,
    /** Shown wherever the video plays, exactly as published. */
    @SerialName("attribution_chirho") val attributionChirho: String,
    @SerialName("license_chirho") val licenseChirho: String,
    @SerialName("license_url_chirho") val licenseUrlChirho: String,
    @SerialName("review_chirho") val reviewChirho: String,
    /**
     * The exact published verse recording a synthesized video carries as its sound (unit 194, GPT DM #3807); absent on
     * Be'eri and silent videos. Such a record still names both reading keys, embedded_reading_chirho explicitly null,
     * so released apps keep the still and the audio and only withhold the video.
     */
    @SerialName("embedded_clip_chirho") val embeddedClipChirho: EmbeddedClipChirho? = null,
)

/**
 * A synthesized soundtrack's identity: the whole delivery MP3 of one admitted verse recording, exactly as its
 * clips_chirho row names it (the website's verse-video-chirho.ts EmbeddedClipChirho). Every field is required.
 */
@Serializable
data class EmbeddedClipChirho(
    @SerialName("sha256_chirho") val sha256Chirho: String,
    @SerialName("bytes_chirho") val bytesChirho: Long,
    @SerialName("duration_chirho") val durationChirho: Double,
    @SerialName("recipe_id_chirho") val recipeIdChirho: String,
    @SerialName("pronunciation_chirho") val pronunciationChirho: String,
)
