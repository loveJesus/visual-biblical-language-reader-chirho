// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
package us.hinneh.readerchirho.contentchirho

import us.hinneh.readerchirho.domainchirho.VerbFormsChirho

/** A published verse that does not meet the reader's source contract. It is never displayed. */
class InvalidVerseChirho(reasonChirho: String) : Exception(reasonChirho)

// Mirrors the website's lesson-chirho.ts and greek-chirho.ts validators rule for rule.
object VerseValidationChirho {
    private val LETTER_OR_MARK_CHIRHO = Regex("[\\p{L}\\p{M}]")
    private val LEADING_MARK_CHIRHO = Regex("^\\p{M}")
    private val GREEK_GAP_CHIRHO = Regex("[${WHITESPACE_CLASS_CHIRHO}\\p{P}]*")
    private val SHA_CHIRHO = Regex("[a-f0-9]{64}")
    private val HEBREW_LEMMA_CHIRHO = Regex("H[0-9]+|oshb:[bcdiklms]|oshb:unresolved:[A-Za-z0-9]{1,16}")
    private val ROOT_ENTRY_CHIRHO = Regex("H[0-9]+[a-z]?")
    private val VERB_CODE_CHIRHO = Regex("[1-7][PIMACB]")

    private val POS_CHIRHO = setOf("noun", "verb", "adjective", "particle", "unknown")
    private val GENDER_CHIRHO = setOf("masculine", "feminine", "common", "na", "unknown")
    private val NUMBER_CHIRHO = setOf("singular", "plural", "dual", "na", "unknown")
    private val STATE_CHIRHO = setOf("absolute", "construct", "na", "unknown")
    private val ROOT_STATUS_CHIRHO = setOf("traditional", "unresolved", "not_applicable")
    private val FORM_NOTE_KINDS_CHIRHO = setOf("predictable_weak", "exceptional", "suppletive")
    private val MORPHOLOGY_FORMS_CHIRHO = mapOf(
        'p' to "qatal", 'q' to "weqatal", 'i' to "yiqtol", 'w' to "wayyiqtol", 'h' to "cohortative",
        'j' to "jussive", 'v' to "imperative", 'r' to "participle_active", 's' to "participle_passive",
        'a' to "infinitive_absolute", 'c' to "infinitive_construct",
    )

    private val GREEK_CASE_CHIRHO = setOf("na", "unknown", "nominative", "genitive", "dative", "accusative", "vocative")
    private val GREEK_NUMBER_CHIRHO = setOf("na", "unknown", "singular", "plural")
    private val GREEK_GENDER_CHIRHO = setOf("na", "unknown", "masculine", "feminine", "neuter")
    private val GREEK_PERSON_CHIRHO = setOf("first", "second", "third")
    private val GREEK_TENSE_CHIRHO = setOf(
        "present", "imperfect", "future", "aorist", "perfect", "pluperfect", "second aorist",
        "second future", "second perfect", "second pluperfect", "no tense stated",
    )
    private val GREEK_VOICE_CHIRHO = setOf(
        "active", "middle", "passive", "middle deponent", "passive deponent", "middle or passive",
        "middle or passive deponent", "impersonal active", "no voice",
    )
    private val GREEK_MOOD_CHIRHO = setOf(
        "indicative", "subjunctive", "imperative", "infinitive", "participle", "optative", "imperative participle",
    )
    private val GREEK_PARTS_CHIRHO = setOf(
        "unknown", "interjection", "correlative or interrogative pronoun", "letter indeclinable",
        "noun other type indeclinable", "adjective", "adverb", "aramaic", "article", "cond", "conjunction",
        "correlative pronoun", "demonstrative pronoun", "hebrew", "indefinite pronoun", "interrogative pronoun",
        "noun", "numeral indeclinable", "particle", "personal pronoun", "possessive pronoun", "preposition",
        "proper noun indeclinable", "reciprocal pronoun", "reflexive pronoun", "relative pronoun", "verb",
    )
    private val GREEK_REQUIRED_SOURCES_CHIRHO = listOf(
        "nestle1904-morph-chirho", "nestle1904-parsing-chirho", "berean-glosses-chirho",
    )

    private fun failChirho(reasonChirho: String): Nothing = throw InvalidVerseChirho(reasonChirho)

    private fun requireTextChirho(valueChirho: String?, fieldChirho: String) {
        if (valueChirho == null || valueChirho.isBlank()) failChirho("A required source field is empty: $fieldChirho")
    }

