// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
package us.hinneh.readerchirho.uichirho

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test
import us.hinneh.readerchirho.PublishedWorldChirho
import us.hinneh.readerchirho.audiochirho.GreekRenditionChirho.MODERN_ASPIRATES_CHIRHO
import us.hinneh.readerchirho.audiochirho.GreekRenditionChirho.MODERN_CHIRHO
import us.hinneh.readerchirho.sampleVideoChirho

/**
 * The credit of what Play plays is given once, in the verse's Sources fold: a video's own credit, since its
 * sound is the reading, or else a human reading's, exactly as published. An AI reading carries none.
 */
class PlayedCreditTestChirho {
    @Test
    fun aHumanReadingOrAVideoIsCreditedExactlyAndAnAiReadingIsNot() = runBlocking {
        val worldChirho = PublishedWorldChirho.orSkipChirho(Dispatchers.Unconfined)
        suspend fun recordingsChirho(idChirho: String) = worldChirho.audioChirho.recordingsChirho(worldChirho.loadedChirho(idChirho))

        val humanChirho = recordingsChirho("Prov.1.2")
        val sourceChirho = requireNotNull(humanChirho.versesChirho.first().readingSourceChirho)
        assertTrue(sourceChirho.attributionChirho.startsWith("Hebrew reading by Rabbi Dan Be'eri"))
        assertEquals(
            MediaCreditChirho(sourceChirho.attributionChirho, "CC BY-SA 3.0", "https://creativecommons.org/licenses/by-sa/3.0/"),
            playedCreditChirho(null, humanChirho, false, MODERN_ASPIRATES_CHIRHO),
        )

        val videoChirho = sampleVideoChirho("Prov.1.2")
        assertEquals(
            "with a video, its own credit is the one given",
            MediaCreditChirho(videoChirho.attributionChirho, videoChirho.licenseChirho, videoChirho.licenseUrlChirho),
            playedCreditChirho(videoChirho, humanChirho, false, MODERN_ASPIRATES_CHIRHO),
        )

        assertNull(playedCreditChirho(null, recordingsChirho("Matt.1.16"), true, MODERN_CHIRHO))
        assertNull(playedCreditChirho(null, null, false, MODERN_ASPIRATES_CHIRHO))
    }
}
