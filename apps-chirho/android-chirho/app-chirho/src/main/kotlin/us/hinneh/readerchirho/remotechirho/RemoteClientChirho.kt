// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
package us.hinneh.readerchirho.remotechirho

import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

/** Fetches published resources from the trusted origin, verifying every hash-bound byte. */
class RemoteClientChirho(
    private val transportChirho: TransportChirho,
    private val diskChirho: HashCacheChirho?,
    private val workDispatcherChirho: CoroutineDispatcher = Dispatchers.IO,
) {
    /** A fresh copy of a small index whose identity is checked by its caller. */
    suspend fun fetchChirho(pathChirho: String, kindChirho: ResourceKindChirho): ByteArray =
        transportChirho.getChirho(TrustedOriginChirho.resolveChirho(pathChirho, kindChirho), kindChirho.limitChirho)

    /**
     * Bytes named by a published SHA-256: a re-verified disk copy when present, otherwise the
     * network. Anything whose length or hash differs is refused and never cached.
     */
    suspend fun fetchVerifiedChirho(
        pathChirho: String,
        kindChirho: ResourceKindChirho,
        sha256Chirho: String,
        expectedBytesChirho: Int? = null,
    ): ByteArray {
        if (!SHA256_PATTERN_CHIRHO.matches(sha256Chirho)) throw RemoteFailureChirho.InvalidChirho("Invalid SHA-256")
        val urlChirho = TrustedOriginChirho.resolveChirho(pathChirho, kindChirho)
        withContext(workDispatcherChirho) { diskChirho?.getChirho(sha256Chirho) }
            ?.takeIf { expectedBytesChirho == null || it.size == expectedBytesChirho }
            ?.let { return it }
        val bytesChirho = transportChirho.getChirho(urlChirho, kindChirho.limitChirho)
        return withContext(workDispatcherChirho) {
            if (expectedBytesChirho != null && bytesChirho.size != expectedBytesChirho) {
                throw RemoteFailureChirho.IntegrityChirho(pathChirho)
            }
            if (sha256HexChirho(bytesChirho) != sha256Chirho) throw RemoteFailureChirho.IntegrityChirho(pathChirho)
            diskChirho?.putChirho(sha256Chirho, bytesChirho)
            bytesChirho
        }
    }
}