    /**
     * HTTP(S) source links without embedded credentials, as the website's safeSourceUrlChirho.
     * Like a browser URL parser it tolerates characters a strict java.net.URI would reject.
     */
    fun isSafeSourceUrlChirho(valueChirho: String?, httpsOnlyChirho: Boolean = false): Boolean {
        if (valueChirho == null || valueChirho.isBlank()) return false
        val trimmedChirho = valueChirho.trim()
        val lowerChirho = trimmedChirho.lowercase()
        val schemeEndChirho = when {
            lowerChirho.startsWith("https://") -> 8
            !httpsOnlyChirho && lowerChirho.startsWith("http://") -> 7
            else -> return false
        }
        val authorityChirho = trimmedChirho.substring(schemeEndChirho)
            .substringBefore('/').substringBefore('?').substringBefore('#').substringBefore('\\')
        val hostChirho = authorityChirho.substringBefore(':')
        return authorityChirho.isNotEmpty() && '@' !in authorityChirho && hostChirho.isNotBlank()
    }

    fun validateHebrewChirho(verseChirho: HebrewVerseChirho) {
        if (verseChirho.schemaVersionChirho != 1 || verseChirho.languageChirho != "he") {
            failChirho("Unsupported lesson schema or language.")
        }
        requireTextChirho(verseChirho.idChirho, "id")
        requireTextChirho(verseChirho.referenceChirho, "reference")
        requireTextChirho(verseChirho.canonicalTextChirho, "canonical text")
        verseChirho.translationChirho?.let { requireTextChirho(it, "translation") }
        val tokensChirho = verseChirho.tokensChirho
        if (tokensChirho.isEmpty() || tokensChirho.size > 200 || verseChirho.sourcesChirho.isEmpty()) {
            failChirho("Lesson tokens or source evidence are unavailable.")
        }
        val canonicalChirho = verseChirho.canonicalTextChirho
        var previousEndChirho = 0
        val idsChirho = HashSet<String>()
        for (tokenChirho in tokensChirho) {
            requireTextChirho(tokenChirho.idChirho, "token id")
            requireTextChirho(tokenChirho.textChirho, "token text")
            requireTextChirho(tokenChirho.rawMorphologyChirho, "raw morphology")
            requireTextChirho(tokenChirho.lemmaIdChirho, "lemma id")
            requireTextChirho(tokenChirho.lexicalFormChirho, "lexical form")
            requireTextChirho(tokenChirho.analysisChirho, "analysis")
            requireTextChirho(tokenChirho.sourceNoteChirho, "source note")
            tokenChirho.glossChirho?.let { requireTextChirho(it, "gloss") }
            if (!idsChirho.add(tokenChirho.idChirho)) failChirho("Duplicate source word ID.")
            checkSpanChirho(canonicalChirho, previousEndChirho, tokenChirho)
            if (LETTER_OR_MARK_CHIRHO.containsMatchIn(canonicalChirho.substring(previousEndChirho, tokenChirho.startChirho))) {
                failChirho("Unaccounted source word in canonical text.")
            }
            previousEndChirho = tokenChirho.endChirho
            checkHebrewCategoriesChirho(tokenChirho)
            checkHebrewSegmentsChirho(tokenChirho)
            checkHebrewVerbChirho(tokenChirho)
        }
        if (LETTER_OR_MARK_CHIRHO.containsMatchIn(canonicalChirho.substring(previousEndChirho))) {
            failChirho("Unaccounted final source word.")
        }
        for (sourceChirho in verseChirho.sourcesChirho) {
            requireTextChirho(sourceChirho.idChirho, "source id")
            requireTextChirho(sourceChirho.titleChirho, "source title")
            requireTextChirho(sourceChirho.revisionChirho, "source revision")
            requireTextChirho(sourceChirho.sha256Chirho, "source digest")
            requireTextChirho(sourceChirho.licenseChirho, "source license")
            requireTextChirho(sourceChirho.attributionChirho, "source attribution")
            if (sourceChirho.urlChirho != null && !isSafeSourceUrlChirho(sourceChirho.urlChirho)) {
                failChirho("Source links must use HTTP(S) without embedded credentials.")
            }
            if (!SHA_CHIRHO.matches(sourceChirho.sha256Chirho)) failChirho("Invalid source SHA-256.")
        }
    }

    private fun checkSpanChirho(canonicalChirho: String, previousEndChirho: Int, tokenChirho: WordChirho) {
        if (tokenChirho.startChirho < previousEndChirho ||
            tokenChirho.endChirho <= tokenChirho.startChirho ||
            tokenChirho.endChirho > canonicalChirho.length ||
            canonicalChirho.substring(tokenChirho.startChirho, tokenChirho.endChirho) != tokenChirho.textChirho
        ) {
            failChirho("Invalid canonical source span: ${tokenChirho.idChirho}")
        }
    }

