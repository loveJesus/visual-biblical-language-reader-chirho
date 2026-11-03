// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
package us.hinneh.readerchirho.domainchirho

import us.hinneh.readerchirho.contentchirho.GreekWordChirho
import us.hinneh.readerchirho.contentchirho.HebrewWordChirho
import us.hinneh.readerchirho.contentchirho.VerseValidationChirho

/** The website's reading palette (cues-chirho.ts), as ARGB. */
object PaletteChirho {
    const val MASCULINE_CHIRHO = 0xFFDFF0FFL
    const val FEMININE_CHIRHO = 0xFFFFE4EDL
    const val NEUTER_CHIRHO = 0xFFECEFE9L
    const val PLURAL_CHIRHO = 0xFFE9C92DL
    const val DUAL_CHIRHO = 0xFF36A36AL
    const val NOUN_CHIRHO = 0xFF18847DL
    const val VERB_CHIRHO = 0xFF8152B1L
    const val ADJECTIVE_CHIRHO = 0xFFC57820L
    const val PARTICLE_CHIRHO = 0xFF7C8589L
    const val PATTERN_CHIRHO = 0xFFDD7B24L
}

enum class PatternChirho { NONE_CHIRHO, DOTTED_CHIRHO, SOLID_CHIRHO }

/** Sticker outline shape: square, dashed (uncategorized), round (article), dashed round (pronoun). */
enum class OutlineChirho { SQUARE_CHIRHO, DASHED_CHIRHO, ROUND_CHIRHO, DASHED_ROUND_CHIRHO }

/** Everything a word box shows besides the word itself. Colors are ARGB; null means none. */
data class WordCueChirho(
    val backgroundChirho: Long?,
    val underlineChirho: Long?,
    val outlineColorChirho: Long,
    val outlineChirho: OutlineChirho,
    val leftMarkerChirho: String,
    val centerMarkerChirho: String,
    val rightMarkerChirho: String,
    val patternChirho: PatternChirho,
    val categoryChirho: String,
)

// Workflow: validated verse → independent cues. No cue is inferred from spelling or a root.
object CuesChirho {
    private val VERB_CODE_CHIRHO = Regex("[1-7][PIMACB]")

    fun hebrewChirho(wordChirho: HebrewWordChirho): WordCueChirho {
        val noteChirho = wordChirho.formNoteChirho
        val patternChirho = when {
            noteChirho == null || noteChirho.textChirho.isBlank() -> PatternChirho.NONE_CHIRHO
            !VerseValidationChirho.isSafeSourceUrlChirho(noteChirho.sourceChirho) -> PatternChirho.NONE_CHIRHO
            noteChirho.kindChirho == "predictable_weak" -> PatternChirho.DOTTED_CHIRHO
            noteChirho.kindChirho in setOf("exceptional", "suppletive") -> PatternChirho.SOLID_CHIRHO
            else -> PatternChirho.NONE_CHIRHO
        }
        val verbChirho = wordChirho.posChirho == "verb"
        val codeChirho = wordChirho.verbCodeChirho?.takeIf { verbChirho && VERB_CODE_CHIRHO.matches(it) }
        val stemChirho = if (verbChirho) {
            VerbFormsChirho.stemNumberChirho(wordChirho.verbStemChirho).ifEmpty { codeChirho?.substring(0, 1) ?: "" }
        } else {
            ""
        }
        val formChirho = if (verbChirho) {
            VerbFormsChirho.formMarkerChirho(wordChirho.verbFormChirho, wordChirho.verbConstructionChirho)
                .ifEmpty { codeChirho?.substring(1, 2) ?: "" }
        } else {
            ""
        }
        val stateChirho = when {
            wordChirho.posChirho != "noun" -> ""
            wordChirho.stateChirho == "absolute" -> "i"
            wordChirho.stateChirho == "construct" -> "ii"
            else -> ""
        }
        return WordCueChirho(
            backgroundChirho = genderColorChirho(wordChirho.genderChirho, neuterChirho = false),
            underlineChirho = when (wordChirho.numberChirho) {
                "plural" -> PaletteChirho.PLURAL_CHIRHO
                "dual" -> PaletteChirho.DUAL_CHIRHO
                else -> null
            },
            outlineColorChirho = categoryColorChirho(wordChirho.posChirho),
            outlineChirho = if (wordChirho.posChirho == "unknown") OutlineChirho.DASHED_CHIRHO else OutlineChirho.SQUARE_CHIRHO,
            leftMarkerChirho = stemChirho,
            centerMarkerChirho = stateChirho,
            rightMarkerChirho = formChirho,
            patternChirho = patternChirho,
            categoryChirho = wordChirho.posChirho,
        )
    }

