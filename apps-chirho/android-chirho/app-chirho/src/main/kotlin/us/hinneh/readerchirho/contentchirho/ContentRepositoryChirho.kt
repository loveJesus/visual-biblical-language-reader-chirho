// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
package us.hinneh.readerchirho.contentchirho

import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.coroutines.withContext
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import us.hinneh.readerchirho.domainchirho.PassageChirho
import us.hinneh.readerchirho.remotechirho.BoundedLruChirho
import us.hinneh.readerchirho.remotechirho.RemoteClientChirho
import us.hinneh.readerchirho.remotechirho.RemoteFailureChirho
import us.hinneh.readerchirho.remotechirho.ResourceKindChirho
import us.hinneh.readerchirho.remotechirho.decodeUtf8Chirho

/** One verified verse with the chapter evidence that media and audio must bind to. */
data class LoadedVerseChirho(
    val bookChirho: BookChirho,
    val manifestChirho: BookManifestChirho,
    val entryChirho: ChapterEntryChirho,
    val passageChirho: PassageChirho,
    val verseChirho: VerseChirho,
)

class AbsentVerseChirho : Exception("The selected verse is absent from this source edition.")

@Serializable
private data class ChapterFileChirho(
    @SerialName("book_id_chirho") val bookIdChirho: String,
    @SerialName("chapter_chirho") val chapterChirho: Int,
    @SerialName("verses_chirho") val versesChirho: List<JsonObject>,
)

/**
 * Book list, one book manifest and one hash-bound chapter at a time. Nothing is fetched until a
 * passage is selected, and no corpus is bundled: only the fallback list of book identities.
 */
