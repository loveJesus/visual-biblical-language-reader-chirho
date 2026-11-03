// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
package us.hinneh.readerchirho.audiochirho

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonObject
import us.hinneh.readerchirho.contentchirho.HebrewWordChirho
import us.hinneh.readerchirho.contentchirho.VerseChirho
import us.hinneh.readerchirho.contentchirho.WHITESPACE_CLASS_CHIRHO
import us.hinneh.readerchirho.domainchirho.SpokenChirho
import java.text.Normalizer
import java.util.Locale

@Serializable
data class AudioChapterEntryChirho(
    @SerialName("number_chirho") val numberChirho: Int,
    @SerialName("path_chirho") val pathChirho: String,
    @SerialName("sha256_chirho") val sha256Chirho: String,
)

@Serializable
data class AudioBookChirho(@SerialName("chapters_chirho") val chaptersChirho: List<AudioChapterEntryChirho>)

@Serializable
data class AudioManifestChirho(
    @SerialName("schema_version_chirho") val schemaVersionChirho: Int,
    @SerialName("books_chirho") val booksChirho: Map<String, AudioBookChirho>,
)

@Serializable
data class AudioChapterFileChirho(
    @SerialName("schema_version_chirho") val schemaVersionChirho: Int,
    @SerialName("book_id_chirho") val bookIdChirho: String,
    @SerialName("chapter_chirho") val chapterChirho: Int,
    @SerialName("content_path_chirho") val contentPathChirho: String,
    @SerialName("content_sha256_chirho") val contentSha256Chirho: String,
    @SerialName("clips_chirho") val clipsChirho: List<JsonObject>,
)

@Serializable
data class ClipChirho(
    @SerialName("lesson_id_chirho") val lessonIdChirho: String,
    @SerialName("token_id_chirho") val tokenIdChirho: String?,
    @SerialName("text_chirho") val textChirho: String,
    @SerialName("ipa_chirho") val ipaChirho: String? = null,
    @SerialName("synthesis_text_chirho") val synthesisTextChirho: String? = null,
    @SerialName("recipe_id_chirho") val recipeIdChirho: String? = null,
    @SerialName("canonical_sha256_chirho") val canonicalSha256Chirho: String,
    @SerialName("language_chirho") val languageChirho: String,
    @SerialName("pronunciation_chirho") val pronunciationChirho: String,
    @SerialName("voice_name_chirho") val voiceNameChirho: String,
    @SerialName("asset_path_chirho") val assetPathChirho: String,
    @SerialName("sha256_chirho") val sha256Chirho: String,
    @SerialName("bytes_chirho") val bytesChirho: Long,
    @SerialName("duration_chirho") val durationChirho: Double,
    @SerialName("start_offset_chirho") val startOffsetChirho: Double? = null,
    @SerialName("end_offset_chirho") val endOffsetChirho: Double? = null,
    @SerialName("review_chirho") val reviewChirho: String,
)

/** The website's Greek reading choices; Modern with Aspirates is the preferred default. */
enum class GreekRenditionChirho { MODERN_ASPIRATES_CHIRHO, MODERN_CHIRHO, ERASMIAN_CHIRHO }

/** Saved recordings bound to one verse: the best clip per word, and verse readings by priority. */
data class VerseRecordingsChirho(val wordsChirho: Map<String, List<ClipChirho>>, val versesChirho: List<ClipChirho>) {
    companion object {
        val EMPTY_CHIRHO = VerseRecordingsChirho(emptyMap(), emptyList())
    }
}

/**
 * Ported from recordings-chirho.ts and production-recipe-chirho.ts. Word-library recipes are
 * self-contained and re-checked here; verse recipes keep their identity and profile and rely on
 * the publisher's recipe check (GPT, DM #2692). Unknown shapes and rejected bytes are withheld.
 */
