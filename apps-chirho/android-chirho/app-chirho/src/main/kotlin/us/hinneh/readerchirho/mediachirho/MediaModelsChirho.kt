// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
package us.hinneh.readerchirho.mediachirho

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonObject
import us.hinneh.readerchirho.videochirho.VideoRecordChirho

@Serializable
data class MediaEntryChirho(
    @SerialName("number_chirho") val numberChirho: Int,
    @SerialName("path_chirho") val pathChirho: String,
    @SerialName("sha256_chirho") val sha256Chirho: String,
    @SerialName("scene_count_chirho") val sceneCountChirho: Int,
    @SerialName("icon_count_chirho") val iconCountChirho: Int,
    @SerialName("lemma_icon_count_chirho") val lemmaIconCountChirho: Int? = null,
)

@Serializable
data class MediaSummaryChirho(
    @SerialName("schema_version_chirho") val schemaVersionChirho: Int,
    @SerialName("book_id_chirho") val bookIdChirho: String,
    @SerialName("scene_count_chirho") val sceneCountChirho: Long,
    @SerialName("icon_count_chirho") val iconCountChirho: Long,
    @SerialName("chapters_chirho") val chaptersChirho: List<MediaEntryChirho>,
)

/** Records stay raw until a verse needs them, so one bad record cannot hide another chapter. */
@Serializable
data class MediaChapterFileChirho(
    @SerialName("schema_version_chirho") val schemaVersionChirho: Int,
    @SerialName("book_id_chirho") val bookIdChirho: String,
    @SerialName("chapter_chirho") val chapterChirho: Int,
    @SerialName("scenes_chirho") val scenesChirho: List<JsonObject>,
    @SerialName("icons_chirho") val iconsChirho: List<JsonObject>,
    @SerialName("lemma_icons_chirho") val lemmaIconsChirho: List<JsonObject>? = null,
    @SerialName("videos_chirho") val videosChirho: List<JsonObject>? = null,
)

@Serializable
data class SceneRecordChirho(
    @SerialName("lesson_id_chirho") val lessonIdChirho: String,
    @SerialName("asset_path_chirho") val assetPathChirho: String,
    @SerialName("alt_chirho") val altChirho: String,
    @SerialName("width_chirho") val widthChirho: Int,
    @SerialName("height_chirho") val heightChirho: Int,
    @SerialName("sha256_chirho") val sha256Chirho: String,
    @SerialName("art_review_chirho") val artReviewChirho: String,
    @SerialName("reading_note_chirho") val readingNoteChirho: String,
    @SerialName("variant_chirho") val variantChirho: String? = null,
)

/** A verse scene: the Standard image and, for selected verses only, a reduced-representation one. */
data class ScenePresentationChirho(val standardChirho: SceneRecordChirho, val reducedChirho: SceneRecordChirho?)

@Serializable
data class IconRecordChirho(
    @SerialName("id_chirho") val idChirho: String? = null,
    @SerialName("lesson_id_chirho") val lessonIdChirho: String? = null,
    @SerialName("token_id_chirho") val tokenIdChirho: String,
    @SerialName("lemma_id_chirho") val lemmaIdChirho: String,
    @SerialName("lemma_augment_chirho") val lemmaAugmentChirho: String? = null,
    @SerialName("lexical_form_chirho") val lexicalFormChirho: String? = null,
    @SerialName("sense_id_chirho") val senseIdChirho: String,
    @SerialName("contextual_meaning_chirho") val contextualMeaningChirho: String,
    @SerialName("asset_path_chirho") val assetPathChirho: String,
    @SerialName("alt_chirho") val altChirho: String,
    @SerialName("width_chirho") val widthChirho: Int,
    @SerialName("height_chirho") val heightChirho: Int,
    @SerialName("sha256_chirho") val sha256Chirho: String,
    @SerialName("sense_review_chirho") val senseReviewChirho: String,
    @SerialName("art_review_chirho") val artReviewChirho: String,
    @SerialName("evidence_refs_chirho") val evidenceRefsChirho: List<String>,
    @SerialName("display_authority_chirho") val displayAuthorityChirho: String,
    @SerialName("selected_chirho") val selectedChirho: Boolean? = null,
    @SerialName("assignment_chirho") val assignmentChirho: String? = null,
    @SerialName("context_text_chirho") val contextTextChirho: String? = null,
    @SerialName("context_gloss_chirho") val contextGlossChirho: String? = null,
    @SerialName("context_canonical_text_chirho") val contextCanonicalTextChirho: String? = null,
)

/** The picture shown under one word: a reviewed contextual sense, or a general lemma picture. */
data class WordPictureChirho(
    val recordChirho: IconRecordChirho,
    val generalChirho: Boolean,
    val alternativesChirho: List<IconRecordChirho>,
)

/** Everything optional the reader may show beside a verse; empty when unavailable. */
data class VerseMediaChirho(
    val sceneChirho: ScenePresentationChirho?,
    val picturesChirho: Map<String, WordPictureChirho>,
    /** When present, the video takes the scene's place and Play plays it with its reading. */
    val videoChirho: VideoRecordChirho? = null,
    /** True only for a development video staged on this device (debug builds), never a published one. */
    val videoStagedChirho: Boolean = false,
) {
    companion object {
        val EMPTY_CHIRHO = VerseMediaChirho(null, emptyMap())
    }
}
