// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
package us.hinneh.readerchirho.audiochirho

import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import us.hinneh.readerchirho.contentchirho.ContentJsonChirho
import us.hinneh.readerchirho.contentchirho.LoadedVerseChirho
import us.hinneh.readerchirho.remotechirho.BoundedLruChirho
import us.hinneh.readerchirho.remotechirho.RemoteClientChirho
import us.hinneh.readerchirho.remotechirho.RemoteFailureChirho
import us.hinneh.readerchirho.domainchirho.SpokenOverridesChirho
import us.hinneh.readerchirho.remotechirho.ResourceKindChirho
import us.hinneh.readerchirho.remotechirho.SHA256_PATTERN_CHIRHO
import us.hinneh.readerchirho.remotechirho.decodeUtf8Chirho
import us.hinneh.readerchirho.remotechirho.sha256HexChirho

/** Finds saved recordings for one verse through the global manifest and its listed chapter only. */
class AudioRepositoryChirho(
    private val remoteChirho: RemoteClientChirho,
    private val clockChirho: () -> Long = System::currentTimeMillis,
    private val workDispatcherChirho: CoroutineDispatcher = Dispatchers.Default,
    /** The reviewed spoken readings (assets/teaching-chirho/spoken-overrides-chirho.json), read once on the work dispatcher. */
    spokenOverridesChirho: () -> SpokenOverridesChirho = { SpokenOverridesChirho.NONE_CHIRHO },
) {
    private val overridesChirho by lazy(spokenOverridesChirho)
    private val manifestMutexChirho = Mutex()
    private var manifestChirho: AudioManifestChirho? = null
    private var manifestReadAtChirho = 0L
    private val chaptersChirho = BoundedLruChirho<String, AudioChapterFileChirho>(2)

    suspend fun recordingsChirho(loadedChirho: LoadedVerseChirho): VerseRecordingsChirho {
        val bookChirho = loadedChirho.bookChirho
        val numberChirho = loadedChirho.passageChirho.chapterChirho
        val entryChirho = manifestEntryChirho(bookChirho.idChirho, numberChirho) ?: return VerseRecordingsChirho.EMPTY_CHIRHO
        if (entryChirho.pathChirho != bookChirho.chapterPathChirho("audio-chirho", numberChirho) ||
            !SHA256_PATTERN_CHIRHO.matches(entryChirho.sha256Chirho)
        ) {
            throw RemoteFailureChirho.InvalidChirho("Invalid recording chapter path")
        }
        val keyChirho = "${bookChirho.idChirho}.$numberChirho@${entryChirho.sha256Chirho}"
        val fileChirho = chaptersChirho.getChirho(keyChirho) ?: run {
            val bytesChirho = remoteChirho.fetchVerifiedChirho(entryChirho.pathChirho, ResourceKindChirho.AUDIO_CHAPTER_CHIRHO, entryChirho.sha256Chirho)
            withContext(workDispatcherChirho) { decodeChapterChirho(bytesChirho, loadedChirho) }
                .also { chaptersChirho.putChirho(keyChirho, it) }
        }
        // Recordings made for a different text edition never play for this one.
        if (fileChirho.contentPathChirho != loadedChirho.entryChirho.pathChirho ||
            fileChirho.contentSha256Chirho != loadedChirho.entryChirho.sha256Chirho
        ) {
            return VerseRecordingsChirho.EMPTY_CHIRHO
        }
        return withContext(workDispatcherChirho) {
            val verseChirho = loadedChirho.verseChirho
            val canonicalChirho = sha256HexChirho(verseChirho.canonicalTextChirho.encodeToByteArray())
            fun ownChirho(listChirho: List<JsonObject>) = listChirho.filter {
                (it["lesson_id_chirho"] as? JsonPrimitive)?.content == verseChirho.idChirho
            }
            AudioSelectionChirho.recordingsChirho(
                ownChirho(fileChirho.clipsChirho), verseChirho, bookChirho.greekChirho, canonicalChirho, ::decodeClipChirho,
                readingsChirho = ownChirho(fileChirho.readingsChirho), overridesChirho = overridesChirho,
            )
        }
    }

    private suspend fun manifestEntryChirho(bookIdChirho: String, numberChirho: Int): AudioChapterEntryChirho? {
        val manifestChirho = manifestMutexChirho.withLock {
            val cachedChirho = manifestChirho
            if (cachedChirho != null && clockChirho() - manifestReadAtChirho < MANIFEST_TTL_MS_CHIRHO) {
                cachedChirho
            } else {
                val bytesChirho = remoteChirho.fetchChirho("/audio-chirho/manifest-chirho.json", ResourceKindChirho.AUDIO_MANIFEST_CHIRHO)
                withContext(workDispatcherChirho) { decodeManifestChirho(bytesChirho) }.also {
                    manifestChirho = it
                    manifestReadAtChirho = clockChirho()
                }
            }
        }
        return manifestChirho.booksChirho[bookIdChirho]?.chaptersChirho?.firstOrNull { it.numberChirho == numberChirho }
    }

    companion object {
        private const val MANIFEST_TTL_MS_CHIRHO = 10 * 60 * 1000L

        fun decodeManifestChirho(bytesChirho: ByteArray): AudioManifestChirho {
            val manifestChirho = try {
                ContentJsonChirho.decodeFromString(AudioManifestChirho.serializer(), decodeUtf8Chirho(bytesChirho))
            } catch (errorChirho: IllegalArgumentException) {
                throw RemoteFailureChirho.InvalidChirho("Invalid recording manifest: ${errorChirho.message}")
            }
            if (manifestChirho.schemaVersionChirho != 1) throw RemoteFailureChirho.InvalidChirho("Invalid recording manifest")
            return manifestChirho
        }

        fun decodeChapterChirho(bytesChirho: ByteArray, loadedChirho: LoadedVerseChirho): AudioChapterFileChirho {
            val fileChirho = try {
                ContentJsonChirho.decodeFromString(AudioChapterFileChirho.serializer(), decodeUtf8Chirho(bytesChirho))
            } catch (errorChirho: IllegalArgumentException) {
                throw RemoteFailureChirho.InvalidChirho("Invalid recording chapter: ${errorChirho.message}")
            }
            if (fileChirho.schemaVersionChirho != 1 || fileChirho.bookIdChirho != loadedChirho.bookChirho.idChirho ||
                fileChirho.chapterChirho != loadedChirho.passageChirho.chapterChirho ||
                fileChirho.clipsChirho.size + fileChirho.readingsChirho.size > 2000
            ) {
                throw RemoteFailureChirho.InvalidChirho("Invalid recording chapter")
            }
            return fileChirho
        }

        fun decodeClipChirho(objectChirho: JsonObject): ClipChirho? = try {
            ContentJsonChirho.decodeFromJsonElement(ClipChirho.serializer(), objectChirho)
        } catch (ignoredChirho: IllegalArgumentException) {
            null
        }
    }
}