class ContentRepositoryChirho(
    private val remoteChirho: RemoteClientChirho,
    private val fallbackBooksChirho: () -> ByteArray,
    private val workDispatcherChirho: CoroutineDispatcher = Dispatchers.Default,
) {
    private val catalogueMutexChirho = Mutex()
    private var catalogueChirho: BookCatalogueChirho? = null
    private val manifestsChirho = BoundedLruChirho<String, BookManifestChirho>(8)
    private val chaptersChirho = BoundedLruChirho<String, ChapterFileChirho>(2)
    private val versesChirho = BoundedLruChirho<String, VerseChirho>(64)

    /** The published book list when it validates; otherwise the bundled identities. */
    suspend fun catalogueChirho(): BookCatalogueChirho {
        catalogueMutexChirho.withLock {
            catalogueChirho?.let { return it }
            val liveChirho = try {
                val bytesChirho = remoteChirho.fetchChirho("/library-chirho/books-chirho.json", ResourceKindChirho.BOOTSTRAP_CHIRHO)
                withContext(workDispatcherChirho) { BookCatalogueChirho.decodeChirho(bytesChirho, liveChirho = true) }
            } catch (ignoredChirho: RemoteFailureChirho) {
                null
            }
            val resultChirho = liveChirho ?: withContext(workDispatcherChirho) {
                BookCatalogueChirho.decodeChirho(fallbackBooksChirho(), liveChirho = false)
            }
            // Only a live list is kept for the session; a fallback is retried on the next request.
            if (liveChirho != null) catalogueChirho = resultChirho
            return resultChirho
        }
    }

    suspend fun manifestChirho(bookChirho: BookChirho): BookManifestChirho {
        manifestsChirho.getChirho(bookChirho.idChirho)?.let { return it }
        val bytesChirho = remoteChirho.fetchChirho(bookChirho.manifestPathChirho, ResourceKindChirho.CONTENT_MANIFEST_CHIRHO)
        val manifestChirho = withContext(workDispatcherChirho) { BookManifestChirho.decodeChirho(bytesChirho, bookChirho) }
        manifestsChirho.putChirho(bookChirho.idChirho, manifestChirho)
        return manifestChirho
    }

    suspend fun verseChirho(bookChirho: BookChirho, passageChirho: PassageChirho): LoadedVerseChirho {
        val manifestChirho = manifestChirho(bookChirho)
        val entryChirho = manifestChirho.chaptersChirho.getOrNull(passageChirho.chapterChirho - 1)
            ?: throw AbsentVerseChirho()
        if (passageChirho.verseChirho !in entryChirho.versesChirho) throw AbsentVerseChirho()
        val keyChirho = "${passageChirho.idChirho}@${entryChirho.sha256Chirho}"
        versesChirho.getChirho(keyChirho)?.let {
            return LoadedVerseChirho(bookChirho, manifestChirho, entryChirho, passageChirho, it)
        }
        val chapterChirho = chapterChirho(bookChirho, entryChirho)
        val verseChirho = withContext(workDispatcherChirho) {
            decodeVerseChirho(bookChirho, entryChirho, chapterChirho, passageChirho)
        }
        versesChirho.putChirho(keyChirho, verseChirho)
        return LoadedVerseChirho(bookChirho, manifestChirho, entryChirho, passageChirho, verseChirho)
    }

    private suspend fun chapterChirho(bookChirho: BookChirho, entryChirho: ChapterEntryChirho): ChapterFileChirho {
        val keyChirho = "${bookChirho.idChirho}.${entryChirho.numberChirho}@${entryChirho.sha256Chirho}"
        chaptersChirho.getChirho(keyChirho)?.let { return it }
        val bytesChirho = remoteChirho.fetchVerifiedChirho(
            entryChirho.pathChirho, ResourceKindChirho.CONTENT_CHAPTER_CHIRHO, entryChirho.sha256Chirho,
        )
        val chapterChirho = withContext(workDispatcherChirho) {
            val fileChirho = try {
                ContentJsonChirho.decodeFromString(ChapterFileChirho.serializer(), decodeUtf8Chirho(bytesChirho))
            } catch (errorChirho: IllegalArgumentException) {
                throw RemoteFailureChirho.InvalidChirho("Invalid chapter data: ${errorChirho.message}")
            }
            val numbersChirho = entryChirho.versesChirho
            if (fileChirho.bookIdChirho != bookChirho.idChirho || fileChirho.chapterChirho != entryChirho.numberChirho ||
                fileChirho.versesChirho.size != entryChirho.verseCountChirho
            ) {
                throw RemoteFailureChirho.InvalidChirho("Invalid chapter data.")
            }
            for ((indexChirho, objectChirho) in fileChirho.versesChirho.withIndex()) {
                val idChirho = (objectChirho["id_chirho"] as? JsonPrimitive)?.takeIf { it.isString }?.content
                if (idChirho != "${bookChirho.idChirho}.${entryChirho.numberChirho}.${numbersChirho[indexChirho]}") {
                    throw RemoteFailureChirho.InvalidChirho("Chapter verse identity mismatch.")
                }
            }
            fileChirho
        }
        chaptersChirho.putChirho(keyChirho, chapterChirho)
        return chapterChirho
    }

    private fun decodeVerseChirho(
        bookChirho: BookChirho,
        entryChirho: ChapterEntryChirho,
        chapterChirho: ChapterFileChirho,
        passageChirho: PassageChirho,
    ): VerseChirho {
        val objectChirho = chapterChirho.versesChirho[entryChirho.versesChirho.indexOf(passageChirho.verseChirho)]
        val verseChirho = try {
            if (bookChirho.greekChirho) {
                ContentJsonChirho.decodeFromJsonElement(GreekVerseChirho.serializer(), objectChirho)
                    .also { VerseValidationChirho.validateGreekChirho(it) }
            } else {
                ContentJsonChirho.decodeFromJsonElement(HebrewVerseChirho.serializer(), objectChirho)
                    .also { VerseValidationChirho.validateHebrewChirho(it) }
            }
        } catch (errorChirho: IllegalArgumentException) {
            throw InvalidVerseChirho("Unreadable verse record: ${errorChirho.message}")
        }
        val expectedChirho = "${bookChirho.labelChirho} ${passageChirho.chapterChirho}:${passageChirho.verseChirho}"
        if (verseChirho.referenceChirho != expectedChirho) throw InvalidVerseChirho("Verse reference does not match the selection.")
        return verseChirho
    }
}
