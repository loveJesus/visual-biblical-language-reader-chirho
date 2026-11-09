// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
package us.hinneh.readerchirho.statechirho

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test
import us.hinneh.readerchirho.domainchirho.PassageChirho
import java.time.LocalDate

/** Root's launch rules (GPT, DM #3642): explicit links win; today's Proverbs on by default; off resumes the last verse. */
class LaunchTestChirho {
    private val dayChirho = LocalDate.of(2026, 11, 9)
    private val dailyChirho = PassageChirho("Prov", 9, 1)
    private val linkChirho = PassageChirho("John", 3, 16)
    private val restoredChirho = PassageChirho("Gen", 1, 3)
    private val lastChirho = PassageChirho("Matt", 5, 3)

    private fun launchChirho(
        openTodayChirho: Boolean,
        explicitChirho: PassageChirho? = null,
        restoredStateChirho: PassageChirho? = null,
        lastShownChirho: PassageChirho? = lastChirho,
    ) = LaunchChirho.passageChirho(explicitChirho, restoredStateChirho, openTodayChirho, lastShownChirho, dayChirho)

    @Test
    fun anExplicitLinkWinsThenTheVerseAndroidRestores() {
        for (openTodayChirho in listOf(true, false)) {
            assertEquals(linkChirho, launchChirho(openTodayChirho, explicitChirho = linkChirho, restoredStateChirho = restoredChirho))
            assertEquals(restoredChirho, launchChirho(openTodayChirho, restoredStateChirho = restoredChirho))
        }
    }

    @Test
    fun aFreshLaunchOpensTodaysProverbsOrWithThatSwitchOffTheLastVerseShown() {
        assertEquals(dailyChirho, launchChirho(openTodayChirho = true))
        assertEquals(lastChirho, launchChirho(openTodayChirho = false))
        assertEquals("with nothing saved yet, today's Proverbs", dailyChirho, launchChirho(openTodayChirho = false, lastShownChirho = null))
    }

    @Test
    fun theWelcomeShowsOnAFirstRunAndOnceAfterEachUpdate() {
        assertTrue("first run", LaunchChirho.welcomeDueChirho(null, 4))
        assertTrue("an update from 0.1.2", LaunchChirho.welcomeDueChirho(3, 4))
        assertFalse("already seen for this version", LaunchChirho.welcomeDueChirho(4, 4))
        assertFalse("an older version never shows it again", LaunchChirho.welcomeDueChirho(5, 4))
    }
}
