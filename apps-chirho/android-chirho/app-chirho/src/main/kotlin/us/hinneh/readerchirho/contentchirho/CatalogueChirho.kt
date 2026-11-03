// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
package us.hinneh.readerchirho.contentchirho

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import us.hinneh.readerchirho.remotechirho.RemoteFailureChirho
import us.hinneh.readerchirho.remotechirho.SHA256_PATTERN_CHIRHO
import us.hinneh.readerchirho.remotechirho.decodeUtf8Chirho

/** Tolerates additive fields; every required field and identity is still checked explicitly. */
val ContentJsonChirho = Json { ignoreUnknownKeys = true }

@Serializable
data class BookChirho(
    @SerialName("id_chirho") val idChirho: String,
    @SerialName("label_chirho") val labelChirho: String,
    @SerialName("spanish_label_chirho") val spanishLabelChirho: String,
    @SerialName("slug_chirho") val slugChirho: String,
    @SerialName("language_chirho") val languageChirho: String,
    @SerialName("testament_chirho") val testamentChirho: String,
    @SerialName("chapter_count_chirho") val chapterCountChirho: Int,
    @SerialName("featured_chirho") val featuredChirho: Boolean,
) {
    val greekChirho: Boolean get() = languageChirho == "grc"
    val manifestPathChirho: String get() = "/content-chirho/$slugChirho/manifest-chirho.json"
    fun chapterPathChirho(prefixChirho: String, numberChirho: Int): String =
        "/$prefixChirho/$slugChirho/chapter-${numberChirho.toString().padStart(2, '0')}-chirho.json"
}

@Serializable
private data class CatalogueFileChirho(
    @SerialName("schema_version_chirho") val schemaVersionChirho: Int,
    @SerialName("books_chirho") val booksChirho: List<BookChirho>,
)

/** The book identities the reader may request: ids, labels, slugs, languages, chapter counts. */
class BookCatalogueChirho(val booksChirho: List<BookChirho>, val liveChirho: Boolean) {
    private val byIdChirho = booksChirho.associateBy { it.idChirho }
    fun bookChirho(idChirho: String): BookChirho? = byIdChirho[idChirho]

    companion object {
        private val BOOK_ID_CHIRHO = Regex("[1-3]?[A-Za-z]+")
        private val SLUG_CHIRHO = Regex("[a-z0-9]+(?:-[a-z0-9]+)*")

        fun decodeChirho(bytesChirho: ByteArray, liveChirho: Boolean): BookCatalogueChirho {
            val fileChirho = try {
                ContentJsonChirho.decodeFromString(CatalogueFileChirho.serializer(), decodeUtf8Chirho(bytesChirho))
            } catch (errorChirho: IllegalArgumentException) {
                throw RemoteFailureChirho.InvalidChirho("Invalid book list: ${errorChirho.message}")
            }
            val booksChirho = fileChirho.booksChirho
            val validChirho = fileChirho.schemaVersionChirho == 1 &&
                booksChirho.size in 1..100 &&
                booksChirho.map { it.idChirho }.toSet().size == booksChirho.size &&
                booksChirho.map { it.slugChirho }.toSet().size == booksChirho.size &&
                booksChirho.all { bookChirho ->
                    BOOK_ID_CHIRHO.matches(bookChirho.idChirho) &&
                        SLUG_CHIRHO.matches(bookChirho.slugChirho) &&
                        bookChirho.labelChirho.isNotBlank() &&
                        bookChirho.spanishLabelChirho.isNotBlank() &&
                        bookChirho.languageChirho in setOf("he", "grc") &&
                        bookChirho.testamentChirho in setOf("old", "new") &&
                        bookChirho.chapterCountChirho in 1..150
                }
            if (!validChirho) throw RemoteFailureChirho.InvalidChirho("Invalid book list identities")
            return BookCatalogueChirho(booksChirho, liveChirho)
        }
    }
}

@Serializable
data class ChapterEntryChirho(
    @SerialName("number_chirho") val numberChirho: Int,
    @SerialName("verse_count_chirho") val verseCountChirho: Int,
    @SerialName("path_chirho") val pathChirho: String,
    @SerialName("sha256_chirho") val sha256Chirho: String,
    @SerialName("verse_numbers_chirho") val verseNumbersChirho: List<Int>? = null,
) {
    /** Source numbering: explicit numbers when published, otherwise 1..count. Gaps stay gaps. */
    val versesChirho: List<Int> get() = verseNumbersChirho ?: (1..verseCountChirho).toList()
}

@Serializable
data class BookManifestChirho(
    @SerialName("schema_version_chirho") val schemaVersionChirho: Int,
    @SerialName("book_id_chirho") val bookIdChirho: String,
    @SerialName("language_chirho") val languageChirho: String,
    @SerialName("chapters_chirho") val chaptersChirho: List<ChapterEntryChirho>,
) {
    /** Mirrors the website's chaptersChirho(): identity, counts, paths, hashes and numbering. */
    fun validateChirho(bookChirho: BookChirho) {
        if (schemaVersionChirho != 1 || bookIdChirho != bookChirho.idChirho ||
            languageChirho != bookChirho.languageChirho || chaptersChirho.size != bookChirho.chapterCountChirho
        ) {
            throw RemoteFailureChirho.InvalidChirho("Invalid Bible book manifest.")
        }
        for ((indexChirho, entryChirho) in chaptersChirho.withIndex()) {
            val numberChirho = indexChirho + 1
            if (entryChirho.numberChirho != numberChirho ||
                entryChirho.verseCountChirho !in 1..200 ||
                entryChirho.pathChirho != bookChirho.chapterPathChirho("content-chirho", numberChirho) ||
                !SHA256_PATTERN_CHIRHO.matches(entryChirho.sha256Chirho)
            ) {
                throw RemoteFailureChirho.InvalidChirho("Invalid Bible chapter entry.")
            }
            val explicitChirho = entryChirho.verseNumbersChirho ?: continue
            val orderedChirho = explicitChirho.size == entryChirho.verseCountChirho &&
                explicitChirho.withIndex().all { (positionChirho, verseChirho) ->
                    verseChirho in 1..200 && verseChirho > (explicitChirho.getOrNull(positionChirho - 1) ?: 0)
                }
            if (!orderedChirho) throw RemoteFailureChirho.InvalidChirho("Invalid source verse numbering.")
        }
    }

    companion object {
        fun decodeChirho(bytesChirho: ByteArray, bookChirho: BookChirho): BookManifestChirho {
            val manifestChirho = try {
                ContentJsonChirho.decodeFromString(serializer(), decodeUtf8Chirho(bytesChirho))
            } catch (errorChirho: IllegalArgumentException) {
                throw RemoteFailureChirho.InvalidChirho("Invalid Bible book manifest: ${errorChirho.message}")
            }
            manifestChirho.validateChirho(bookChirho)
            return manifestChirho
        }
    }
}
