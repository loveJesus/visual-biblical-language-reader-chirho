// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
package us.hinneh.readerchirho.contentchirho

import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Assert.fail
import org.junit.Test
import us.hinneh.readerchirho.domainchirho.CuesChirho
import us.hinneh.readerchirho.domainchirho.GroupElementChirho
import us.hinneh.readerchirho.domainchirho.OutlineChirho
import us.hinneh.readerchirho.domainchirho.PaletteChirho
import us.hinneh.readerchirho.domainchirho.SpokenChirho
import us.hinneh.readerchirho.domainchirho.VerseLayoutChirho
import us.hinneh.readerchirho.greekVerseChirho
import us.hinneh.readerchirho.hebrewVerseChirho
import us.hinneh.readerchirho.hebrewWordChirho

class VerseValidationTestChirho {
    private fun refusedChirho(verseChirho: HebrewVerseChirho) {
        try {
            VerseValidationChirho.validateHebrewChirho(verseChirho)
            fail("accepted an invalid verse")
        } catch (expectedChirho: InvalidVerseChirho) {
            // Never displayed.
        }
    }

    private fun refusedChirho(verseChirho: GreekVerseChirho) {
        try {
            VerseValidationChirho.validateGreekChirho(verseChirho)
            fail("accepted an invalid Greek verse")
        } catch (expectedChirho: InvalidVerseChirho) {
            // Never displayed.
        }
    }

    @Test
    fun validVersesPass() {
        VerseValidationChirho.validateHebrewChirho(hebrewVerseChirho())
        VerseValidationChirho.validateGreekChirho(greekVerseChirho())
    }

    @Test
    fun hebrewSourceContractViolationsAreRefused() {
        val verseChirho = hebrewVerseChirho()
        val firstChirho = verseChirho.tokensChirho[0]
        refusedChirho(verseChirho.copy(tokensChirho = listOf(firstChirho.copy(endChirho = 3), verseChirho.tokensChirho[1])))
        refusedChirho(verseChirho.copy(canonicalTextChirho = "כשלג א בקיץ׃"))
        refusedChirho(verseChirho.copy(tokensChirho = listOf(firstChirho.copy(segmentsChirho = listOf("כ", "ָשלג")), verseChirho.tokensChirho[1])))
        refusedChirho(verseChirho.copy(tokensChirho = listOf(firstChirho.copy(lemmaIdChirho = "G3056"), verseChirho.tokensChirho[1])))
        refusedChirho(verseChirho.copy(tokensChirho = listOf(firstChirho.copy(rootStatusChirho = "traditional"), verseChirho.tokensChirho[1])))
        refusedChirho(verseChirho.copy(tokensChirho = listOf(firstChirho.copy(posChirho = "pronoun"), verseChirho.tokensChirho[1])))
        refusedChirho(verseChirho.copy(tokensChirho = listOf(firstChirho, firstChirho.copy(startChirho = 5, endChirho = 9))))
        refusedChirho(verseChirho.copy(sourcesChirho = listOf(verseChirho.sourcesChirho[0].copy(urlChirho = "https://user:pass@example.org/"))))
        refusedChirho(verseChirho.copy(tokensChirho = listOf(firstChirho.copy(verbFormChirho = "qatal"), verseChirho.tokensChirho[1])))
    }

    @Test
    fun greekSourceContractViolationsAreRefused() {
        val verseChirho = greekVerseChirho()
        val articleChirho = verseChirho.tokensChirho[0]
        refusedChirho(verseChirho.copy(tokensChirho = listOf(articleChirho.copy(idChirho = "John.1.2!1"), verseChirho.tokensChirho[1])))
        refusedChirho(verseChirho.copy(canonicalTextChirho = "ὁ καὶ λόγος."))
        refusedChirho(verseChirho.copy(glossOriginChirho = "gbt_approved"))
        refusedChirho(verseChirho.copy(sourcesChirho = verseChirho.sourcesChirho.drop(1)))
        refusedChirho(verseChirho.copy(tokensChirho = listOf(articleChirho.copy(caseChirho = "ablative"), verseChirho.tokensChirho[1])))
    }

    @Test
    fun safeSourceUrlsFollowTheWebsiteRule() {
        assertTrue(VerseValidationChirho.isSafeSourceUrlChirho("https://en.wiktionary.org/wiki/שלג"))
        assertTrue(VerseValidationChirho.isSafeSourceUrlChirho("http://example.org/a b"))
        assertFalse(VerseValidationChirho.isSafeSourceUrlChirho("http://example.org/", httpsOnlyChirho = true))
        assertFalse(VerseValidationChirho.isSafeSourceUrlChirho("javascript:alert(1)"))
        assertFalse(VerseValidationChirho.isSafeSourceUrlChirho("https://user@example.org/"))
        assertFalse(VerseValidationChirho.isSafeSourceUrlChirho("https:///path"))
    }

    @Test
    fun groupsKeepPunctuationAndJoinedWordsWithTheirWords() {
        val groupsChirho = VerseLayoutChirho.groupsChirho(hebrewVerseChirho())
        assertEquals(2, groupsChirho.size)
        val lastChirho = groupsChirho.last().single() as GroupElementChirho.WordElementChirho
        assertEquals("׃", lastChirho.trailingChirho)
        val joinedChirho = hebrewVerseChirho().copy(
            canonicalTextChirho = "לא־נאוה׃",
            tokensChirho = listOf(hebrewWordChirho("20aAa", "לא", 0), hebrewWordChirho("20aAb", "נאוה", 3)),
        )
        val oneGroupChirho = VerseLayoutChirho.groupsChirho(joinedChirho).single()
        assertEquals(3, oneGroupChirho.size)
        assertEquals("־", (oneGroupChirho[1] as GroupElementChirho.JoinerChirho).textChirho)
    }

    @Test
    fun cuesFollowTheWebsitePalette() {
        val cueChirho = CuesChirho.hebrewChirho(hebrewWordChirho("x", "שלג", 0, numberChirho = "plural", stateChirho = "construct"))
        assertEquals(PaletteChirho.MASCULINE_CHIRHO, cueChirho.backgroundChirho)
        assertEquals(PaletteChirho.PLURAL_CHIRHO, cueChirho.underlineChirho)
        assertEquals("ii", cueChirho.centerMarkerChirho)
        val verbChirho = hebrewWordChirho("v", "ילך", 0, posChirho = "verb").copy(
            rawMorphologyChirho = "HC/Vqw3ms", verbStemChirho = "qal", verbFormChirho = "wayyiqtol",
        )
        val verbCueChirho = CuesChirho.hebrewChirho(verbChirho)
        assertEquals("1", verbCueChirho.leftMarkerChirho)
        assertEquals("Y", verbCueChirho.rightMarkerChirho)
        val greekChirho = greekVerseChirho().tokensChirho
        assertEquals(OutlineChirho.ROUND_CHIRHO, CuesChirho.greekChirho(greekChirho[0]).outlineChirho)
        assertEquals("i", CuesChirho.greekChirho(greekChirho[1]).centerMarkerChirho)
    }

    @Test
    fun spokenFormsFollowQereWithoutChangingTheSource() {
        val verseChirho = hebrewVerseChirho()
        val withQereChirho = verseChirho.copy(
            tokensChirho = listOf(verseChirho.tokensChirho[0].copy(qereChirho = listOf(QereChirho("q1", "כשלגים"))), verseChirho.tokensChirho[1]),
        )
        assertEquals("כשלגים בקיץ׃", SpokenChirho.verseChirho(withQereChirho))
        assertEquals("כשלג בקיץ׃", withQereChirho.canonicalTextChirho)
    }
}
