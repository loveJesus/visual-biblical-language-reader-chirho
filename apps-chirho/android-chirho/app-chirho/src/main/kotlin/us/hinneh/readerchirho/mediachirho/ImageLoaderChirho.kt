// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
package us.hinneh.readerchirho.mediachirho

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import us.hinneh.readerchirho.remotechirho.BoundedLruChirho
import us.hinneh.readerchirho.remotechirho.RemoteClientChirho
import us.hinneh.readerchirho.remotechirho.RemoteFailureChirho
import us.hinneh.readerchirho.remotechirho.ResourceKindChirho

/** Decodes only hash-verified WebP artwork, downsampled to its display size, in a bounded cache. */
class ImageLoaderChirho(private val remoteChirho: RemoteClientChirho, maxBytesChirho: Long) {
    private val bitmapsChirho = BoundedLruChirho<String, Bitmap>(maxBytesChirho) { it.allocationByteCount.toLong() }

    fun cachedChirho(sha256Chirho: String, maxEdgeChirho: Int): Bitmap? = bitmapsChirho.getChirho("$sha256Chirho@$maxEdgeChirho")

    suspend fun loadChirho(assetPathChirho: String, sha256Chirho: String, maxEdgeChirho: Int): Bitmap {
        val keyChirho = "$sha256Chirho@$maxEdgeChirho"
        bitmapsChirho.getChirho(keyChirho)?.let { return it }
        val bytesChirho = remoteChirho.fetchVerifiedChirho(assetPathChirho, ResourceKindChirho.ARTWORK_CHIRHO, sha256Chirho)
        val bitmapChirho = withContext(Dispatchers.Default) {
            val boundsChirho = BitmapFactory.Options().apply { inJustDecodeBounds = true }
            BitmapFactory.decodeByteArray(bytesChirho, 0, bytesChirho.size, boundsChirho)
            if (boundsChirho.outWidth !in 1..4096 || boundsChirho.outHeight !in 1..4096) {
                throw RemoteFailureChirho.InvalidChirho("Artwork has unexpected dimensions.")
            }
            var sampleChirho = 1
            while (maxOf(boundsChirho.outWidth, boundsChirho.outHeight) / (sampleChirho * 2) >= maxEdgeChirho) sampleChirho *= 2
            BitmapFactory.decodeByteArray(bytesChirho, 0, bytesChirho.size, BitmapFactory.Options().apply { inSampleSize = sampleChirho })
                ?: throw RemoteFailureChirho.InvalidChirho("Artwork could not be decoded.")
        }
        bitmapsChirho.putChirho(keyChirho, bitmapChirho)
        return bitmapChirho
    }
}
