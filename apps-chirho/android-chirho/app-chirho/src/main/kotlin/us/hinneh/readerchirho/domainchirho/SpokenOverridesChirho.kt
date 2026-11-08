// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: spec-chirho/workflows-chirho/native-chirho/verse-video-chirho.md
package us.hinneh.readerchirho.domainchirho

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import us.hinneh.readerchirho.contentchirho.ContentJsonChirho
import us.hinneh.readerchirho.contentchirho.HebrewWordChirho
import us.hinneh.readerchirho.contentchirho.QereChirho
import us.hinneh.readerchirho.contentchirho.WordChirho

/** A written word's exact identity, as the website's ReadingTokenChirho (reading-continuation-chirho.ts). */
@Serializable
data class ReadingTokenChirho(
    @SerialName("id_chirho") val idChirho: String,
    @SerialName("text_chirho") val textChirho: String,
    @SerialName("lemma_id_chirho") val lemmaIdChirho: String? = null,
    @SerialName("lemma_augment_chirho") val lemmaAugmentChirho: String? = null,
    @SerialName("raw_morphology_chirho") val rawMorphologyChirho: String? = null,
    @SerialName("qere_chirho") val qereChirho: List<ReadingTokenChirho>? = null,
)

/**
 * One reviewed spoken reading, exported byte-identically from the website's reading-continuation table
 * (assets/teaching-chirho/spoken-overrides-chirho.json, GPT DM #3551). A written group is read as one word.
 */
@Serializable
data class SpokenOverrideChirho(
    @SerialName("lesson_id_chirho") val lessonIdChirho: String,
    @SerialName("token_id_chirho") val tokenIdChirho: String,
    @SerialName("text_chirho") val textChirho: String,
    @SerialName("lemma_id_chirho") val lemmaIdChirho: String,
    @SerialName("lemma_augment_chirho") val lemmaAugmentChirho: String?,
    @SerialName("raw_morphology_chirho") val rawMorphologyChirho: String,
    @SerialName("qere_binding_chirho") val qereBindingChirho: List<ReadingTokenChirho>?,
    @SerialName("spoken_reading_chirho") val spokenReadingChirho: String,
    @SerialName("written_group_chirho") val writtenGroupChirho: List<ReadingTokenChirho>?,
    @SerialName("canonical_text_chirho") val canonicalTextChirho: String?,
) {
    /** The identity this review was made for (readingReviewChirho): its own token, with its bound qere. */
    val identityChirho: ReadingTokenChirho
        get() = ReadingTokenChirho(tokenIdChirho, textChirho, lemmaIdChirho, lemmaAugmentChirho, rawMorphologyChirho, qereBindingChirho)
}

@Serializable
private data class SpokenOverridesFileChirho(
    @SerialName("schema_version_chirho") val schemaVersionChirho: Int,
    @SerialName("words_chirho") val wordsChirho: List<SpokenOverrideChirho>,
)

/**
 * Reviewed spoken readings that are not in the content's qere, ported from the website's reading-continuation-chirho.ts.
 * A review applies only to the exact word it was made for; anything that does not decode or validate leaves none.
 */
class SpokenOverridesChirho private constructor(private val byTokenChirho: Map<String, SpokenOverrideChirho>) {
    val sizeChirho: Int get() = byTokenChirho.size

    /** readingReviewChirho: the review for this word, only when its id, text, lemma, augment, morphology and qere all match. */
    fun reviewChirho(wordChirho: WordChirho): SpokenOverrideChirho? {
        val hebrewChirho = wordChirho as? HebrewWordChirho ?: return null
        val reviewChirho = byTokenChirho[hebrewChirho.idChirho] ?: return null
        return reviewChirho.takeIf { matchesChirho(hebrewChirho, it.identityChirho) }
    }

    companion object {
        const val ASSET_PATH_CHIRHO = "teaching-chirho/spoken-overrides-chirho.json"
        val NONE_CHIRHO = SpokenOverridesChirho(emptyMap())

        /** A file that fails any check gives no reviews, so every word keeps its source reading. */
        fun decodeChirho(bytesChirho: ByteArray): SpokenOverridesChirho {
            val fileChirho = try {
                ContentJsonChirho.decodeFromString(SpokenOverridesFileChirho.serializer(), bytesChirho.decodeToString())
            } catch (invalidChirho: IllegalArgumentException) {
                return NONE_CHIRHO
            }
            if (fileChirho.schemaVersionChirho != 1) return NONE_CHIRHO
            val rowsChirho = fileChirho.wordsChirho
            if (rowsChirho.map { it.tokenIdChirho }.toSet().size != rowsChirho.size || !rowsChirho.all(::validChirho)) return NONE_CHIRHO
            return SpokenOverridesChirho(rowsChirho.associateBy { it.tokenIdChirho })
        }

        private fun validChirho(rowChirho: SpokenOverrideChirho): Boolean {
            if (rowChirho.tokenIdChirho.isBlank() || rowChirho.spokenReadingChirho.isBlank() || PassageChirho.parseChirho(rowChirho.lessonIdChirho) == null) {
                return false
            }
            val groupChirho = rowChirho.writtenGroupChirho ?: return true
            // A group names distinct written words, including this row's word, and belongs to one exact verse text.
            return groupChirho.isNotEmpty() && groupChirho.map { it.idChirho }.toSet().size == groupChirho.size &&
                groupChirho.any { it.idChirho == rowChirho.tokenIdChirho } && !rowChirho.canonicalTextChirho.isNullOrEmpty()
        }

        /** readingMatchesChirho: the same id, text, lemma, augment (null-equal), morphology and qere, recursively. */
        fun matchesChirho(wordChirho: HebrewWordChirho, memberChirho: ReadingTokenChirho): Boolean =
            wordChirho.idChirho == memberChirho.idChirho && wordChirho.textChirho == memberChirho.textChirho &&
                wordChirho.lemmaIdChirho == memberChirho.lemmaIdChirho && wordChirho.lemmaAugmentChirho == memberChirho.lemmaAugmentChirho &&
                wordChirho.rawMorphologyChirho == memberChirho.rawMorphologyChirho && qereMatchesChirho(wordChirho.qereChirho, memberChirho.qereChirho)

        private fun qereMatchesChirho(actualChirho: List<QereChirho>?, expectedChirho: List<ReadingTokenChirho>?): Boolean {
            val readingsChirho = actualChirho.orEmpty()
            val wantedChirho = expectedChirho.orEmpty()
            return readingsChirho.size == wantedChirho.size && readingsChirho.zip(wantedChirho).all { (qereChirho, memberChirho) ->
                // A content qere has no further qere of its own.
                qereChirho.idChirho == memberChirho.idChirho && qereChirho.textChirho == memberChirho.textChirho &&
                    qereChirho.lemmaIdChirho == memberChirho.lemmaIdChirho && qereChirho.lemmaAugmentChirho == memberChirho.lemmaAugmentChirho &&
                    qereChirho.rawMorphologyChirho == memberChirho.rawMorphologyChirho && memberChirho.qereChirho.isNullOrEmpty()
            }
        }
    }
}
