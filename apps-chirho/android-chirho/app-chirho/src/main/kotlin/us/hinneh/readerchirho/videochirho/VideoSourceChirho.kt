// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: spec-chirho/workflows-chirho/native-chirho/verse-video-chirho.md
package us.hinneh.readerchirho.videochirho

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import us.hinneh.readerchirho.remotechirho.RemoteClientChirho
import us.hinneh.readerchirho.remotechirho.ResourceKindChirho

/**
 * Verse videos staged on a development device before publication (debug builds only; release
 * builds have none). The reader labels a staged video as unpublished, and a published one wins.
 */
interface StagedVideosChirho {
    fun recordChirho(verseIdChirho: String): VideoRecordChirho?

    /** The staged file's bytes, only when their length and SHA-256 match the record. */
    fun bytesChirho(recordChirho: VideoRecordChirho): ByteArray?
}

/** A video's verified bytes: a matching staged copy, otherwise the published file from the trusted origin. */
class VideoSourceChirho(private val remoteChirho: RemoteClientChirho, private val stagedChirho: StagedVideosChirho?) {
    suspend fun bytesChirho(recordChirho: VideoRecordChirho): ByteArray =
        stagedChirho?.let { localChirho -> withContext(Dispatchers.IO) { localChirho.bytesChirho(recordChirho) } }
            ?: remoteChirho.fetchVerifiedChirho(
                recordChirho.assetPathChirho, ResourceKindChirho.VERSE_VIDEO_CHIRHO, recordChirho.sha256Chirho,
                expectedBytesChirho = recordChirho.bytesChirho.toInt(),
            )
}
