// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
package us.hinneh.readerchirho.audiochirho

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Test

/** GPT, DM #3386: navigation or another play cancels the current one, and a late callback cannot stop a newer play. */
class PlaybackSlotTestChirho {
    @Test
    fun aLateReportFromAnEarlierPlayNeverChangesTheNewerPlay() {
        val slotChirho = PlaybackSlotChirho()
        val firstChirho = slotChirho.beginChirho("verse:Prov.1.1")
        val secondChirho = slotChirho.beginChirho("verse:Prov.1.2")
        slotChirho.reportChirho(firstChirho, PlaybackChirho.FailedChirho("verse:Prov.1.1"))
        slotChirho.reportChirho(firstChirho, PlaybackChirho.IdleChirho)
        assertEquals(PlaybackChirho.LoadingChirho("verse:Prov.1.2"), slotChirho.playbackChirho.value)
        slotChirho.reportChirho(secondChirho, PlaybackChirho.PlayingChirho("verse:Prov.1.2"))
        assertEquals(PlaybackChirho.PlayingChirho("verse:Prov.1.2"), slotChirho.playbackChirho.value)
    }

    /** GPT, DM #3498: A, then B, then A again for one verse. The key repeats; the generation never does. */
    @Test
    fun aLateReportFromAnEarlierPlayOfTheSameVerseNeverChangesItsReplay() {
        val slotChirho = PlaybackSlotChirho()
        val firstChirho = slotChirho.beginChirho("verse:Matt.1.16")
        slotChirho.stopChirho()
        val secondChirho = slotChirho.beginChirho("verse:Matt.1.16")
        slotChirho.stopChirho()
        val thirdChirho = slotChirho.beginChirho("verse:Matt.1.16")
        slotChirho.reportChirho(thirdChirho, PlaybackChirho.PlayingChirho("verse:Matt.1.16"))
        slotChirho.reportChirho(firstChirho, PlaybackChirho.FailedChirho("verse:Matt.1.16"))
        slotChirho.reportChirho(secondChirho, PlaybackChirho.IdleChirho)
        assertEquals(PlaybackChirho.PlayingChirho("verse:Matt.1.16"), slotChirho.playbackChirho.value)
    }

    @Test
    fun afterStopNothingFromTheStoppedPlayCanRestartIt() {
        val slotChirho = PlaybackSlotChirho()
        val playChirho = slotChirho.beginChirho("word:Prov.1.1:x")
        slotChirho.stopChirho()
        assertFalse(slotChirho.isCurrentChirho(playChirho))
        slotChirho.reportChirho(playChirho, PlaybackChirho.PlayingChirho("word:Prov.1.1:x"))
        slotChirho.reportChirho(playChirho, PlaybackChirho.FailedChirho("word:Prov.1.1:x"))
        assertEquals(PlaybackChirho.IdleChirho, slotChirho.playbackChirho.value)
    }
}
