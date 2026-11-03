// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
package us.hinneh.readerchirho.remotechirho

import com.sun.net.httpserver.HttpServer
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.async
import kotlinx.coroutines.delay
import kotlinx.coroutines.runBlocking
import kotlinx.coroutines.withTimeout
import org.junit.After
import org.junit.Assert.assertArrayEquals
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Assert.fail
import org.junit.Before
import org.junit.Rule
import org.junit.Test
import org.junit.rules.TemporaryFolder
import java.net.InetSocketAddress
import java.net.URL
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit

class TrustedOriginTestChirho {
    @Test
    fun publishedShapesResolveOnlyToTheTrustedHttpsOrigin() {
        val urlChirho = TrustedOriginChirho.resolveChirho("/content-chirho/proverbs-chirho/chapter-26-chirho.json", ResourceKindChirho.CONTENT_CHAPTER_CHIRHO)
        assertEquals("https://hinneh.us/content-chirho/proverbs-chirho/chapter-26-chirho.json", urlChirho.toString())
        val shapesChirho = mapOf(
            ResourceKindChirho.BOOTSTRAP_CHIRHO to "/library-chirho/books-chirho.json",
            ResourceKindChirho.MEDIA_SUMMARY_CHIRHO to "/media-chirho/john-chirho/summary-chirho.json",
            ResourceKindChirho.AUDIO_CLIP_CHIRHO to "/audio-chirho/sha256-chirho/${"a".repeat(64)}-chirho.mp3",
            ResourceKindChirho.ARTWORK_CHIRHO to "/assets-chirho/icons-chirho/proverbs-v1-chirho/0000-chirho/cell-07-chirho.webp",
        )
        for ((kindChirho, pathChirho) in shapesChirho) assertTrue(pathChirho, TrustedOriginChirho.isTrustedPathChirho(pathChirho, kindChirho))
    }

    @Test
    fun traversalQueriesOtherKindsAndOtherHostsAreRefused() {
        val refusedChirho = listOf(
            "/content-chirho/../.env" to ResourceKindChirho.CONTENT_CHAPTER_CHIRHO,
            "/content-chirho/proverbs-chirho/chapter-26-chirho.json?x=1" to ResourceKindChirho.CONTENT_CHAPTER_CHIRHO,
            "/content-chirho/proverbs-chirho/chapter-26-chirho.json#a" to ResourceKindChirho.CONTENT_CHAPTER_CHIRHO,
            "//evil.example/content-chirho/x/manifest-chirho.json" to ResourceKindChirho.CONTENT_MANIFEST_CHIRHO,
            "https://evil.example/assets-chirho/a.webp" to ResourceKindChirho.ARTWORK_CHIRHO,
            "/assets-chirho//a.webp" to ResourceKindChirho.ARTWORK_CHIRHO,
            "/assets-chirho/A.webp" to ResourceKindChirho.ARTWORK_CHIRHO,
            "/media-chirho/proverbs-chirho/chapter-26-chirho.json" to ResourceKindChirho.CONTENT_CHAPTER_CHIRHO,
            "/audio-chirho/sha256-chirho/${"a".repeat(63)}-chirho.mp3" to ResourceKindChirho.AUDIO_CLIP_CHIRHO,
            "/content-chirho/proverbs-chirho/chapter-٢٦-chirho.json" to ResourceKindChirho.CONTENT_CHAPTER_CHIRHO,
        )
        for ((pathChirho, kindChirho) in refusedChirho) {
            assertFalse(pathChirho, TrustedOriginChirho.isTrustedPathChirho(pathChirho, kindChirho))
            try {
                TrustedOriginChirho.resolveChirho(pathChirho, kindChirho)
                fail("resolved $pathChirho")
            } catch (expectedChirho: RemoteFailureChirho.UntrustedChirho) {
                // Refused before any request is made.
            }
        }
    }
}

class HttpTransportTestChirho {
    private lateinit var serverChirho: HttpServer
    private val releaseChirho = CountDownLatch(1)

    @Before
    fun startChirho() {
        serverChirho = HttpServer.create(InetSocketAddress("127.0.0.1", 0), 0)
        serverChirho.createContext("/ok") { exchangeChirho ->
            val bodyChirho = "hinneh".encodeToByteArray()
            exchangeChirho.sendResponseHeaders(200, bodyChirho.size.toLong())
            exchangeChirho.responseBody.use { it.write(bodyChirho) }
        }
        serverChirho.createContext("/large") { exchangeChirho ->
            exchangeChirho.sendResponseHeaders(200, 0)
            exchangeChirho.responseBody.use { outputChirho -> repeat(64) { outputChirho.write(ByteArray(1024)) } }
        }
        serverChirho.createContext("/moved") { exchangeChirho ->
            exchangeChirho.responseHeaders.add("Location", "https://evil.example/")
            exchangeChirho.sendResponseHeaders(308, -1)
            exchangeChirho.close()
        }
        serverChirho.createContext("/slow") { exchangeChirho ->
            exchangeChirho.sendResponseHeaders(200, 0)
            exchangeChirho.responseBody.write(ByteArray(10))
            exchangeChirho.responseBody.flush()
            releaseChirho.await(20, TimeUnit.SECONDS)
            exchangeChirho.close()
        }
        serverChirho.executor = java.util.concurrent.Executors.newCachedThreadPool()
        serverChirho.start()
    }