object AudioSelectionChirho {
    const val HEBREW_WORD_RECIPE_CHIRHO = "israeli-ipa-word-library-v1-chirho"
    const val GREEK_WORD_RECIPE_CHIRHO = "modern-greek-word-library-v1-chirho"
    const val HEBREW_CONNECTED_RECIPE_CHIRHO = "israeli-ipa-connected-v2-chirho"
    private val HEBREW_VERSE_RECIPES_CHIRHO = setOf("israeli-ipa-phrasing-v1-chirho", HEBREW_CONNECTED_RECIPE_CHIRHO)
    private val GREEK_VERSE_RECIPES_CHIRHO = mapOf(
        "modern-greek-phrasing-v1-chirho" to "modern_greek",
        "modern-vowels-rough-breathing-v2-chirho" to "modern_greek_aspirates",
        "erasmian-teaching-v1-chirho" to "erasmian_greek",
    )

    /** audio-reviews-chirho.json: exact rejected bytes never regain playback (also publisher-excluded). */
    private val REJECTED_CHIRHO = setOf("6a404d94c40e869718b48a3aa3c2083cb42ecd1596d720465fb2d7dac9d8975e")
    private val IPA_CHIRHO = Regex("[\\p{L}\\p{M}${WHITESPACE_CLASS_CHIRHO}ˈˌ]+")
    private val SHA_CHIRHO = Regex("[a-f0-9]{64}")
    private const val ROUGH_BREATHING_CHIRHO = '̔'

    fun validWindowChirho(clipChirho: ClipChirho): Boolean {
        val startChirho = clipChirho.startOffsetChirho
        val endChirho = clipChirho.endOffsetChirho
        if (startChirho == null && endChirho == null) return true
        return clipChirho.tokenIdChirho != null && startChirho != null && endChirho != null &&
            startChirho.isFinite() && endChirho.isFinite() && startChirho >= 0 &&
            endChirho - startChirho >= 0.1 && endChirho <= clipChirho.durationChirho
    }

    private fun legacyShapeChirho(clipChirho: ClipChirho): Boolean =
        if (clipChirho.ipaChirho == null) {
            clipChirho.synthesisTextChirho == null
        } else {
            clipChirho.synthesisTextChirho == "\"/${clipChirho.ipaChirho}/\""
        }

    private fun wordRecipeChirho(clipChirho: ClipChirho, greekChirho: Boolean, spokenChirho: String): Boolean =
        when (clipChirho.recipeIdChirho) {
            null -> legacyShapeChirho(clipChirho) && clipChirho.pronunciationChirho == baseProfileChirho(greekChirho)
            HEBREW_WORD_RECIPE_CHIRHO -> !greekChirho && clipChirho.pronunciationChirho == "israeli_hebrew" &&
                clipChirho.ipaChirho != null && clipChirho.ipaChirho.length in 1..200 && IPA_CHIRHO.matches(clipChirho.ipaChirho) &&
                clipChirho.synthesisTextChirho == "\"/${clipChirho.ipaChirho}/\""
            GREEK_WORD_RECIPE_CHIRHO -> greekChirho && clipChirho.pronunciationChirho == "modern_greek" &&
                clipChirho.ipaChirho == null && spokenChirho.isNotBlank() && spokenChirho.length <= 200 &&
                clipChirho.synthesisTextChirho == Normalizer.normalize(spokenChirho, Normalizer.Form.NFC).lowercase(Locale.forLanguageTag("el"))
            else -> false
        }

    private fun verseRecipeChirho(clipChirho: ClipChirho, greekChirho: Boolean): Boolean {
        val recipeChirho = clipChirho.recipeIdChirho
            ?: return legacyShapeChirho(clipChirho) && clipChirho.pronunciationChirho == baseProfileChirho(greekChirho)
        return if (greekChirho) {
            GREEK_VERSE_RECIPES_CHIRHO[recipeChirho] == clipChirho.pronunciationChirho
        } else {
            recipeChirho in HEBREW_VERSE_RECIPES_CHIRHO && clipChirho.pronunciationChirho == "israeli_hebrew"
        }
    }

    private fun baseProfileChirho(greekChirho: Boolean) = if (greekChirho) "modern_greek" else "israeli_hebrew"

