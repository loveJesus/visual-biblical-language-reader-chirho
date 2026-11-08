// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: spec-chirho/workflows-chirho/native-chirho/verse-video-chirho.md
package us.hinneh.readerchirho.audiochirho

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonObject

/** Where a human verse reading was cut from: the reader, the source files' hashes and the verse's window in them. */
@Serializable
data class ReadingSourceChirho(
    @SerialName("kind_chirho") val kindChirho: String,
    @SerialName("reader_id_chirho") val readerIdChirho: String,
    @SerialName("gbt_id_chirho") val gbtIdChirho: String,
    @SerialName("package_sha256_chirho") val packageSha256Chirho: String,
    @SerialName("chapter_sha256_chirho") val chapterSha256Chirho: String,
    @SerialName("timings_sha256_chirho") val timingsSha256Chirho: String,
    @SerialName("start_chirho") val startChirho: Double,
    @SerialName("end_chirho") val endChirho: Double,
    @SerialName("chapter_duration_chirho") val chapterDurationChirho: Double,
    @SerialName("attribution_chirho") val attributionChirho: String,
    @SerialName("license_chirho") val licenseChirho: String,
    @SerialName("license_url_chirho") val licenseUrlChirho: String,
)

/**
 * Ported exactly from the website's reading-source-chirho.ts (GPT, DM #3390): a human reading carries its source,
 * never a synthesis claim, and a partial or foreign source is not human audio.
 */
object HumanReadingChirho {
    const val BEERI_ATTRIBUTION_CHIRHO =
        "Hebrew reading by Rabbi Dan Be'eri (CC BY-SA 3.0), compiled at archive.org; chapter files and verse timings from Global Bible Tools"
    const val BEERI_LICENSE_URL_CHIRHO = "https://creativecommons.org/licenses/by-sa/3.0/"
    const val BEERI_LICENSE_CHIRHO = "CC BY-SA 3.0"
    const val BEERI_VOICE_CHIRHO = "Rabbi Dan Be'eri"

    /** Rabbi Dan Be'eri's 30 books, with their Global Bible Tools codes (config-chirho/bible-chirho/books-chirho.json). */
    private val GBT_CODES_CHIRHO = mapOf(
        "Gen" to "Gen", "Exod" to "Exo", "Lev" to "Lev", "Num" to "Num", "Deut" to "Deu", "Josh" to "Jos", "Judg" to "Jdg",
        "Ruth" to "Rut", "1Sam" to "1Sa", "2Sam" to "2Sa", "1Kgs" to "1Ki", "2Kgs" to "2Ki", "Ezra" to "Ezr", "Esth" to "Est",
        "Job" to "Job", "Ps" to "Psa", "Prov" to "Pro", "Eccl" to "Ecc", "Song" to "Sng", "Isa" to "Isa", "Lam" to "Lam",
        "Dan" to "Dan", "Obad" to "Oba", "Jonah" to "Jon", "Nah" to "Nam", "Hab" to "Hab", "Zeph" to "Zep", "Hag" to "Hag",
        "Zech" to "Zec", "Mal" to "Mal",
    )

    /** Fields only a synthesized recording has; a human clip that carries any of them is refused. */
    private val SYNTHESIS_KEYS_CHIRHO = listOf("ipa_chirho", "synthesis_text_chirho", "recipe_id_chirho", "start_offset_chirho", "end_offset_chirho")
    private val SHA_CHIRHO = Regex("[a-f0-9]{64}")

    fun validSourceChirho(sourceChirho: ReadingSourceChirho, lessonIdChirho: String): Boolean {
        val codeChirho = GBT_CODES_CHIRHO[lessonIdChirho.substringBefore('.')] ?: return false
        return sourceChirho.kindChirho == "human" &&
            sourceChirho.readerIdChirho == "rdb-chirho" &&
            sourceChirho.gbtIdChirho == "OT/RDB/$codeChirho" &&
            listOf(sourceChirho.packageSha256Chirho, sourceChirho.chapterSha256Chirho, sourceChirho.timingsSha256Chirho).all(SHA_CHIRHO::matches) &&
            sourceChirho.startChirho.isFinite() && sourceChirho.startChirho >= 0 &&
            sourceChirho.endChirho.isFinite() && sourceChirho.endChirho > sourceChirho.startChirho &&
            sourceChirho.endChirho - sourceChirho.startChirho <= 120 &&
            sourceChirho.chapterDurationChirho.isFinite() && sourceChirho.chapterDurationChirho > 0 && sourceChirho.chapterDurationChirho <= 7200 &&
            sourceChirho.endChirho <= sourceChirho.chapterDurationChirho &&
            sourceChirho.attributionChirho == BEERI_ATTRIBUTION_CHIRHO &&
            sourceChirho.licenseChirho == BEERI_LICENSE_CHIRHO &&
            sourceChirho.licenseUrlChirho == BEERI_LICENSE_URL_CHIRHO
    }

    /** A whole verse in Hebrew by Be'eri, as long as its source window, with no AI recipe, IPA or word window. */
    fun validClipChirho(rawChirho: JsonObject, clipChirho: ClipChirho): Boolean {
        val sourceChirho = clipChirho.readingSourceChirho ?: return false
        return validSourceChirho(sourceChirho, clipChirho.lessonIdChirho) &&
            clipChirho.tokenIdChirho == null &&
            clipChirho.languageChirho == "he" &&
            clipChirho.pronunciationChirho == "israeli_hebrew" &&
            clipChirho.voiceNameChirho == BEERI_VOICE_CHIRHO &&
            kotlin.math.abs(clipChirho.durationChirho - (sourceChirho.endChirho - sourceChirho.startChirho)) <= 0.15 &&
            SYNTHESIS_KEYS_CHIRHO.none { it in rawChirho }
    }
}