    private fun checkHebrewCategoriesChirho(tokenChirho: HebrewWordChirho) {
        if (tokenChirho.posChirho !in POS_CHIRHO || tokenChirho.genderChirho !in GENDER_CHIRHO ||
            tokenChirho.numberChirho !in NUMBER_CHIRHO || tokenChirho.stateChirho !in STATE_CHIRHO ||
            tokenChirho.rootStatusChirho !in ROOT_STATUS_CHIRHO
        ) {
            failChirho("Unsupported grammatical category.")
        }
        if (!HEBREW_LEMMA_CHIRHO.matches(tokenChirho.lemmaIdChirho)) failChirho("Invalid Hebrew lemma identifier.")
        val augmentChirho = tokenChirho.lemmaAugmentChirho
        if (augmentChirho != null && !Regex("[a-z]").matches(augmentChirho)) {
            failChirho("Invalid augmented lemma identifier.")
        }
        tokenChirho.rootTextChirho?.let { requireTextChirho(it, "root text") }
        val rootEntryChirho = tokenChirho.rootEntryIdChirho
        if (rootEntryChirho != null && !ROOT_ENTRY_CHIRHO.matches(rootEntryChirho)) failChirho("Invalid traditional root entry.")
        requireTextChirho(tokenChirho.rootNoteChirho, "root note")
        val traditionalChirho = tokenChirho.rootStatusChirho == "traditional"
        if (traditionalChirho && (tokenChirho.rootTextChirho == null || rootEntryChirho == null)) {
            failChirho("Traditional roots require an explicit lexical relationship.")
        }
        if (!traditionalChirho && (tokenChirho.rootTextChirho != null || rootEntryChirho != null)) {
            failChirho("Unresolved or inapplicable roots must remain unassigned.")
        }
    }

    private fun checkHebrewSegmentsChirho(tokenChirho: HebrewWordChirho) {
        val segmentsChirho = tokenChirho.segmentsChirho
        if (segmentsChirho.isEmpty() ||
            segmentsChirho.any { it.isEmpty() || LEADING_MARK_CHIRHO.containsMatchIn(it) } ||
            segmentsChirho.joinToString("") != tokenChirho.textChirho
        ) {
            failChirho("Invalid source segmentation: ${tokenChirho.idChirho}")
        }
    }

    private fun checkHebrewVerbChirho(tokenChirho: HebrewWordChirho) {
        val formChirho = tokenChirho.verbFormChirho
        val constructionChirho = tokenChirho.verbConstructionChirho
        if (formChirho != null || constructionChirho != null || tokenChirho.verbStemChirho != null) {
            if (tokenChirho.posChirho != "verb") failChirho("Verb metadata requires a verb.")
            if (!VerbFormsChirho.isValidClassificationChirho(formChirho, constructionChirho)) {
                failChirho("Unsupported verb classification.")
            }
            val partsChirho = tokenChirho.rawMorphologyChirho.removePrefix("H").split("/")
            val headIndexChirho = partsChirho.indexOfFirst { it.startsWith("V") }
            val headChirho = partsChirho.getOrNull(headIndexChirho)
            val sourcedFormChirho = headChirho?.getOrNull(2)?.let { MORPHOLOGY_FORMS_CHIRHO[it] }
            if (formChirho != null && formChirho != sourcedFormChirho) {
                failChirho("Verb form contradicts source morphology.")
            }
            if (constructionChirho != null && (headIndexChirho < 1 || partsChirho[headIndexChirho - 1] != "C")) {
                failChirho("Verb construction requires a sourced conjunction.")
            }
            if (tokenChirho.verbCodeChirho != null && formChirho in setOf("weqatal", "wayyiqtol", "jussive", "cohortative")) {
                failChirho("Named forms cannot borrow a basic conjugation letter.")
            }
        }
        val codeChirho = tokenChirho.verbCodeChirho
        if (codeChirho != null && (tokenChirho.posChirho != "verb" || !VERB_CODE_CHIRHO.matches(codeChirho))) {
            failChirho("Invalid local verb teaching code.")
        }
        tokenChirho.formNoteChirho?.let { noteChirho ->
            if (noteChirho.kindChirho !in FORM_NOTE_KINDS_CHIRHO) failChirho("Invalid form-note classification.")
            requireTextChirho(noteChirho.textChirho, "form note")
            if (!isSafeSourceUrlChirho(noteChirho.sourceChirho)) failChirho("Invalid form-note source.")
        }
    }

