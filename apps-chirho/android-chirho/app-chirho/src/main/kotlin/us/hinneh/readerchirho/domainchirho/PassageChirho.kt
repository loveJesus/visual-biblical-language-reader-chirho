// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
package us.hinneh.readerchirho.domainchirho

import java.time.LocalDate

/** A verse selection. Its id is the published lesson id, such as Prov.26.1. */
data class PassageChirho(val bookIdChirho: String, val chapterChirho: Int, val verseChirho: Int) {
    val idChirho: String get() = "$bookIdChirho.$chapterChirho.$verseChirho"

    companion object {
        private val ID_CHIRHO = Regex("([1-3]?[A-Za-z]+)\\.([1-9][0-9]{0,2})\\.([1-9][0-9]{0,2})")

        fun parseChirho(idChirho: String): PassageChirho? {
            val matchChirho = ID_CHIRHO.matchEntire(idChirho) ?: return null
            return PassageChirho(
                matchChirho.groupValues[1],
                matchChirho.groupValues[2].toInt(),
                matchChirho.groupValues[3].toInt(),
            )
        }

        /** Fresh visits read the Proverbs chapter matching the reader's local day of the month. */
        fun dailyChirho(todayChirho: LocalDate = LocalDate.now()): PassageChirho =
            PassageChirho("Prov", todayChirho.dayOfMonth, 1)
    }
}
