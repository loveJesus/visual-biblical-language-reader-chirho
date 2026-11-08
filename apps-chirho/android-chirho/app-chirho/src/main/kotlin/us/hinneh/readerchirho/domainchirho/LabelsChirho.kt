// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
package us.hinneh.readerchirho.domainchirho

import us.hinneh.readerchirho.contentchirho.GreekWordChirho
import us.hinneh.readerchirho.contentchirho.HebrewWordChirho

/** Localized grammar labels (website: labels-chirho.ts). Source values stay as the source gives them. */
object LabelsChirho {
    private val SPANISH_TERMS_CHIRHO = mapOf(
        "noun" to "sustantivo", "verb" to "verbo", "adjective" to "adjetivo", "particle" to "partícula",
        "pronoun" to "pronombre", "article" to "artículo", "unknown" to "sin categoría", "masculine" to "masculino",
        "feminine" to "femenino", "neuter" to "neutro", "common" to "común", "singular" to "singular",
        "plural" to "plural", "dual" to "dual", "absolute" to "absoluto", "construct" to "constructo",
        "na" to "no aplica", "adverb" to "adverbio", "aramaic" to "arameo", "cond" to "condicional",
        "conjunction" to "conjunción", "correlative pronoun" to "pronombre correlativo",
        "demonstrative pronoun" to "pronombre demostrativo", "hebrew" to "hebreo",
        "indefinite pronoun" to "pronombre indefinido", "interrogative pronoun" to "pronombre interrogativo",
        "numeral indeclinable" to "numeral indeclinable", "personal pronoun" to "pronombre personal",
        "possessive pronoun" to "pronombre posesivo", "preposition" to "preposición",
        "proper noun indeclinable" to "nombre propio indeclinable", "reciprocal pronoun" to "pronombre recíproco",
        "reflexive pronoun" to "pronombre reflexivo", "relative pronoun" to "pronombre relativo",
        "nominative" to "nominativo", "genitive" to "genitivo", "dative" to "dativo", "accusative" to "acusativo",
        "vocative" to "vocativo", "present" to "presente", "imperfect" to "imperfecto", "future" to "futuro",
        "aorist" to "aoristo", "perfect" to "perfecto", "pluperfect" to "pluscuamperfecto",
        "second aorist" to "segundo aoristo", "second future" to "segundo futuro", "second perfect" to "segundo perfecto",
        "second pluperfect" to "segundo pluscuamperfecto", "active" to "activa", "middle" to "media",
        "passive" to "pasiva", "middle deponent" to "media deponente", "passive deponent" to "pasiva deponente",
        "middle or passive" to "media o pasiva", "middle or passive deponent" to "media o pasiva deponente",
        "indicative" to "indicativo", "subjunctive" to "subjuntivo", "imperative" to "imperativo",
        "infinitive" to "infinitivo", "participle" to "participio", "participle_active" to "participio activo",
        "participle_passive" to "participio pasivo", "infinitive_absolute" to "infinitivo absoluto",
        "infinitive_construct" to "infinitivo constructo", "cohortative" to "cohortativo", "jussive" to "yusivo",
        "qatal_copulative" to "qatal con conjunción copulativa", "first" to "primera persona",
        "second" to "segunda persona", "third" to "tercera persona",
    )

    /** An unlisted value stays visible as the source gives it rather than being guessed. */
    fun termChirho(valueChirho: String, spanishChirho: Boolean): String =
        if (spanishChirho) SPANISH_TERMS_CHIRHO[valueChirho] ?: valueChirho else valueChirho

    fun hebrewMorphologyChirho(wordChirho: HebrewWordChirho, spanishChirho: Boolean): String {
        val formChirho = wordChirho.verbFormChirho
        if (!spanishChirho) {
            fun shownChirho(valueChirho: String) = if (valueChirho == "na") "not applicable" else valueChirho
            val verbChirho = when {
                // Source values such as participle_active are read aloud, so their underscores become spaces.
                formChirho != null -> "; ${wordChirho.verbStemChirho ?: ""} ${(wordChirho.verbConstructionChirho ?: formChirho).replace('_', ' ')}"
                wordChirho.verbCodeChirho != null -> "; local verb code ${wordChirho.verbCodeChirho}"
                else -> ""
            }
            return "${wordChirho.posChirho}; gender ${shownChirho(wordChirho.genderChirho)}; " +
                "number ${shownChirho(wordChirho.numberChirho)}; state ${shownChirho(wordChirho.stateChirho)}$verbChirho"
        }
        val verbChirho = when {
            formChirho != null -> "; ${wordChirho.verbStemChirho ?: ""} ${termChirho(wordChirho.verbConstructionChirho ?: formChirho, true)}"
            wordChirho.verbCodeChirho != null -> "; código verbal local ${wordChirho.verbCodeChirho}"
            else -> ""
        }
        return "${termChirho(wordChirho.posChirho, true)}; género ${termChirho(wordChirho.genderChirho, true)}; " +
            "número ${termChirho(wordChirho.numberChirho, true)}; estado ${termChirho(wordChirho.stateChirho, true)}$verbChirho"
    }

    fun greekAnalysisChirho(wordChirho: GreekWordChirho, spanishChirho: Boolean): String =
        listOf(
            wordChirho.partOfSpeechChirho,
            *listOfNotNull(
                wordChirho.caseChirho, wordChirho.numberChirho, wordChirho.genderChirho, wordChirho.tenseChirho,
                wordChirho.voiceChirho, wordChirho.moodChirho, wordChirho.personChirho,
            ).filter { it.isNotEmpty() && it != "na" && it != "unknown" }.toTypedArray(),
        ).joinToString(", ") { termChirho(it, spanishChirho) }
}
