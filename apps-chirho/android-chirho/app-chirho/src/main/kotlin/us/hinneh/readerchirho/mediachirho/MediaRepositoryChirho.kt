// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
package us.hinneh.readerchirho.mediachirho

import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import us.hinneh.readerchirho.contentchirho.BookCatalogueChirho
import us.hinneh.readerchirho.contentchirho.BookChirho
import us.hinneh.readerchirho.contentchirho.ContentJsonChirho
import us.hinneh.readerchirho.contentchirho.LoadedVerseChirho
import us.hinneh.readerchirho.remotechirho.BoundedLruChirho
import us.hinneh.readerchirho.remotechirho.RemoteClientChirho
import us.hinneh.readerchirho.remotechirho.RemoteFailureChirho
import us.hinneh.readerchirho.remotechirho.ResourceKindChirho
import us.hinneh.readerchirho.remotechirho.SHA256_PATTERN_CHIRHO
import us.hinneh.readerchirho.remotechirho.decodeUtf8Chirho

/** Reads a book's small media summary, then verifies only the selected chapter's media index. */
class MediaRepositoryChirho(
    private val remoteChirho: RemoteClientChirho,
    private val clockChirho: () -> Long = System::currentTimeMillis,
    private val workDispatcherChirho: CoroutineDispatcher = Dispatchers.Default,
) {
    private data class TimedSummaryChirho(val summaryChirho: MediaSummaryChirho, val readAtChirho: Long)

    private val summariesChirho = BoundedLruChirho<String, TimedSummaryChirho>(4)
    private val chaptersChirho = BoundedLruChirho<String, MediaChapterFileChirho>(2)

    suspend fun verseMediaChirho(loadedChirho: LoadedVerseChirho, catalogueChirho: BookCatalogueChirho): VerseMediaChirho {
        val fileChirho = chapterChirho(loadedChirho.bookChirho, loadedChirho.passageChirho.chapterChirho)
            ?: return VerseMediaChirho.EMPTY_CHIRHO
        return withContext(workDispatcherChirho) {
            val scenesChirho = MediaSelectionChirho.scenesChirho(fileChirho.scenesChirho, catalogueChirho)
            VerseMediaChirho(
                sceneChirho = scenesChirho?.get(loadedChirho.verseChirho.idChirho),
                picturesChirho = MediaSelectionChirho.picturesChirho(fileChirho, loadedChirho.verseChirho, catalogueChirho),
            )
        }
    }

    /** null when this chapter has no media; a refusal when its evidence does not verify. */
    private suspend fun chapterChirho(bookChirho: BookChirho, numberChirho: Int): MediaChapterFileChirho? {
        repeat(2) { attemptChirho ->
            val summaryChirho = summaryChirho(bookChirho, refreshChirho = attemptChirho > 0)
            val entryChirho = summaryChirho.chaptersChirho.firstOrNull { it.numberChirho == numberChirho } ?: return null
            val keyChirho = "${bookChirho.idChirho}.$numberChirho@${entryChirho.sha256Chirho}"
            chaptersChirho.getChirho(keyChirho)?.let { return it }
            val bytesChirho = try {
                remoteChirho.fetchVerifiedChirho(entryChirho.pathChirho, ResourceKindChirho.MEDIA_CHAPTER_CHIRHO, entryChirho.sha256Chirho)
            } catch (integrityChirho: RemoteFailureChirho.IntegrityChirho) {
                // A publication may be in progress: re-read the summary once, then refuse.
                if (attemptChirho == 0) return@repeat else throw integrityChirho
            }
            val fileChirho = withContext(workDispatcherChirho) { decodeChapterChirho(bytesChirho, bookChirho, numberChirho, entryChirho) }
            chaptersChirho.putChirho(keyChirho, fileChirho)
            return fileChirho
        }
        throw RemoteFailureChirho.InvalidChirho("Media is unavailable.")
    }

    private suspend fun summaryChirho(bookChirho: BookChirho, refreshChirho: Boolean): MediaSummaryChirho {
        val cachedChirho = summariesChirho.getChirho(bookChirho.idChirho)
        if (!refreshChirho && cachedChirho != null && clockChirho() - cachedChirho.readAtChirho < SUMMARY_TTL_MS_CHIRHO) {
            return cachedChirho.summaryChirho
        }
        val bytesChirho = remoteChirho.fetchChirho(
            "/media-chirho/${bookChirho.slugChirho}/summary-chirho.json", ResourceKindChirho.MEDIA_SUMMARY_CHIRHO,
        )
        val summaryChirho = withContext(workDispatcherChirho) { decodeSummaryChirho(bytesChirho, bookChirho) }
        summariesChirho.putChirho(bookChirho.idChirho, TimedSummaryChirho(summaryChirho, clockChirho()))
        return summaryChirho
    }

    companion object {
        private const val SUMMARY_TTL_MS_CHIRHO = 10 * 60 * 1000L

        fun decodeSummaryChirho(bytesChirho: ByteArray, bookChirho: BookChirho): MediaSummaryChirho {
            val summaryChirho = try {
                ContentJsonChirho.decodeFromString(MediaSummaryChirho.serializer(), decodeUtf8Chirho(bytesChirho))
            } catch (errorChirho: IllegalArgumentException) {
                throw RemoteFailureChirho.InvalidChirho("Invalid media summary: ${errorChirho.message}")
            }
            val entriesChirho = summaryChirho.chaptersChirho
            var previousChirho = 0
            val entriesValidChirho = entriesChirho.all { entryChirho ->
                val okChirho = entryChirho.numberChirho > previousChirho &&
                    entryChirho.numberChirho <= bookChirho.chapterCountChirho &&
                    entryChirho.pathChirho == bookChirho.chapterPathChirho("media-chirho", entryChirho.numberChirho) &&
                    SHA256_PATTERN_CHIRHO.matches(entryChirho.sha256Chirho) &&
                    entryChirho.sceneCountChirho >= 0 && entryChirho.iconCountChirho >= 0 &&
                    (entryChirho.lemmaIconCountChirho == null || entryChirho.lemmaIconCountChirho in 0..4096)
                previousChirho = entryChirho.numberChirho
                okChirho
            }
            if (summaryChirho.schemaVersionChirho != 1 || summaryChirho.bookIdChirho != bookChirho.idChirho ||
                entriesChirho.size > bookChirho.chapterCountChirho || !entriesValidChirho ||
                summaryChirho.sceneCountChirho < 0 || summaryChirho.iconCountChirho < 0 ||
                entriesChirho.sumOf { it.sceneCountChirho.toLong() } != summaryChirho.sceneCountChirho ||
                entriesChirho.sumOf { it.iconCountChirho.toLong() } != summaryChirho.iconCountChirho
            ) {
                throw RemoteFailureChirho.InvalidChirho("Invalid media summary.")
            }
            return summaryChirho
        }

        fun decodeChapterChirho(
            bytesChirho: ByteArray,
            bookChirho: BookChirho,
            numberChirho: Int,
            entryChirho: MediaEntryChirho,
        ): MediaChapterFileChirho {
            val fileChirho = try {
                ContentJsonChirho.decodeFromString(MediaChapterFileChirho.serializer(), decodeUtf8Chirho(bytesChirho))
            } catch (errorChirho: IllegalArgumentException) {
                throw RemoteFailureChirho.InvalidChirho("Invalid media chapter: ${errorChirho.message}")
            }
            if (fileChirho.schemaVersionChirho != 1 || fileChirho.bookIdChirho != bookChirho.idChirho ||
                fileChirho.chapterChirho != numberChirho ||
                fileChirho.scenesChirho.size != entryChirho.sceneCountChirho ||
                fileChirho.iconsChirho.size != entryChirho.iconCountChirho ||
                (fileChirho.lemmaIconsChirho?.size ?: 0) != (entryChirho.lemmaIconCountChirho ?: 0) ||
                !MediaSelectionChirho.recordsBelongChirho(fileChirho)
            ) {
                throw RemoteFailureChirho.InvalidChirho("Media record belongs to another chapter or count differs.")
            }
            return fileChirho
        }
    }
}
