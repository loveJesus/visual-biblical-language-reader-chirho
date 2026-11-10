// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
package us.hinneh.readerchirho.audiochirho

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.Transient
import kotlinx.serialization.json.JsonObject
import us.hinneh.readerchirho.contentchirho.HebrewWordChirho
import us.hinneh.readerchirho.contentchirho.VerseChirho
import us.hinneh.readerchirho.contentchirho.WHITESPACE_CLASS_CHIRHO
import us.hinneh.readerchirho.domainchirho.SpokenChirho
import us.hinneh.readerchirho.domainchirho.SpokenOverridesChirho
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
    /** Human verse readings only, kept apart so released apps that cannot credit them never play them (GPT, DM #3410). */
    @SerialName("readings_chirho") val readingsChirho: List<JsonObject> = emptyList(),
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
    /** Present only on a human reading; see HumanReadingChirho. */
    @SerialName("reading_source_chirho") val readingSourceChirho: ReadingSourceChirho? = null,
    /**
     * Never read from JSON: AudioRepositoryChirho.decodeClipChirho sets it from the published row's own keys. True only for
     * a row that names token_id_chirho as null and has no reading_source_chirho, start_offset_chirho or end_offset_chirho
     * key at all, not even a null one. Only a synthesized verse video's match reads it (unit 194, GPT DM #3813); audio
     * admission and selection never do.
     */
    @Transient val rawWholeVerseShapeChirho: Boolean = false,
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
 * the publisher's recipe check (GPT, DM #2692). Human verse readings carry a reading source instead
 * of a recipe (GPT, DM #3390). Unknown shapes and rejected bytes are withheld.
 */
object AudioSelectionChirho {
    const val HEBREW_WORD_RECIPE_CHIRHO = "israeli-ipa-word-library-v1-chirho"
    const val GREEK_WORD_RECIPE_CHIRHO = "modern-greek-word-library-v1-chirho"
    const val HEBREW_CONNECTED_RECIPE_CHIRHO = "israeli-ipa-connected-v2-chirho"
    /** Local Chatterbox V3 whole-verse readings: plain Modern, rough breathing silent (GPT, DM #3449). */
    const val LOCAL_GREEK_VERSE_RECIPE_CHIRHO = "chatterbox-v3-modern-greek-verse-v1-chirho"
    private val HEBREW_VERSE_RECIPES_CHIRHO = setOf("israeli-ipa-phrasing-v1-chirho", HEBREW_CONNECTED_RECIPE_CHIRHO)
    private val GREEK_VERSE_RECIPES_CHIRHO = mapOf(
        "modern-greek-phrasing-v1-chirho" to "modern_greek",
        "modern-vowels-rough-breathing-v2-chirho" to "modern_greek_aspirates",
        "erasmian-teaching-v1-chirho" to "erasmian_greek",
        // Fish whole-verse readings with a capital H before rough breathing (GPT, DM #3362).
        "fish-modern-aspirates-verse-v1-chirho" to "modern_greek_aspirates",
        // Never Aspirates: compatibleChirho lets it stand for Aspirates only when the verse has no rough breathing.
        LOCAL_GREEK_VERSE_RECIPE_CHIRHO to "modern_greek",
    )

    /**
     * audio-reviews-chirho.json: exact rejected bytes never regain playback (also publisher-excluded). A verse video's
     * embedded clip is checked against the same list (VideoSelectionChirho).
     */
    internal val REJECTED_CHIRHO = setOf("6a404d94c40e869718b48a3aa3c2083cb42ecd1596d720465fb2d7dac9d8975e")

    /** The review states a published recording may play in; a verse video's embedded clip must be one of them too. */
    internal val ADMITTED_REVIEWS_CHIRHO = setOf("audition", "approved")
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
        readingsChirho: List<JsonObject> = emptyList(),
        overridesChirho: SpokenOverridesChirho = SpokenOverridesChirho.NONE_CHIRHO,
    ): VerseRecordingsChirho {
        // A word clip speaks its word (word semantics); a verse reading speaks the verse, a written group as one word.
        val spokenChirho = verseChirho.wordsChirho.associate { it.idChirho to SpokenChirho.wordChirho(it, overridesChirho) }
        val aramaicChirho = verseChirho.wordsChirho.filter { (it as? HebrewWordChirho)?.sourceLanguageChirho == "arc" }
            .map { it.idChirho }.toSet()
        val verseTextChirho = SpokenChirho.verseChirho(verseChirho, overridesChirho)
        // Every readings_chirho entry must be a valid human reading; a clips_chirho entry that claims a human
        // source must prove it too, and is never reread as an AI recording.
        val candidatesChirho = rawChirho.map { it to ("reading_source_chirho" in it) } + readingsChirho.map { it to true }
        val validChirho = candidatesChirho.mapNotNull { (objectChirho, humanChirho) ->
            decodeChirho(objectChirho)?.let { Triple(objectChirho, it, humanChirho) }
        }.filter { (objectChirho, clipChirho, humanChirho) ->
            val tokenChirho = clipChirho.tokenIdChirho
            val identityChirho = clipChirho.lessonIdChirho == verseChirho.idChirho &&
                clipChirho.canonicalSha256Chirho == canonicalSha256Chirho &&
                clipChirho.languageChirho == (if (greekChirho) "el" else "he") &&
                clipChirho.reviewChirho in ADMITTED_REVIEWS_CHIRHO &&
                clipChirho.sha256Chirho !in REJECTED_CHIRHO &&
                validWindowChirho(clipChirho) &&
                clipChirho.voiceNameChirho.isNotEmpty() &&
                clipChirho.bytesChirho in 1..4_000_000 &&
                clipChirho.durationChirho > 0 && clipChirho.durationChirho <= 120 &&
                SHA_CHIRHO.matches(clipChirho.sha256Chirho) &&
                clipChirho.assetPathChirho == "/audio-chirho/sha256-chirho/${clipChirho.sha256Chirho}-chirho.mp3"
            identityChirho && if (tokenChirho == null) {
                clipChirho.textChirho == verseTextChirho &&
                    if (humanChirho) HumanReadingChirho.validClipChirho(objectChirho, clipChirho) else verseRecipeChirho(clipChirho, greekChirho)
            } else {
                !humanChirho && tokenChirho !in aramaicChirho && spokenChirho[tokenChirho] == clipChirho.textChirho &&
                    wordRecipeChirho(clipChirho, greekChirho, clipChirho.textChirho)
            }
        }.map { it.second }.sortedWith(PRIORITY_CHIRHO)
        return VerseRecordingsChirho(
            wordsChirho = validChirho.filter { it.tokenIdChirho != null }.groupBy { it.tokenIdChirho!! },
            versesChirho = validChirho.filter { it.tokenIdChirho == null },
        )
    }

    /** A human reading first (GPT, DM #3386), then approved, the connected reading, recipe-backed and IPA-backed clips. */
    private val PRIORITY_CHIRHO = compareByDescending<ClipChirho> { it.readingSourceChirho != null }
        .thenByDescending { it.reviewChirho == "approved" }
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