    @After
    fun stopChirho() {
        releaseChirho.countDown()
        serverChirho.stop(0)
    }

    private fun urlChirho(pathChirho: String) = URL("http://127.0.0.1:${serverChirho.address.port}$pathChirho")

    @Test
    fun completeBodiesAreReturnedAndOversizedOnesRefused() = runBlocking {
        val transportChirho = HttpTransportChirho()
        assertArrayEquals("hinneh".encodeToByteArray(), transportChirho.getChirho(urlChirho("/ok"), 1024))
        try {
            transportChirho.getChirho(urlChirho("/large"), 32 * 1024)
            fail("oversized body accepted")
        } catch (expectedChirho: RemoteFailureChirho.TooLargeChirho) {
            // A streamed body past its ceiling is refused, not truncated.
        }
    }

    @Test
    fun redirectsAreNeverFollowed() = runBlocking {
        try {
            HttpTransportChirho().getChirho(urlChirho("/moved"), 1024)
            fail("redirect followed")
        } catch (expectedChirho: RemoteFailureChirho.HttpChirho) {
            assertEquals(308, expectedChirho.statusChirho)
        }
    }

    @Test
    fun cancellingStopsABlockedDownloadPromptly() = runBlocking {
        val transportChirho = HttpTransportChirho()
        val startedChirho = System.nanoTime()
        val requestChirho = async { transportChirho.getChirho(urlChirho("/slow"), 1024 * 1024) }
        delay(300)
        requestChirho.cancel()
        try {
            withTimeout(3_000) { requestChirho.await() }
            fail("cancelled request completed")
        } catch (expectedChirho: CancellationException) {
            val elapsedMsChirho = (System.nanoTime() - startedChirho) / 1_000_000
            assertTrue("took $elapsedMsChirho ms while the server held the body for 20 s", elapsedMsChirho < 3_000)
        }
    }
}

class CachesTestChirho {
    @get:Rule
    val folderChirho = TemporaryFolder()

    @Test
    fun lruEvictsTheLeastRecentlyUsedByWeight() {
        val lruChirho = BoundedLruChirho<String, ByteArray>(10) { it.size.toLong() }
        lruChirho.putChirho("a", ByteArray(4))
        lruChirho.putChirho("b", ByteArray(4))
        lruChirho.getChirho("a")
        lruChirho.putChirho("c", ByteArray(4))
        assertNull(lruChirho.getChirho("b"))
        assertTrue(lruChirho.getChirho("a") != null && lruChirho.getChirho("c") != null)
        lruChirho.putChirho("huge", ByteArray(11))
        assertNull(lruChirho.getChirho("huge"))
        assertTrue(lruChirho.weightChirho() <= 10)
    }

    @Test
    fun diskCacheReVerifiesAndStaysUnderItsCeiling() {
        val directoryChirho = folderChirho.newFolder("verified-chirho")
        val cacheChirho = HashCacheChirho(directoryChirho, 100)
        val bytesChirho = ByteArray(40) { it.toByte() }
        val shaChirho = sha256HexChirho(bytesChirho)
        cacheChirho.putChirho(shaChirho, bytesChirho)
        assertArrayEquals(bytesChirho, cacheChirho.getChirho(shaChirho))
        directoryChirho.resolve(shaChirho).writeBytes(ByteArray(40))
        assertNull("damaged bytes must not be served", cacheChirho.getChirho(shaChirho))
        assertFalse(directoryChirho.resolve(shaChirho).exists())
        repeat(5) { indexChirho ->
            val nextChirho = ByteArray(40) { (it + indexChirho * 7).toByte() }
            cacheChirho.putChirho(sha256HexChirho(nextChirho), nextChirho)
        }
        assertTrue(cacheChirho.totalBytesChirho() <= 100)
        assertNull(cacheChirho.getChirho("../escape"))
    }

    @Test
    fun verifiedFetchRefusesWrongBytesAndNeverCachesThem() = runBlocking {
        val directoryChirho = folderChirho.newFolder("client-chirho")
        val goodChirho = "verified".encodeToByteArray()
        val transportChirho = us.hinneh.readerchirho.FakeTransportChirho()
        val pathChirho = "/content-chirho/proverbs-chirho/chapter-01-chirho.json"
        transportChirho.putChirho(pathChirho, "tampered")
        val clientChirho = RemoteClientChirho(transportChirho, HashCacheChirho(directoryChirho, 1024))
        try {
            clientChirho.fetchVerifiedChirho(pathChirho, ResourceKindChirho.CONTENT_CHAPTER_CHIRHO, sha256HexChirho(goodChirho))
            fail("tampered bytes accepted")
        } catch (expectedChirho: RemoteFailureChirho.IntegrityChirho) {
            assertEquals(0, directoryChirho.listFiles()?.size ?: 0)
        }
        transportChirho.putChirho(pathChirho, goodChirho)
        assertArrayEquals(goodChirho, clientChirho.fetchVerifiedChirho(pathChirho, ResourceKindChirho.CONTENT_CHAPTER_CHIRHO, sha256HexChirho(goodChirho)))
        transportChirho.requestsChirho.clear()
        clientChirho.fetchVerifiedChirho(pathChirho, ResourceKindChirho.CONTENT_CHAPTER_CHIRHO, sha256HexChirho(goodChirho))
        assertTrue("a verified copy is reused without a request", transportChirho.requestsChirho.isEmpty())
    }
}
