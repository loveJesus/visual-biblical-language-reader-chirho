// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
package us.hinneh.readerchirho.remotechirho

import java.security.MessageDigest

/** Why a remote resource was refused. Each refusal keeps already verified text on screen. */
sealed class RemoteFailureChirho(messageChirho: String, causeChirho: Throwable? = null) :
    Exception(messageChirho, causeChirho) {
    class UntrustedChirho(pathChirho: String) : RemoteFailureChirho("Untrusted resource path: $pathChirho")
    class HttpChirho(val statusChirho: Int) : RemoteFailureChirho("Unexpected HTTP status $statusChirho")
    class TooLargeChirho(limitChirho: Int) : RemoteFailureChirho("Resource exceeds $limitChirho bytes")
    class IntegrityChirho(pathChirho: String) : RemoteFailureChirho("Integrity check failed: $pathChirho")
    class InvalidChirho(reasonChirho: String) : RemoteFailureChirho(reasonChirho)
    class NetworkChirho(causeChirho: Throwable) : RemoteFailureChirho("Network unavailable", causeChirho)
}

private val HEX_CHIRHO = "0123456789abcdef".toCharArray()

fun sha256HexChirho(bytesChirho: ByteArray): String {
    val digestChirho = MessageDigest.getInstance("SHA-256").digest(bytesChirho)
    val outChirho = CharArray(digestChirho.size * 2)
    for ((indexChirho, byteChirho) in digestChirho.withIndex()) {
        val valueChirho = byteChirho.toInt() and 0xff
        outChirho[indexChirho * 2] = HEX_CHIRHO[valueChirho ushr 4]
        outChirho[indexChirho * 2 + 1] = HEX_CHIRHO[valueChirho and 0x0f]
    }
    return String(outChirho)
}

val SHA256_PATTERN_CHIRHO = Regex("[a-f0-9]{64}")

/** Fatal UTF-8 decoding, as the website's TextDecoder: invalid bytes are a refusal, not U+FFFD. */
fun decodeUtf8Chirho(bytesChirho: ByteArray): String =
    try {
        bytesChirho.decodeToString(throwOnInvalidSequence = true)
    } catch (errorChirho: CharacterCodingException) {
        throw RemoteFailureChirho.InvalidChirho("Resource is not valid UTF-8: ${errorChirho.message}")
    }