    fun greekCategoryChirho(wordChirho: GreekWordChirho): String {
        val partChirho = wordChirho.partOfSpeechChirho
        return when {
            partChirho == "article" -> "article"
            partChirho.endsWith(" pronoun") -> "pronoun"
            partChirho == "noun" || partChirho == "proper noun indeclinable" -> "noun"
            partChirho == "verb" || partChirho == "adjective" -> partChirho
            partChirho in setOf("particle", "preposition", "conjunction", "adverb", "cond") -> "particle"
            else -> "unknown"
        }
    }

    fun greekChirho(wordChirho: GreekWordChirho, hasAlternativesChirho: Boolean = false): WordCueChirho {
        val categoryChirho = greekCategoryChirho(wordChirho)
        val verbChirho = wordChirho.partOfSpeechChirho == "verb"
        return WordCueChirho(
            backgroundChirho = genderColorChirho(wordChirho.genderChirho, neuterChirho = true),
            underlineChirho = if (wordChirho.numberChirho == "plural") PaletteChirho.PLURAL_CHIRHO else null,
            outlineColorChirho = categoryColorChirho(categoryChirho),
            outlineChirho = when {
                categoryChirho == "article" -> OutlineChirho.ROUND_CHIRHO
                categoryChirho == "pronoun" && !hasAlternativesChirho -> OutlineChirho.DASHED_ROUND_CHIRHO
                else -> OutlineChirho.SQUARE_CHIRHO
            },
            leftMarkerChirho = if (verbChirho) {
                GreekCuesChirho.codeChirho(GreekCuesChirho.TENSE_CHIRHO, wordChirho.tenseChirho) +
                    GreekCuesChirho.codeChirho(GreekCuesChirho.VOICE_CHIRHO, wordChirho.voiceChirho)
            } else {
                ""
            },
            centerMarkerChirho = GreekCuesChirho.codeChirho(GreekCuesChirho.CASE_CHIRHO, wordChirho.caseChirho),
            rightMarkerChirho = GreekCuesChirho.codeChirho(GreekCuesChirho.PERSON_CHIRHO, wordChirho.personChirho) +
                if (verbChirho) GreekCuesChirho.codeChirho(GreekCuesChirho.MOOD_CHIRHO, wordChirho.moodChirho) else "",
            patternChirho = PatternChirho.NONE_CHIRHO,
            categoryChirho = categoryChirho,
        )
    }

    private fun genderColorChirho(genderChirho: String, neuterChirho: Boolean): Long? = when (genderChirho) {
        "masculine" -> PaletteChirho.MASCULINE_CHIRHO
        "feminine" -> PaletteChirho.FEMININE_CHIRHO
        "neuter" -> if (neuterChirho) PaletteChirho.NEUTER_CHIRHO else null
        else -> null
    }

    private fun categoryColorChirho(categoryChirho: String): Long = when (categoryChirho) {
        "noun" -> PaletteChirho.NOUN_CHIRHO
        "verb" -> PaletteChirho.VERB_CHIRHO
        "adjective" -> PaletteChirho.ADJECTIVE_CHIRHO
        else -> PaletteChirho.PARTICLE_CHIRHO
    }
}

/** Greek cue codes (greek-cues-chirho.ts): roman case, tense + lowercase voice, person + mood. */
object GreekCuesChirho {
    val CASE_CHIRHO = mapOf("nominative" to "i", "genitive" to "ii", "dative" to "iii", "accusative" to "iv", "vocative" to "v")
    val TENSE_CHIRHO = mapOf(
        "present" to "P", "imperfect" to "I", "future" to "F", "second future" to "2F", "aorist" to "A",
        "second aorist" to "2A", "perfect" to "R", "second perfect" to "2R", "pluperfect" to "L",
        "second pluperfect" to "2L",
    )
    val VOICE_CHIRHO = mapOf(
        "active" to "a", "middle" to "m", "passive" to "p", "middle or passive" to "e",
        "middle deponent" to "d", "passive deponent" to "o", "middle or passive deponent" to "n",
    )
    val PERSON_CHIRHO = mapOf("first" to "1", "second" to "2", "third" to "3")
    val MOOD_CHIRHO = mapOf(
        "indicative" to "I", "subjunctive" to "S", "imperative" to "M", "infinitive" to "N", "participle" to "P",
    )

    fun codeChirho(groupChirho: Map<String, String>, valueChirho: String?): String =
        valueChirho?.let { groupChirho[it] } ?: ""
}
