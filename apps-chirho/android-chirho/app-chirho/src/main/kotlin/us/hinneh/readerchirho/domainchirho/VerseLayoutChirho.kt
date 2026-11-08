// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
package us.hinneh.readerchirho.domainchirho

import us.hinneh.readerchirho.contentchirho.VerseChirho
import us.hinneh.readerchirho.contentchirho.WHITESPACE_CLASS_CHIRHO
import us.hinneh.readerchirho.contentchirho.WordChirho

/** One element of an unbreakable group: a word with its attached marks, or a joining mark. */
sealed interface GroupElementChirho {
    data class WordElementChirho(
        val wordChirho: WordChirho,
        val leadingChirho: String,
        val trailingChirho: String,
    ) : GroupElementChirho

    data class JoinerChirho(val textChirho: String) : GroupElementChirho
}

/**
 * The verse split at its source whitespace into groups that wrap as a whole. Punctuation without
 * a space stays with its word (sof pasuq, commas), and a maqqef keeps its linked words together.
 * Concatenating every element's text with one space per group boundary uses only source text.
 */
object VerseLayoutChirho {
    private val WHITESPACE_CHIRHO = Regex("[${WHITESPACE_CLASS_CHIRHO}]+")

    fun groupsChirho(verseChirho: VerseChirho): List<List<GroupElementChirho>> {
        val canonicalChirho = verseChirho.canonicalTextChirho
        val groupsChirho = mutableListOf<MutableList<GroupElementChirho>>()
        var currentChirho = mutableListOf<GroupElementChirho>()
        var pendingLeadingChirho = ""
        var cursorChirho = 0
        val wordsChirho = verseChirho.wordsChirho
        for ((indexChirho, wordChirho) in wordsChirho.withIndex()) {
            val gapChirho = canonicalChirho.substring(cursorChirho, wordChirho.startChirho)
            if (indexChirho == 0) {
                // Text before the first word (an opening mark) leads that word.
                pendingLeadingChirho = gapChirho.trim()
            } else if (!WHITESPACE_CHIRHO.containsMatchIn(gapChirho)) {
                // No space: the words are joined, as by a maqqef.
                if (gapChirho.isNotEmpty()) currentChirho.add(GroupElementChirho.JoinerChirho(gapChirho))
            } else {
                val piecesChirho = gapChirho.split(WHITESPACE_CHIRHO)
                attachTrailingChirho(currentChirho, piecesChirho.first())
                groupsChirho.add(currentChirho)
                for (markChirho in piecesChirho.subList(1, piecesChirho.size - 1)) {
                    if (markChirho.isNotEmpty()) groupsChirho.add(mutableListOf(GroupElementChirho.JoinerChirho(markChirho)))
                }
                currentChirho = mutableListOf()
                pendingLeadingChirho = piecesChirho.last()
            }
            currentChirho.add(GroupElementChirho.WordElementChirho(wordChirho, pendingLeadingChirho, ""))
            pendingLeadingChirho = ""
            cursorChirho = wordChirho.endChirho
        }
        attachTrailingChirho(currentChirho, canonicalChirho.substring(cursorChirho).trim())
        if (currentChirho.isNotEmpty()) groupsChirho.add(currentChirho)
        return groupsChirho
    }

    private fun attachTrailingChirho(groupChirho: MutableList<GroupElementChirho>, textChirho: String) {
        if (textChirho.isEmpty()) return
        val lastChirho = groupChirho.lastOrNull() as? GroupElementChirho.WordElementChirho ?: return
        groupChirho[groupChirho.lastIndex] = lastChirho.copy(trailingChirho = lastChirho.trailingChirho + textChirho)
    }
}
