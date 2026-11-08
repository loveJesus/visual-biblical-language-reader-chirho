// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: spec-chirho/workflows-chirho/native-chirho/verse-video-chirho.md
package us.hinneh.readerchirho.domainchirho

import us.hinneh.readerchirho.contentchirho.HebrewWordChirho
import us.hinneh.readerchirho.contentchirho.VerseChirho
import us.hinneh.readerchirho.contentchirho.WordChirho

/**
 * Spoken forms are separate from the immutable displayed source; a qere keeps its own words. Ported from the website's
 * pronunciation-chirho.ts and reading-continuation-chirho.ts: a reviewed spoken reading applies to its exact word, and a
 * reviewed written group is read as one word in the verse.
 */
object SpokenChirho {
    /** One spoken unit of a verse: a word, or a whole written group read as one word. */
    data class PlaybackTokenChirho(val wordChirho: WordChirho, val startChirho: Int, val endChirho: Int, val spokenTextChirho: String)

    /** spokenWordChirho: the content qere first, then a matching reviewed reading, then the written word. */
    fun wordChirho(wordChirho: WordChirho, overridesChirho: SpokenOverridesChirho = SpokenOverridesChirho.NONE_CHIRHO): String {
        val qereChirho = (wordChirho as? HebrewWordChirho)?.qereChirho
        if (!qereChirho.isNullOrEmpty()) return qereChirho.joinToString(" ") { it.textChirho }
        return overridesChirho.reviewChirho(wordChirho)?.spokenReadingChirho ?: wordChirho.textChirho
    }

    /** spokenVerseChirho: the canonical verse with each spoken unit in place of its written words. */
    fun verseChirho(verseChirho: VerseChirho, overridesChirho: SpokenOverridesChirho = SpokenOverridesChirho.NONE_CHIRHO): String {
        val builderChirho = StringBuilder()
        var cursorChirho = 0
        for (tokenChirho in playbackTokensChirho(verseChirho, overridesChirho)) {
            builderChirho.append(verseChirho.canonicalTextChirho, cursorChirho, tokenChirho.startChirho)
            builderChirho.append(tokenChirho.spokenTextChirho)
            cursorChirho = tokenChirho.endChirho
        }
        return builderChirho.append(verseChirho.canonicalTextChirho.substring(cursorChirho)).toString()
    }

    /**
     * reviewedPlaybackTokensChirho: a written group is read once, at its last word, spanning from its first word, but only
     * when the whole consecutive group matches word for word and the verse is the exact text it was reviewed for. A
     * changed group never borrows the old reading or drops a written word.
     */
    fun playbackTokensChirho(verseChirho: VerseChirho, overridesChirho: SpokenOverridesChirho): List<PlaybackTokenChirho> {
        val wordsChirho = verseChirho.wordsChirho
        val positionsChirho = wordsChirho.withIndex().associate { (indexChirho, wordChirho) -> wordChirho.idChirho to indexChirho }
        return wordsChirho.flatMap { wordChirho ->
            val reviewChirho = overridesChirho.reviewChirho(wordChirho)
            val groupChirho = reviewChirho?.writtenGroupChirho
            if (reviewChirho == null || groupChirho.isNullOrEmpty()) {
                return@flatMap listOf(
                    PlaybackTokenChirho(wordChirho, wordChirho.startChirho, wordChirho.endChirho, reviewChirho?.spokenReadingChirho ?: sourceWordChirho(wordChirho)),
                )
            }
            val firstChirho = positionsChirho[groupChirho.first().idChirho]
            val wholeChirho = firstChirho != null && reviewChirho.canonicalTextChirho == verseChirho.canonicalTextChirho &&
                groupChirho.withIndex().all { (offsetChirho, memberChirho) ->
                    val actualChirho = wordsChirho.getOrNull(firstChirho + offsetChirho) as? HebrewWordChirho
                    actualChirho != null && SpokenOverridesChirho.matchesChirho(actualChirho, memberChirho)
                }
            when {
                !wholeChirho -> listOf(PlaybackTokenChirho(wordChirho, wordChirho.startChirho, wordChirho.endChirho, sourceWordChirho(wordChirho)))
                wordChirho.idChirho != groupChirho.last().idChirho -> emptyList()
                else -> listOf(PlaybackTokenChirho(wordChirho, wordsChirho[firstChirho].startChirho, wordChirho.endChirho, reviewChirho.spokenReadingChirho))
            }
        }
    }

    /** sourceSpokenWordChirho: the content qere, or the written word. */
    private fun sourceWordChirho(wordChirho: WordChirho): String {
        val qereChirho = (wordChirho as? HebrewWordChirho)?.qereChirho
        return if (!qereChirho.isNullOrEmpty()) qereChirho.joinToString(" ") { it.textChirho } else wordChirho.textChirho
    }
}
