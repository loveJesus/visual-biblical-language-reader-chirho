// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
package us.hinneh.readerchirho.audiochirho

import android.media.MediaDataSource

/** Verified media bytes played from memory (recordings and verse videos); nothing is written to disk. */
internal class BytesSourceChirho(private val bytesChirho: ByteArray) : MediaDataSource() {
    override fun readAt(positionChirho: Long, bufferChirho: ByteArray, offsetChirho: Int, sizeChirho: Int): Int {
        if (positionChirho >= bytesChirho.size) return -1
        val countChirho = minOf(sizeChirho.toLong(), bytesChirho.size - positionChirho).toInt()
        System.arraycopy(bytesChirho, positionChirho.toInt(), bufferChirho, offsetChirho, countChirho)
        return countChirho
    }

    override fun getSize(): Long = bytesChirho.size.toLong()
    override fun close() = Unit
}
