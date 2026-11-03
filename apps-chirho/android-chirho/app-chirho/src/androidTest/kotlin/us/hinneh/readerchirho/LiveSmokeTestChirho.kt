// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
package us.hinneh.readerchirho

import android.media.MediaExtractor
import android.media.MediaFormat
import android.util.Log
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Assert.fail
import org.junit.Test
import org.junit.runner.RunWith
import us.hinneh.readerchirho.audiochirho.AudioSelectionChirho
import us.hinneh.readerchirho.audiochirho.GreekRenditionChirho
import us.hinneh.readerchirho.contentchirho.LoadedVerseChirho
import us.hinneh.readerchirho.domainchirho.PassageChirho
import us.hinneh.readerchirho.remotechirho.HttpTransportChirho
import us.hinneh.readerchirho.remotechirho.RemoteFailureChirho
import us.hinneh.readerchirho.remotechirho.ResourceKindChirho
import us.hinneh.readerchirho.remotechirho.TrustedOriginChirho
import us.hinneh.readerchirho.remotechirho.sha256HexChirho
import us.hinneh.readerchirho.statechirho.HinnehApplicationChirho
import java.io.File

/**
 * Runs the app's own services on the device against https://hinneh.us/: the live book list,
 * hash-bound chapters, Android's ICU regular expressions, verified artwork decoding and MP3s.
 */
@RunWith(AndroidJUnit4::class)
class LiveSmokeTestChirho {
    private val contextChirho = InstrumentationRegistry.getInstrumentation().targetContext
    private val graphChirho = (contextChirho.applicationContext as HinnehApplicationChirho).graphChirho

    private suspend fun loadChirho(idChirho: String): LoadedVerseChirho {
        val passageChirho = requireNotNull(PassageChirho.parseChirho(idChirho))
        val catalogueChirho = graphChirho.contentChirho.catalogueChirho()
        return graphChirho.contentChirho.verseChirho(requireNotNull(catalogueChirho.bookChirho(passageChirho.bookIdChirho)), passageChirho)
    }

    @Test
    fun theLiveBookListIsUsed() = runBlocking<Unit> {
        val kindChirho = ResourceKindChirho.BOOTSTRAP_CHIRHO
        val bytesChirho = HttpTransportChirho().getChirho(
            TrustedOriginChirho.resolveChirho("/library-chirho/books-chirho.json", kindChirho), kindChirho.limitChirho,
        )
        val catalogueChirho = graphChirho.contentChirho.catalogueChirho()
        assertTrue("the published list, not the bundled fallback", catalogueChirho.liveChirho)
        assertEquals(66, catalogueChirho.booksChirho.size)
        Log.i(TAG_CHIRHO, "bootstrap bytes=${bytesChirho.size} sha256=${sha256HexChirho(bytesChirho)} books=${catalogueChirho.booksChirho.size}")
    }

    @Test
    fun hebrewAndGreekVersesVerifyWithTheirPicturesAndRecordings() = runBlocking<Unit> {
        for (idChirho in listOf("Prov.26.1", "John.1.1", "Ps.119.176")) {
            val loadedChirho = loadChirho(idChirho)
            val catalogueChirho = graphChirho.contentChirho.catalogueChirho()
            val mediaChirho = graphChirho.mediaChirho.verseMediaChirho(loadedChirho, catalogueChirho)
            val recordingsChirho = graphChirho.audioChirho.recordingsChirho(loadedChirho)
            val wordsChirho = loadedChirho.verseChirho.wordsChirho
            Log.i(
                TAG_CHIRHO,
                "$idChirho words=${wordsChirho.size} scene=${mediaChirho.sceneChirho != null} pictures=${mediaChirho.picturesChirho.size} " +
                    "wordClips=${recordingsChirho.wordsChirho.size} verseClips=${recordingsChirho.versesChirho.size}",
            )
            assertTrue(wordsChirho.isNotEmpty())
            if (idChirho != "Ps.119.176") {
                assertTrue("$idChirho has its scene", mediaChirho.sceneChirho != null)
                assertTrue("$idChirho has published word recordings", recordingsChirho.wordsChirho.isNotEmpty())
            }
        }
    }