    /** Every verse-bound clip that passes the website's identity, recipe and size rules, by priority. */
    fun recordingsChirho(
        rawChirho: List<JsonObject>,
        verseChirho: VerseChirho,
        greekChirho: Boolean,
        canonicalSha256Chirho: String,
        decodeChirho: (JsonObject) -> ClipChirho?,
    ): VerseRecordingsChirho {
        val spokenChirho = verseChirho.wordsChirho.associate { it.idChirho to SpokenChirho.wordChirho(it) }
        val aramaicChirho = verseChirho.wordsChirho.filter { (it as? HebrewWordChirho)?.sourceLanguageChirho == "arc" }
            .map { it.idChirho }.toSet()
        val verseTextChirho = SpokenChirho.verseChirho(verseChirho)
        val validChirho = rawChirho.mapNotNull(decodeChirho).filter { clipChirho ->
            val tokenChirho = clipChirho.tokenIdChirho
            val identityChirho = clipChirho.lessonIdChirho == verseChirho.idChirho &&
                clipChirho.canonicalSha256Chirho == canonicalSha256Chirho &&
                clipChirho.languageChirho == (if (greekChirho) "el" else "he") &&
                clipChirho.reviewChirho in setOf("audition", "approved") &&
                clipChirho.sha256Chirho !in REJECTED_CHIRHO &&
                validWindowChirho(clipChirho) &&
                clipChirho.voiceNameChirho.isNotEmpty() &&
                clipChirho.bytesChirho in 1..4_000_000 &&
                clipChirho.durationChirho > 0 && clipChirho.durationChirho <= 120 &&
                SHA_CHIRHO.matches(clipChirho.sha256Chirho) &&
                clipChirho.assetPathChirho == "/audio-chirho/sha256-chirho/${clipChirho.sha256Chirho}-chirho.mp3"
            identityChirho && if (tokenChirho == null) {
                clipChirho.textChirho == verseTextChirho && verseRecipeChirho(clipChirho, greekChirho)
            } else {
                tokenChirho !in aramaicChirho && spokenChirho[tokenChirho] == clipChirho.textChirho &&
                    wordRecipeChirho(clipChirho, greekChirho, clipChirho.textChirho)
            }
        }.sortedWith(PRIORITY_CHIRHO)
        return VerseRecordingsChirho(
            wordsChirho = validChirho.filter { it.tokenIdChirho != null }.groupBy { it.tokenIdChirho!! },
            versesChirho = validChirho.filter { it.tokenIdChirho == null },
        )
    }

    /** Approved first, then the connected reading, then recipe-backed, then IPA-backed clips. */
    private val PRIORITY_CHIRHO = compareByDescending<ClipChirho> { it.reviewChirho == "approved" }
        .thenByDescending { it.recipeIdChirho == HEBREW_CONNECTED_RECIPE_CHIRHO }
        .thenByDescending { it.recipeIdChirho != null }
        .thenByDescending { it.ipaChirho != null }

    /** Whether a clip may stand for the selected Greek reading of this text (speech-controls). */
    fun compatibleChirho(clipChirho: ClipChirho, greekChirho: Boolean, renditionChirho: GreekRenditionChirho, spokenTextChirho: String): Boolean {
        if (!greekChirho) return true
        return when (renditionChirho) {
            GreekRenditionChirho.MODERN_CHIRHO -> clipChirho.pronunciationChirho == "modern_greek"
            GreekRenditionChirho.ERASMIAN_CHIRHO -> clipChirho.pronunciationChirho == "erasmian_greek"
            GreekRenditionChirho.MODERN_ASPIRATES_CHIRHO -> clipChirho.pronunciationChirho == "modern_greek_aspirates" ||
                (clipChirho.pronunciationChirho == "modern_greek" &&
                    !Normalizer.normalize(spokenTextChirho, Normalizer.Form.NFD).contains(ROUGH_BREATHING_CHIRHO))
        }
    }

    fun bestChirho(clipsChirho: List<ClipChirho>?, greekChirho: Boolean, renditionChirho: GreekRenditionChirho): ClipChirho? =
        clipsChirho?.firstOrNull { compatibleChirho(it, greekChirho, renditionChirho, it.textChirho) }
}
