// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
package us.hinneh.readerchirho.remotechirho

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.asExecutor
import kotlinx.coroutines.suspendCancellableCoroutine
import java.io.ByteArrayOutputStream
import java.io.IOException
import java.net.HttpURLConnection
import java.net.URL
import java.util.concurrent.Executor
import kotlin.coroutines.resume
import kotlin.coroutines.resumeWithException

/** Downloads one resource completely, or refuses it. Callers pass only already-trusted URLs. */
fun interface TransportChirho {
    suspend fun getChirho(urlChirho: URL, limitChirho: Int): ByteArray
}

/**
 * Platform HttpURLConnection without redirects, caches or credentials. Cancelling the caller
 * returns immediately: the connection is disconnected off the cancelling thread, and the
 * abandoned read stops at its next chunk or, at the latest, its read timeout. Its bytes are dropped.
 */
class HttpTransportChirho(
    private val executorChirho: Executor = Dispatchers.IO.asExecutor(),
    private val connectTimeoutMsChirho: Int = 15_000,
    private val readTimeoutMsChirho: Int = 20_000,
) : TransportChirho {
    override suspend fun getChirho(urlChirho: URL, limitChirho: Int): ByteArray = suspendCancellableCoroutine { continuationChirho ->
        // Opening a connection object performs no network I/O.
        val connectionChirho = try {
            urlChirho.openConnection() as HttpURLConnection
        } catch (errorChirho: IOException) {
            throw RemoteFailureChirho.NetworkChirho(errorChirho)
        }
        continuationChirho.invokeOnCancellation { executorChirho.execute { connectionChirho.disconnect() } }
        executorChirho.execute {
            // Every outcome resumes the caller: nothing escapes onto the shared worker thread.
            val resultChirho = try {
                Result.success(readChirho(connectionChirho, limitChirho) { continuationChirho.isCancelled })
            } catch (failureChirho: RemoteFailureChirho) {
                Result.failure(failureChirho)
            } catch (errorChirho: Exception) {
                Result.failure(RemoteFailureChirho.NetworkChirho(errorChirho))
            }
            if (continuationChirho.isActive) {
                resultChirho.fold({ continuationChirho.resume(it) }, { continuationChirho.resumeWithException(it) })
            }
        }
    }

    private fun readChirho(connectionChirho: HttpURLConnection, limitChirho: Int, cancelledChirho: () -> Boolean): ByteArray {
        if (cancelledChirho()) throw IOException("Cancelled")
        connectionChirho.instanceFollowRedirects = false
        connectionChirho.useCaches = false
        connectionChirho.connectTimeout = connectTimeoutMsChirho
        connectionChirho.readTimeout = readTimeoutMsChirho
        connectionChirho.setRequestProperty("Accept", "application/json, image/webp, audio/mpeg")
        try {
            val statusChirho = connectionChirho.responseCode
            if (statusChirho != HttpURLConnection.HTTP_OK) throw RemoteFailureChirho.HttpChirho(statusChirho)
            // A compressed transfer reports its compressed length; only plain lengths are compared.
            val declaredChirho = connectionChirho.getHeaderField("Content-Length")?.toLongOrNull()
            if (connectionChirho.contentEncoding == null && declaredChirho != null && declaredChirho > limitChirho) {
                throw RemoteFailureChirho.TooLargeChirho(limitChirho)
            }
            val initialChirho = (declaredChirho ?: BUFFER_CHIRHO.toLong()).coerceIn(1, limitChirho.toLong())
            val outputChirho = ByteArrayOutputStream(initialChirho.toInt())
            connectionChirho.inputStream.use { inputChirho ->
                val bufferChirho = ByteArray(BUFFER_CHIRHO)
                var totalChirho = 0L
                while (!cancelledChirho()) {
                    val countChirho = inputChirho.read(bufferChirho)
                    if (countChirho < 0) return outputChirho.toByteArray()
                    totalChirho += countChirho
                    if (totalChirho > limitChirho) throw RemoteFailureChirho.TooLargeChirho(limitChirho)
                    outputChirho.write(bufferChirho, 0, countChirho)
                }
            }
            throw IOException("Cancelled")
        } catch (failureChirho: Exception) {
            connectionChirho.disconnect()
            throw failureChirho
        }
    }

    private companion object {
        const val BUFFER_CHIRHO = 16 * 1024
    }
}
