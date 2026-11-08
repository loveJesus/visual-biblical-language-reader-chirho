// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
package us.hinneh.readerchirho.videochirho

import android.content.Context
import kotlinx.serialization.builtins.ListSerializer
import us.hinneh.readerchirho.contentchirho.ContentJsonChirho
import us.hinneh.readerchirho.remotechirho.sha256HexChirho
import java.io.File

/** The app's own external files folder that development videos are pushed to (adb push), never published. */
const val STAGED_FOLDER_CHIRHO = "staged-videos-chirho"

/** Debug builds: verse videos staged for development in [STAGED_FOLDER_CHIRHO], with an index-chirho.json of records. */
fun Context.stagedVideosChirho(): StagedVideosChirho? = FileStagedVideosChirho { getExternalFilesDir(STAGED_FOLDER_CHIRHO) }

/**
 * Reads the index once, off the main thread on first use, keeping only records whose file has the recorded
 * length. The repository then validates each against its verse's text and scene, exactly as published ones.
 */
class FileStagedVideosChirho(folderLookupChirho: () -> File?) : StagedVideosChirho {
    private val folderChirho: File? by lazy(folderLookupChirho)
    private val recordsChirho: Map<String, VideoRecordChirho> by lazy {
        val indexChirho = folderChirho?.let { File(it, "index-chirho.json") } ?: return@lazy emptyMap()
        if (!indexChirho.isFile || indexChirho.length() > 1_000_000) return@lazy emptyMap()
        val listChirho = try {
            ContentJsonChirho.decodeFromString(ListSerializer(VideoRecordChirho.serializer()), indexChirho.readText())
        } catch (invalidChirho: IllegalArgumentException) {
            return@lazy emptyMap()
        }
        listChirho.filter { fileChirho(it)?.length() == it.bytesChirho }.associateBy { it.lessonIdChirho }
    }

    private fun fileChirho(recordChirho: VideoRecordChirho) = folderChirho?.let { File(it, "${recordChirho.sha256Chirho}-chirho.mp4") }

    override fun recordChirho(verseIdChirho: String): VideoRecordChirho? = recordsChirho[verseIdChirho]

    override fun bytesChirho(recordChirho: VideoRecordChirho): ByteArray? {
        val fileChirho = fileChirho(recordChirho) ?: return null
        if (!fileChirho.isFile || fileChirho.length() != recordChirho.bytesChirho) return null
        return fileChirho.readBytes().takeIf { sha256HexChirho(it) == recordChirho.sha256Chirho }
    }
}
