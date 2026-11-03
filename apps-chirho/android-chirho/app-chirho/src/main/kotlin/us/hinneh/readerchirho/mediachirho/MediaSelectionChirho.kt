// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
package us.hinneh.readerchirho.mediachirho

import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import us.hinneh.readerchirho.contentchirho.BookCatalogueChirho
import us.hinneh.readerchirho.contentchirho.ContentJsonChirho
import us.hinneh.readerchirho.contentchirho.GreekVerseChirho
import us.hinneh.readerchirho.contentchirho.GreekWordChirho
import us.hinneh.readerchirho.contentchirho.HebrewWordChirho
import us.hinneh.readerchirho.contentchirho.VerseChirho
import us.hinneh.readerchirho.contentchirho.WHITESPACE_CLASS_CHIRHO
import us.hinneh.readerchirho.contentchirho.WordChirho
import us.hinneh.readerchirho.domainchirho.PassageChirho

/** Ported from media-chirho.ts and lemma-icons-chirho.ts. A failure withholds, never guesses. */
object MediaSelectionChirho {
    val ASSET_PATH_CHIRHO = Regex("/assets-chirho/[a-z0-9/-]+\\.webp")
    private val SHA_CHIRHO = Regex("[a-f0-9]{64}")
    private val PICTURE_LEMMA_CHIRHO = Regex("[HG][1-9][0-9]{0,4}|oshb:[bcdiklms]")
    private val AUGMENT_CHIRHO = Regex("[a-z]{1,2}")
    private val SLUG_CHIRHO = Regex("[a-z0-9][a-z0-9-]{0,127}")
    private val OSHB_TOKEN_CHIRHO = Regex("[A-Za-z0-9]{1,16}")
    private val POSITION_CHIRHO = Regex("![1-9][0-9]{0,2}")
    private val REVIEWS_CHIRHO = setOf("agent_reviewed", "human_reviewed")
    private val ART_CHIRHO = setOf("pending", "approved")

    private fun isPassageChirho(idChirho: String?, catalogueChirho: BookCatalogueChirho): Boolean {
        val passageChirho = idChirho?.let { PassageChirho.parseChirho(it) } ?: return false
        val bookChirho = catalogueChirho.bookChirho(passageChirho.bookIdChirho) ?: return false
        return passageChirho.chapterChirho <= bookChirho.chapterCountChirho && passageChirho.verseChirho <= 200
    }

    /** Every record in a chapter (not lemma defaults) must belong to that chapter. */
    fun recordsBelongChirho(fileChirho: MediaChapterFileChirho): Boolean {
        val prefixChirho = "${fileChirho.bookIdChirho}.${fileChirho.chapterChirho}."
        return (fileChirho.scenesChirho + fileChirho.iconsChirho).all { objectChirho ->
            (objectChirho["lesson_id_chirho"] as? JsonPrimitive)?.takeIf { it.isString }?.content?.startsWith(prefixChirho) == true
        }
    }

    /** validateScenesChirho: any invalid scene withholds the chapter's scenes. */
    fun scenesChirho(rawChirho: List<JsonObject>, catalogueChirho: BookCatalogueChirho): Map<String, ScenePresentationChirho>? {
        if (rawChirho.size > 1000) return null
        val standardChirho = HashMap<String, SceneRecordChirho>()
        val reducedChirho = HashMap<String, SceneRecordChirho>()
        for (objectChirho in rawChirho) {
            val sceneChirho = decodeOrNullChirho(objectChirho, SceneRecordChirho.serializer()) ?: return null
            val variantChirho = sceneChirho.variantChirho ?: "standard"
            val groupChirho = when (variantChirho) {
                "standard" -> standardChirho
                "representation_reduced" -> reducedChirho
                else -> return null
            }
            val validChirho = isPassageChirho(sceneChirho.lessonIdChirho, catalogueChirho) &&
                !groupChirho.containsKey(sceneChirho.lessonIdChirho) &&
                SHA_CHIRHO.matches(sceneChirho.sha256Chirho) &&
                sceneChirho.artReviewChirho in ART_CHIRHO &&
                sceneChirho.altChirho.isNotBlank() &&
                sceneChirho.readingNoteChirho.isNotBlank() &&
                sceneChirho.widthChirho in 1..4096 && sceneChirho.heightChirho in 1..4096 &&
                ASSET_PATH_CHIRHO.matches(sceneChirho.assetPathChirho)
            if (!validChirho) return null
            groupChirho[sceneChirho.lessonIdChirho] = sceneChirho
        }
        for ((lessonChirho, imageChirho) in reducedChirho) {
            val baseChirho = standardChirho[lessonChirho] ?: return null
            if (baseChirho.assetPathChirho == imageChirho.assetPathChirho || baseChirho.sha256Chirho == imageChirho.sha256Chirho) {
                return null
            }
        }
        return standardChirho.mapValues { (lessonChirho, sceneChirho) -> ScenePresentationChirho(sceneChirho, reducedChirho[lessonChirho]) }
    }