    fun validateGreekChirho(verseChirho: GreekVerseChirho) {
        if (verseChirho.schemaVersionChirho != 1 || verseChirho.languageChirho != "grc" ||
            verseChirho.translationChirho != null || verseChirho.glossOriginChirho != "berean_interlinear"
        ) {
            failChirho("Invalid Greek lesson provenance")
        }
        requireTextChirho(verseChirho.idChirho, "id")
        requireTextChirho(verseChirho.referenceChirho, "reference")
        requireTextChirho(verseChirho.canonicalTextChirho, "canonical text")
        if (verseChirho.tokensChirho.isEmpty()) failChirho("Missing Greek sources or tokens")
        for (requiredChirho in GREEK_REQUIRED_SOURCES_CHIRHO) {
            if (verseChirho.sourcesChirho.none { it.idChirho == requiredChirho }) failChirho("Missing Greek provenance")
        }
        for (sourceChirho in verseChirho.sourcesChirho) {
            listOf(
                sourceChirho.idChirho, sourceChirho.titleChirho, sourceChirho.urlChirho, sourceChirho.revisionChirho,
                sourceChirho.sha256Chirho, sourceChirho.licenseChirho, sourceChirho.attributionChirho,
            ).forEach { requireTextChirho(it, "Greek source field") }
            if (!SHA_CHIRHO.matches(sourceChirho.sha256Chirho)) failChirho("Invalid Greek source digest")
            if (!isSafeSourceUrlChirho(sourceChirho.urlChirho, httpsOnlyChirho = true)) failChirho("Invalid Greek source URL")
        }
        val textChirho = verseChirho.canonicalTextChirho
        val tokenIdChirho = Regex(Regex.escape(verseChirho.idChirho) + "![0-9]+")
        var endChirho = 0
        val idsChirho = HashSet<String>()
        for (tokenChirho in verseChirho.tokensChirho) {
            listOf(
                tokenChirho.idChirho, tokenChirho.textChirho, tokenChirho.rawMorphologyChirho,
                tokenChirho.rawFormMorphologyChirho, tokenChirho.rawStrongsChirho, tokenChirho.lemmaIdChirho,
                tokenChirho.lexicalFormChirho, tokenChirho.partOfSpeechChirho, tokenChirho.analysisChirho,
                tokenChirho.sourceNoteChirho,
            ).forEach { requireTextChirho(it, "Greek token field") }
            if (!idsChirho.add(tokenChirho.idChirho) || !tokenIdChirho.matches(tokenChirho.idChirho)) {
                failChirho("Invalid Greek token identity")
            }
            if (!Regex("G[0-9]+").matches(tokenChirho.lemmaIdChirho) || tokenChirho.partOfSpeechChirho !in GREEK_PARTS_CHIRHO) {
                failChirho("Invalid Greek lemma or part of speech")
            }
            if (tokenChirho.caseChirho !in GREEK_CASE_CHIRHO || tokenChirho.numberChirho !in GREEK_NUMBER_CHIRHO ||
                tokenChirho.genderChirho !in GREEK_GENDER_CHIRHO ||
                (tokenChirho.personChirho != null && tokenChirho.personChirho !in GREEK_PERSON_CHIRHO) ||
                (tokenChirho.tenseChirho != null && tokenChirho.tenseChirho !in GREEK_TENSE_CHIRHO) ||
                (tokenChirho.voiceChirho != null && tokenChirho.voiceChirho !in GREEK_VOICE_CHIRHO) ||
                (tokenChirho.moodChirho != null && tokenChirho.moodChirho !in GREEK_MOOD_CHIRHO)
            ) {
                failChirho("Invalid Greek parse value")
            }
            checkSpanChirho(textChirho, endChirho, tokenChirho)
            if (!GREEK_GAP_CHIRHO.matches(textChirho.substring(endChirho, tokenChirho.startChirho))) {
                failChirho("Invalid Greek source span or gap")
            }
            if (tokenChirho.segmentsChirho.any { it.isEmpty() } ||
                tokenChirho.segmentsChirho.joinToString("") != tokenChirho.textChirho
            ) {
                failChirho("Invalid Greek segments")
            }
            endChirho = tokenChirho.endChirho
        }
        if (!GREEK_GAP_CHIRHO.matches(textChirho.substring(endChirho))) failChirho("Invalid Greek final gap")
    }
}
