// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
package us.hinneh.readerchirho.contentchirho

import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Assume.assumeTrue
import org.junit.Test
import us.hinneh.readerchirho.FileTransportChirho
import us.hinneh.readerchirho.bundledCatalogueChirho
import us.hinneh.readerchirho.domainchirho.GroupElementChirho
import us.hinneh.readerchirho.domainchirho.PassageChirho
import us.hinneh.readerchirho.domainchirho.SpokenChirho
import us.hinneh.readerchirho.domainchirho.VerseLayoutChirho
import us.hinneh.readerchirho.remotechirho.RemoteClientChirho
import us.hinneh.readerchirho.staticRootChirho
import java.io.File

/**
 * Reads this repository's published static content (read-only) through the same repository,
 * hash checks, decoders, validators and layout the app uses. The three featured books are read
 * completely; every other book's first chapter is read too (-Phinneh.fullCorpusChirho=true: all).
 */
class PublishedCorpusContractTestChirho {
    @Test
    fun everySampledPublishedVerseDecodesValidatesAndLaysOutExactly() = runBlocking {
        val rootChirho = staticRootChirho()
        assumeTrue("repository static tree unavailable", rootChirho != null && File(rootChirho, "content-chirho").isDirectory)
        val fullChirho = System.getProperty("hinneh.fullCorpusChirho") == "true"
        val catalogueChirho = bundledCatalogueChirho()
        val transportChirho = FileTransportChirho(rootChirho!!)
        val repositoryChirho = ContentRepositoryChirho(RemoteClientChirho(transportChirho, null), { ByteArray(0) })
        var versesChirho = 0
        val failuresChirho = mutableListOf<String>()
        for (bookChirho in catalogueChirho.booksChirho) {
            val manifestChirho = repositoryChirho.manifestChirho(bookChirho)
            val chaptersChirho = if (fullChirho || bookChirho.featuredChirho) manifestChirho.chaptersChirho else manifestChirho.chaptersChirho.take(1)
            for (entryChirho in chaptersChirho) {
                for (verseNumberChirho in entryChirho.versesChirho) {
                    val passageChirho = PassageChirho(bookChirho.idChirho, entryChirho.numberChirho, verseNumberChirho)
                    try {
                        val verseChirho = repositoryChirho.verseChirho(bookChirho, passageChirho).verseChirho
                        assertLayoutPreservesSourceChirho(verseChirho)
                        versesChirho++
                    } catch (errorChirho: Exception) {
                        failuresChirho += "${passageChirho.idChirho}: ${errorChirho.message}"
                    }
                }
            }
        }
        println("Published corpus contract: $versesChirho verses verified; failures ${failuresChirho.size}")
        assertTrue(failuresChirho.take(20).joinToString("\n"), failuresChirho.isEmpty())
        assertTrue("expected the three featured books at least", versesChirho > 3_000)
    }

    /** Grouping only splits at source whitespace: every non-space source character survives in order. */
    private fun assertLayoutPreservesSourceChirho(verseChirho: VerseChirho) {
        val shownChirho = StringBuilder()
        for (groupChirho in VerseLayoutChirho.groupsChirho(verseChirho)) {
            for (elementChirho in groupChirho) {
                when (elementChirho) {
                    is GroupElementChirho.JoinerChirho -> shownChirho.append(elementChirho.textChirho)
                    is GroupElementChirho.WordElementChirho -> shownChirho.append(elementChirho.leadingChirho)
                        .append(elementChirho.wordChirho.textChirho).append(elementChirho.trailingChirho)
                }
            }
        }
        val whitespaceChirho = Regex("[$WHITESPACE_CLASS_CHIRHO]")
        assertEquals(verseChirho.idChirho, verseChirho.canonicalTextChirho.replace(whitespaceChirho, ""), shownChirho.toString())
        if (verseChirho is HebrewVerseChirho && verseChirho.tokensChirho.none { !it.qereChirho.isNullOrEmpty() }) {
            assertEquals(verseChirho.canonicalTextChirho, SpokenChirho.verseChirho(verseChirho))
        }
    }
}