    /** lemmaIconKeyChirho: Hebrew lemma + augment; Greek lemma + exact lexical form. */
    fun lemmaKeyChirho(lemmaIdChirho: String, augmentChirho: String?, lexicalFormChirho: String?): String? {
        if (!PICTURE_LEMMA_CHIRHO.matches(lemmaIdChirho)) return null
        if (augmentChirho != null && !AUGMENT_CHIRHO.matches(augmentChirho)) return null
        if (lemmaIdChirho.startsWith("G")) {
            if (augmentChirho != null || lexicalFormChirho.isNullOrBlank() || lexicalFormChirho.length > 128) return null
            return "$lemmaIdChirho\u0000$lexicalFormChirho"
        }
        return "$lemmaIdChirho\u0000${augmentChirho ?: ""}"
    }

    private fun wordKeyChirho(wordChirho: WordChirho): String? = when (wordChirho) {
        is HebrewWordChirho -> lemmaKeyChirho(wordChirho.lemmaIdChirho, wordChirho.lemmaAugmentChirho, null)
        is GreekWordChirho -> lemmaKeyChirho(wordChirho.lemmaIdChirho, null, wordChirho.lexicalFormChirho)
    }

    private fun validDefaultChirho(iconChirho: IconRecordChirho, catalogueChirho: BookCatalogueChirho): Boolean {
        val lessonChirho = iconChirho.lessonIdChirho ?: return false
        val tokenChirho = iconChirho.tokenIdChirho
        val tokenValidChirho = OSHB_TOKEN_CHIRHO.matches(tokenChirho) ||
            (tokenChirho.startsWith("$lessonChirho!") && POSITION_CHIRHO.matches(tokenChirho.substring(lessonChirho.length)))
        return SLUG_CHIRHO.matches(iconChirho.idChirho ?: "") &&
            isPassageChirho(lessonChirho, catalogueChirho) &&
            tokenValidChirho &&
            iconChirho.senseIdChirho.isNotBlank() &&
            iconChirho.contextualMeaningChirho.isNotBlank() &&
            iconChirho.altChirho.isNotBlank() &&
            iconChirho.senseReviewChirho in REVIEWS_CHIRHO &&
            iconChirho.artReviewChirho in ART_CHIRHO &&
            iconChirho.evidenceRefsChirho.isNotEmpty() &&
            iconChirho.evidenceRefsChirho.all { SLUG_CHIRHO.matches(it) } &&
            SHA_CHIRHO.matches(iconChirho.sha256Chirho) &&
            iconChirho.widthChirho in 1..128 && iconChirho.heightChirho in 1..128 &&
            ASSET_PATH_CHIRHO.matches(iconChirho.assetPathChirho)
    }

