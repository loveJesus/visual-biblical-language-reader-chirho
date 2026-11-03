// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
package us.hinneh.readerchirho.remotechirho

import java.io.File
import java.io.IOException

/** A thread-safe least-recently-used map bounded by total weight (bytes, entries, …). */
class BoundedLruChirho<K : Any, V : Any>(
    private val maxWeightChirho: Long,
    private val weigherChirho: (V) -> Long = { 1L },
) {
    private val entriesChirho = LinkedHashMap<K, V>(16, 0.75f, true)
    private var weightChirho = 0L

    @Synchronized
    fun getChirho(keyChirho: K): V? = entriesChirho[keyChirho]

    @Synchronized
    fun putChirho(keyChirho: K, valueChirho: V) {
        val sizeChirho = weigherChirho(valueChirho)
        entriesChirho.remove(keyChirho)?.let { weightChirho -= weigherChirho(it) }
        if (sizeChirho > maxWeightChirho) return
        entriesChirho[keyChirho] = valueChirho
        weightChirho += sizeChirho
        val iteratorChirho = entriesChirho.entries.iterator()
        while (weightChirho > maxWeightChirho && iteratorChirho.hasNext()) {
            val eldestChirho = iteratorChirho.next()
            weightChirho -= weigherChirho(eldestChirho.value)
            iteratorChirho.remove()
        }
    }

    @Synchronized
    fun sizeChirho(): Int = entriesChirho.size

    @Synchronized
    fun weightChirho(): Long = weightChirho
}

/**
 * A disk cache of verified bytes named by their SHA-256. A read re-verifies the bytes, so a
 * damaged file is discarded rather than shown or played. Total size stays under a ceiling.
 */
class HashCacheChirho(private val directoryChirho: File, private val maxBytesChirho: Long) {
    @Synchronized
    fun getChirho(sha256Chirho: String): ByteArray? {
        if (!SHA256_PATTERN_CHIRHO.matches(sha256Chirho)) return null
        val fileChirho = File(directoryChirho, sha256Chirho)
        val bytesChirho = try {
            fileChirho.takeIf { it.isFile }?.readBytes()
        } catch (ignoredChirho: IOException) {
            null
        } ?: return null
        if (sha256HexChirho(bytesChirho) != sha256Chirho) {
            fileChirho.delete()
            return null
        }
        fileChirho.setLastModified(System.currentTimeMillis())
        return bytesChirho
    }

    @Synchronized
    fun putChirho(sha256Chirho: String, bytesChirho: ByteArray) {
        if (!SHA256_PATTERN_CHIRHO.matches(sha256Chirho) || bytesChirho.size > maxBytesChirho) return
        try {
            directoryChirho.mkdirs()
            val temporaryChirho = File(directoryChirho, "$sha256Chirho.partial")
            temporaryChirho.writeBytes(bytesChirho)
            if (!temporaryChirho.renameTo(File(directoryChirho, sha256Chirho))) temporaryChirho.delete()
            trimChirho()
        } catch (ignoredChirho: IOException) {
            // A full or unavailable cache only costs a later re-download.
        }
    }

    /** Keeps the newest files until the directory fits its ceiling. */
    private fun trimChirho() {
        val filesChirho = directoryChirho.listFiles()?.filter { it.isFile } ?: return
        var totalChirho = filesChirho.sumOf { it.length() }
        for (fileChirho in filesChirho.sortedBy { it.lastModified() }) {
            if (totalChirho <= maxBytesChirho) break
            totalChirho -= fileChirho.length()
            fileChirho.delete()
        }
    }

    @Synchronized
    fun totalBytesChirho(): Long = directoryChirho.listFiles()?.filter { it.isFile }?.sumOf { it.length() } ?: 0L
}
