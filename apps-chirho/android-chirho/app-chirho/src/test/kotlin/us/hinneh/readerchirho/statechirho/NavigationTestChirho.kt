// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
package us.hinneh.readerchirho.statechirho

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test
import us.hinneh.readerchirho.contentchirho.BookManifestChirho
import us.hinneh.readerchirho.contentchirho.ChapterEntryChirho
import us.hinneh.readerchirho.domainchirho.PassageChirho
import java.time.LocalDate

class NavigationTestChirho {
    private fun entryChirho(numberChirho: Int, countChirho: Int, explicitChirho: List<Int>? = null) = ChapterEntryChirho(
        numberChirho, countChirho, "/content-chirho/acts-chirho/chapter-%02d-chirho.json".format(numberChirho), "a".repeat(64), explicitChirho,
    )

    /** Chapter 2 skips verse 7, as edition gaps such as Acts 24:7 do. */
    private val manifestChirho = BookManifestChirho(
        1, "Acts", "grc",
        listOf(entryChirho(1, 3), entryChirho(2, 8, listOf(1, 2, 3, 4, 5, 6, 8, 9)), entryChirho(3, 2)),
    )

    private fun stepChirho(idChirho: String, forwardChirho: Boolean) =
        neighborChirho(manifestChirho, requireNotNull(PassageChirho.parseChirho(idChirho)), forwardChirho)?.idChirho

    @Test
    fun stepsFollowSourceNumberingAcrossChaptersButNotBooks() {
        assertEquals("Acts.1.2", stepChirho("Acts.1.1", true))
        assertEquals("Acts.2.1", stepChirho("Acts.1.3", true))
        assertEquals("Acts.1.3", stepChirho("Acts.2.1", false))
        assertEquals("Acts.2.8", stepChirho("Acts.2.6", true))
        assertEquals("Acts.2.6", stepChirho("Acts.2.8", false))
        assertEquals("Acts.2.9", stepChirho("Acts.3.1", false))
        assertNull(stepChirho("Acts.1.1", false))
        assertNull(stepChirho("Acts.3.2", true))
        assertNull("an absent verse has no neighbors", stepChirho("Acts.2.7", true))
    }

    @Test
    fun buttonsAndSwipesStepOnlyWhereTheCurrentBookHasANeighbor() {
        fun stateChirho(idChirho: String, withManifestChirho: Boolean = true) = ReaderUiStateChirho(
            passageChirho = requireNotNull(PassageChirho.parseChirho(idChirho)),
            manifestChirho = manifestChirho.takeIf { withManifestChirho },
        )
        assertEquals(listOf(false, true), listOf(false, true).map { stateChirho("Acts.1.1").canStepChirho(it) })
        assertEquals(listOf(true, false), listOf(false, true).map { stateChirho("Acts.3.2").canStepChirho(it) })
        assertEquals(listOf(true, true), listOf(false, true).map { stateChirho("Acts.2.8").canStepChirho(it) })
        // While another book's manifest is still loaded, or none is, neither direction may step.
        assertEquals(listOf(false, false), listOf(false, true).map { stateChirho("Prov.1.2").canStepChirho(it) })
        assertEquals(listOf(false, false), listOf(false, true).map { stateChirho("Acts.1.2", withManifestChirho = false).canStepChirho(it) })
    }

    @Test
    fun passageIdsParseStrictlyAndTheDailyDefaultUsesTheLocalDay() {
        assertEquals(PassageChirho("1Cor", 13, 4), PassageChirho.parseChirho("1Cor.13.4"))
        for (badChirho in listOf("Prov.0.1", "Prov.1", "Prov.1.1.1", "Prov.١.1", " Prov.1.1", "Prov.1000.1", "4Kgs.1.1")) {
            assertNull(badChirho, PassageChirho.parseChirho(badChirho))
        }
        assertEquals(PassageChirho("Prov", 3, 1), PassageChirho.dailyChirho(LocalDate.of(2026, 11, 3)))
        assertEquals(PassageChirho("Prov", 31, 1), PassageChirho.dailyChirho(LocalDate.of(2026, 12, 31)))
    }
}