    /** lemmaIconsForLessonChirho: one general picture per full lemma; never a reviewed sense. */
    fun lemmaDefaultsChirho(
        rawChirho: List<JsonObject>?,
        verseChirho: VerseChirho,
        catalogueChirho: BookCatalogueChirho,
    ): Map<String, WordPictureChirho> {
        if (rawChirho == null || rawChirho.size > 4096) return emptyMap()
        val byKeyChirho = HashMap<String, IconRecordChirho>()
        for (objectChirho in rawChirho) {
            val iconChirho = decodeOrNullChirho(objectChirho, IconRecordChirho.serializer()) ?: return emptyMap()
            val keyChirho = lemmaKeyChirho(iconChirho.lemmaIdChirho, iconChirho.lemmaAugmentChirho, iconChirho.lexicalFormChirho)
                ?: return emptyMap()
            if (!validDefaultChirho(iconChirho, catalogueChirho) || byKeyChirho.put(keyChirho, iconChirho) != null) {
                return emptyMap()
            }
        }
        val resultChirho = HashMap<String, WordPictureChirho>()
        for (wordChirho in verseChirho.wordsChirho) {
            if ((wordChirho as? HebrewWordChirho)?.lemmaAssignmentStatusChirho == "source_review_required") continue
            val iconChirho = wordKeyChirho(wordChirho)?.let { byKeyChirho[it] } ?: continue
            resultChirho[wordChirho.idChirho] = WordPictureChirho(iconChirho, generalChirho = true, alternativesChirho = emptyList())
        }
        return resultChirho
    }

    /** Reused art stays attached only while the exact reviewed word and verse still agree. */
    private fun contextMatchesChirho(iconChirho: IconRecordChirho, verseChirho: VerseChirho, wordChirho: WordChirho): Boolean {
        val pinsChirho = listOf(iconChirho.contextTextChirho, iconChirho.contextGlossChirho, iconChirho.contextCanonicalTextChirho)
        if (pinsChirho.all { it == null }) return true
        return pinsChirho.all { it != null } &&
            iconChirho.contextTextChirho == wordChirho.textChirho &&
            iconChirho.contextGlossChirho == wordChirho.glossChirho &&
            iconChirho.contextCanonicalTextChirho == verseChirho.canonicalTextChirho
    }

    /** validateIconsChirho over this verse's matching records; any failure keeps only defaults. */
    fun contextualChirho(rawChirho: List<JsonObject>, verseChirho: VerseChirho): Map<String, WordPictureChirho>? {
        val wordsChirho = verseChirho.wordsChirho.associateBy { it.idChirho }
        val sourcesChirho = verseChirho.sourcesChirho.map { it.idChirho }.toSet()
        // As on the website, records for other verses or absent words are dropped before validation.
        val matchingChirho = rawChirho.filter { objectChirho ->
            (objectChirho["lesson_id_chirho"] as? JsonPrimitive)?.content == verseChirho.idChirho &&
                (objectChirho["token_id_chirho"] as? JsonPrimitive)?.content in wordsChirho
        }.map { decodeOrNullChirho(it, IconRecordChirho.serializer()) ?: return null }
            .filter { iconChirho ->
                val wordChirho = wordsChirho[iconChirho.tokenIdChirho]
                wordChirho != null && contextMatchesChirho(iconChirho, verseChirho, wordChirho)
            }
        if (matchingChirho.size > 128) return null
        val selectedChirho = HashMap<String, IconRecordChirho>()
        val groupsChirho = LinkedHashMap<String, MutableList<IconRecordChirho>>()
        for (iconChirho in matchingChirho) {
            if (iconChirho.assignmentChirho != null && iconChirho.assignmentChirho != "contextual") return null
            val wordChirho = wordsChirho.getValue(iconChirho.tokenIdChirho)
            val sameLemmaChirho = when (wordChirho) {
                is GreekWordChirho -> verseChirho is GreekVerseChirho && iconChirho.lemmaIdChirho == wordChirho.lemmaIdChirho &&
                    iconChirho.lexicalFormChirho == wordChirho.lexicalFormChirho && iconChirho.lemmaAugmentChirho == null
                is HebrewWordChirho -> "${iconChirho.lemmaIdChirho}${iconChirho.lemmaAugmentChirho ?: ""}" ==
                    "${wordChirho.lemmaIdChirho}${wordChirho.lemmaAugmentChirho ?: ""}"
            }
            val validChirho = sameLemmaChirho &&
                iconChirho.senseReviewChirho in REVIEWS_CHIRHO &&
                iconChirho.artReviewChirho in ART_CHIRHO &&
                listOf(iconChirho.senseIdChirho, iconChirho.contextualMeaningChirho, iconChirho.altChirho, iconChirho.displayAuthorityChirho)
                    .all { it.isNotBlank() } &&
                iconChirho.evidenceRefsChirho.isNotEmpty() && iconChirho.evidenceRefsChirho.all { it in sourcesChirho } &&
                iconChirho.widthChirho in 1..128 && iconChirho.heightChirho in 1..128 &&
                SHA_CHIRHO.matches(iconChirho.sha256Chirho) &&
                ASSET_PATH_CHIRHO.matches(iconChirho.assetPathChirho)
            if (!validChirho) return null
            groupsChirho.getOrPut(iconChirho.tokenIdChirho) { mutableListOf() }.add(iconChirho)
            if (iconChirho.selectedChirho != false && selectedChirho.put(iconChirho.tokenIdChirho, iconChirho) != null) return null
        }
        val resultChirho = HashMap<String, WordPictureChirho>()
        for ((tokenChirho, groupChirho) in groupsChirho) {
            val chosenChirho = selectedChirho[tokenChirho] ?: return null
            resultChirho[tokenChirho] = WordPictureChirho(chosenChirho, generalChirho = false, alternativesChirho = alternativesChirho(chosenChirho, groupChirho))
        }
        return resultChirho
    }

