// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
package us.hinneh.readerchirho.domainchirho

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotEquals
import org.junit.Assert.assertThrows
import org.junit.Assert.assertTrue
import org.junit.Test
import us.hinneh.readerchirho.contentchirho.VerseValidationChirho
import java.io.File

/** The bundled reading key is the website's exported legend, complete in English and Spanish. */
class ReadingKeyTestChirho {
    private val assetChirho = File("src/main/assets/${ReadingKeyChirho.ASSET_PATH_CHIRHO}")

    @Test
    fun bundledKeyExplainsHebrewAndGreekInBothLanguages() {
        val keyChirho = ReadingKeyChirho.parseChirho(assetChirho.readBytes())
        for (greekChirho in listOf(false, true)) {
            val rowsChirho = keyChirho.rowsChirho(greekChirho)
            assertTrue(rowsChirho.isNotEmpty())
            for (rowChirho in rowsChirho) {
                assertTrue(rowChirho.labelEnChirho, rowChirho.itemsChirho.isNotEmpty() && rowChirho.labelChirho(spanishChirho = true).isNotBlank())
                for (itemChirho in rowChirho.itemsChirho) {
                    assertTrue(itemChirho.idChirho, itemChirho.helpChirho(spanishChirho = false).isNotBlank())
                    assertTrue(itemChirho.idChirho, itemChirho.helpChirho(spanishChirho = true).isNotBlank())
                }
            }
        }
        // Hebrew items link to their grammar pages, and only over plain HTTPS.
        val sourcesChirho = keyChirho.rowsChirho(greekChirho = false).flatMap { it.itemsChirho }.mapNotNull { it.sourceChirho }
        assertTrue(sourcesChirho.isNotEmpty())
        assertTrue(sourcesChirho.all { VerseValidationChirho.isSafeSourceUrlChirho(it, httpsOnlyChirho = true) })
    }

    @Test
    fun spanishFallsBackToEnglishWhereTheWebsiteHasNone() {
        val itemChirho = LegendItemChirho("x-chirho", "", null, "Masculine", "Blue marks it.", "Masculino", "El azul lo marca.", spanishAvailableChirho = false)
        assertEquals("Masculine", itemChirho.labelChirho(spanishChirho = true))
        assertEquals("Blue marks it.", itemChirho.helpChirho(spanishChirho = true))
        assertEquals("El azul lo marca.", itemChirho.copy(spanishAvailableChirho = true).helpChirho(spanishChirho = true))
    }

    @Test
    fun anotherSchemaIsRefused() {
        val originalChirho = assetChirho.readText()
        val changedChirho = originalChirho.replaceFirst("\"schema_version_chirho\": 1", "\"schema_version_chirho\": 2")
        assertNotEquals(originalChirho, changedChirho)
        assertThrows(IllegalArgumentException::class.java) { ReadingKeyChirho.parseChirho(changedChirho.toByteArray()) }
    }
}
