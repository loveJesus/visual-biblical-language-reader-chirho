// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
package us.hinneh.readerchirho.statechirho

import us.hinneh.readerchirho.domainchirho.PassageChirho
import java.time.LocalDate

/**
 * Where a launch opens and when the welcome shows. L.J. confirmed the "today's Proverbs" and autoplay
 * switches and a first-run and new-version welcome, with explicit links winning (GPT, DM #3642). Both
 * switches start on: today's Proverbs by root's choice, autoplay by L.J.'s (GPT, DM #3664).
 */
object LaunchChirho {
    /**
     * An explicit passage (a link or a test) wins, then the verse this activity showed before Android
     * recreated it. Only a fresh launch reaches the reader's choice: today's Proverbs, or with that switch
     * off, the last verse shown, which falls back to today's Proverbs when none is saved.
     */
    fun passageChirho(
        explicitChirho: PassageChirho?,
        restoredChirho: PassageChirho?,
        openTodayChirho: Boolean,
        lastShownChirho: PassageChirho?,
        todayChirho: LocalDate,
    ): PassageChirho = explicitChirho
        ?: restoredChirho
        ?: lastShownChirho?.takeUnless { openTodayChirho }
        ?: PassageChirho.dailyChirho(todayChirho)

    /** The welcome shows on a first run and once after each update; an older version never shows it again. */
    fun welcomeDueChirho(seenVersionChirho: Long?, currentVersionChirho: Long): Boolean =
        seenVersionChirho == null || seenVersionChirho < currentVersionChirho
}