    /** alternativeIconsChirho: one picture for each other distinct reviewed meaning. */
    fun alternativesChirho(chosenChirho: IconRecordChirho, groupChirho: List<IconRecordChirho>): List<IconRecordChirho> {
        fun meaningKeyChirho(textChirho: String) = textChirho.trim().replace(Regex("[${WHITESPACE_CLASS_CHIRHO}]+"), " ").lowercase()
        val sensesChirho = mutableSetOf(chosenChirho.senseIdChirho)
        val meaningsChirho = mutableSetOf(meaningKeyChirho(chosenChirho.contextualMeaningChirho))
        val pathsChirho = mutableSetOf(chosenChirho.assetPathChirho)
        val hashesChirho = mutableSetOf(chosenChirho.sha256Chirho)
        return groupChirho.filter { candidateChirho ->
            val meaningChirho = meaningKeyChirho(candidateChirho.contextualMeaningChirho)
            val distinctChirho = candidateChirho.senseReviewChirho in REVIEWS_CHIRHO &&
                candidateChirho.senseIdChirho !in sensesChirho && meaningChirho !in meaningsChirho &&
                candidateChirho.assetPathChirho !in pathsChirho && candidateChirho.sha256Chirho !in hashesChirho
            if (distinctChirho) {
                sensesChirho.add(candidateChirho.senseIdChirho)
                meaningsChirho.add(meaningChirho)
                pathsChirho.add(candidateChirho.assetPathChirho)
                hashesChirho.add(candidateChirho.sha256Chirho)
            }
            distinctChirho
        }
    }

    /** iconsForLessonChirho: contextual records override general lemma pictures. */
    fun picturesChirho(fileChirho: MediaChapterFileChirho, verseChirho: VerseChirho, catalogueChirho: BookCatalogueChirho): Map<String, WordPictureChirho> {
        val defaultsChirho = lemmaDefaultsChirho(fileChirho.lemmaIconsChirho, verseChirho, catalogueChirho)
        val contextualChirho = contextualChirho(fileChirho.iconsChirho, verseChirho) ?: return defaultsChirho
        return defaultsChirho + contextualChirho
    }

    private fun <T> decodeOrNullChirho(objectChirho: JsonObject, serializerChirho: kotlinx.serialization.KSerializer<T>): T? =
        try {
            ContentJsonChirho.decodeFromJsonElement(serializerChirho, objectChirho)
        } catch (ignoredChirho: IllegalArgumentException) {
            null
        }
}