    @Test
    fun verifiedArtworkAndRecordingsDecodeOnTheDevice() = runBlocking<Unit> {
        val loadedChirho = loadChirho("Prov.26.1")
        val mediaChirho = graphChirho.mediaChirho.verseMediaChirho(loadedChirho, graphChirho.contentChirho.catalogueChirho())
        val sceneChirho = requireNotNull(mediaChirho.sceneChirho).standardChirho
        val bitmapChirho = graphChirho.imagesChirho.loadChirho(sceneChirho.assetPathChirho, sceneChirho.sha256Chirho, 1600)
        assertTrue(bitmapChirho.width > 0 && bitmapChirho.height > 0)
        val recordingsChirho = graphChirho.audioChirho.recordingsChirho(loadedChirho)
        val clipChirho = requireNotNull(AudioSelectionChirho.bestChirho(recordingsChirho.versesChirho, false, GreekRenditionChirho.MODERN_ASPIRATES_CHIRHO))
        val bytesChirho = graphChirho.remoteChirho.fetchVerifiedChirho(
            clipChirho.assetPathChirho, ResourceKindChirho.AUDIO_CLIP_CHIRHO, clipChirho.sha256Chirho, clipChirho.bytesChirho.toInt(),
        )
        assertEquals(clipChirho.sha256Chirho, sha256HexChirho(bytesChirho))
        val fileChirho = File.createTempFile("clip-chirho", ".mp3", contextChirho.cacheDir)
        try {
            fileChirho.writeBytes(bytesChirho)
            val extractorChirho = MediaExtractor()
            try {
                extractorChirho.setDataSource(fileChirho.path)
                val formatChirho = extractorChirho.getTrackFormat(0)
                assertEquals("audio/mpeg", formatChirho.getString(MediaFormat.KEY_MIME))
                assertTrue(formatChirho.getLong(MediaFormat.KEY_DURATION) > 0)
                Log.i(TAG_CHIRHO, "scene ${bitmapChirho.width}x${bitmapChirho.height}; verse clip ${bytesChirho.size} bytes, ${formatChirho.getLong(MediaFormat.KEY_DURATION)} us")
            } finally {
                extractorChirho.release()
            }
        } finally {
            fileChirho.delete()
        }
    }

    @Test
    fun theAspiratedReadingRuleHoldsOnTheDevice() = runBlocking<Unit> {
        val loadedChirho = loadChirho("John.1.1")
        val recordingsChirho = graphChirho.audioChirho.recordingsChirho(loadedChirho)
        val articleChirho = loadedChirho.verseChirho.wordsChirho.first { it.textChirho == "ὁ" }
        val clipsChirho = recordingsChirho.wordsChirho[articleChirho.idChirho]
        assertNull(AudioSelectionChirho.bestChirho(clipsChirho, true, GreekRenditionChirho.MODERN_ASPIRATES_CHIRHO))
        assertNotNull(AudioSelectionChirho.bestChirho(clipsChirho, true, GreekRenditionChirho.MODERN_CHIRHO))
    }

    @Test
    fun untrustedPathsAreRefusedBeforeAnyRequest() {
        for (pathChirho in listOf("/content-chirho/../.env", "https://example.org/a.webp", "/assets-chirho/a.webp?x=1")) {
            try {
                TrustedOriginChirho.resolveChirho(pathChirho, ResourceKindChirho.ARTWORK_CHIRHO)
                fail("resolved $pathChirho")
            } catch (expectedChirho: RemoteFailureChirho.UntrustedChirho) {
                // Refused locally.
            }
        }
    }

    private companion object {
        const val TAG_CHIRHO = "HinnehSmokeChirho"
    }
}
