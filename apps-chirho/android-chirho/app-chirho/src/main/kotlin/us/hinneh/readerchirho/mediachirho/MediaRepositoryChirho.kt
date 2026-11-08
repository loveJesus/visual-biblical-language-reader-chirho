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
import us.hinneh.readerchirho.remotechirho.sha256HexChirho
import us.hinneh.readerchirho.videochirho.StagedVideosChirho
import us.hinneh.readerchirho.videochirho.VideoRecordChirho
import us.hinneh.readerchirho.videochirho.VideoSelectionChirho

/**
 * Reads a book's small media summary, then verifies only the selected chapter's media index. A
 * published verse video wins; a debug build's staged video fills in only where none is published.
 */
class MediaRepositoryChirho(
    private val remoteChirho: RemoteClientChirho,
    private val clockChirho: () -> Long = System::currentTimeMillis,
    private val workDispatcherChirho: CoroutineDispatcher = Dispatchers.Default,
    private val stagedVideosChirho: StagedVideosChirho? = null,
    /** Reads the debug build's staged-video index; tests pass their own dispatcher so no read outlives a test. */
    private val ioDispatcherChirho: CoroutineDispatcher = Dispatchers.IO,
) {
    private data class TimedSummaryChirho(val summaryChirho: MediaSummaryChirho, val readAtChirho: Long)

    private val summariesChirho = BoundedLruChirho<String, TimedSummaryChirho>(4)
    private val chaptersChirho = BoundedLruChirho<String, MediaChapterFileChirho>(2)

    /** Workflow: spec-chirho/workflows-chirho/native-chirho/verse-video-chirho.md (video selection). */
    suspend fun verseMediaChirho(loadedChirho: LoadedVerseChirho, catalogueChirho: BookCatalogueChirho): VerseMediaChirho {
        val verseIdChirho = loadedChirho.verseChirho.idChirho
        val stagedRecordChirho = stagedVideosChirho?.let { localChirho -> withContext(ioDispatcherChirho) { localChirho.recordChirho(verseIdChirho) } }
        // A video is bound to the scene shown in its place, so a chapter without media has no video either.
        val fileChirho = chapterChirho(loadedChirho.bookChirho, loadedChirho.passageChirho.chapterChirho) ?: return VerseMediaChirho.EMPTY_CHIRHO
        return withContext(workDispatcherChirho) {
            val scenesChirho = MediaSelectionChirho.scenesChirho(fileChirho.scenesChirho, catalogueChirho)
            val sceneChirho = scenesChirho?.get(verseIdChirho)
            val canonicalChirho = sha256HexChirho(loadedChirho.verseChirho.canonicalTextChirho.encodeToByteArray())
            // Only for this verse's exact text, in place of the scene now shown (GPT, DM #3399); published before staged.
            fun forThisVerseChirho(recordChirho: VideoRecordChirho?): VideoRecordChirho? {
                val sceneShaChirho = sceneChirho?.standardChirho?.sha256Chirho ?: return null
                return recordChirho?.takeIf { VideoSelectionChirho.validChirho(it, verseIdChirho, canonicalChirho, sceneShaChirho) }
            }
            val publishedChirho = forThisVerseChirho(VideoSelectionChirho.verseRecordChirho(fileChirho.videosChirho, verseIdChirho))
            val stagedChirho = if (publishedChirho == null) forThisVerseChirho(stagedRecordChirho) else null
            VerseMediaChirho(
                sceneChirho = sceneChirho,
                picturesChirho = MediaSelectionChirho.picturesChirho(fileChirho, loadedChirho.verseChirho, catalogueChirho),
                videoChirho = publishedChirho ?: stagedChirho,
                videoStagedChirho = stagedChirho != null,
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
