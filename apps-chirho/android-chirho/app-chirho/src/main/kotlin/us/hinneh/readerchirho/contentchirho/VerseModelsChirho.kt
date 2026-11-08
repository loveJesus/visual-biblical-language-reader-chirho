// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
package us.hinneh.readerchirho.contentchirho

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

// Published verse records. Text fields are decoded exactly as published and never normalized.
// A nullable property without a default must still be present, matching the website's checks.

@Serializable
data class SourceChirho(
    @SerialName("id_chirho") val idChirho: String,
    @SerialName("title_chirho") val titleChirho: String,
    @SerialName("url_chirho") val urlChirho: String?,
    @SerialName("revision_chirho") val revisionChirho: String,
    @SerialName("sha256_chirho") val sha256Chirho: String,
    @SerialName("license_chirho") val licenseChirho: String,
    @SerialName("attribution_chirho") val attributionChirho: String,
)

@Serializable
data class SourceNoteChirho(
    @SerialName("kind_chirho") val kindChirho: String,
    @SerialName("text_chirho") val textChirho: String,
    @SerialName("code_chirho") val codeChirho: String? = null,
    @SerialName("before_token_id_chirho") val beforeTokenIdChirho: String? = null,
)

@Serializable
data class FormNoteChirho(
    @SerialName("kind_chirho") val kindChirho: String,
    @SerialName("text_chirho") val textChirho: String,
    @SerialName("source_chirho") val sourceChirho: String,
)

/** A qere reading, preserved separately from the written (ketiv) word it is read for. */
@Serializable
data class QereChirho(
    @SerialName("id_chirho") val idChirho: String,
    @SerialName("text_chirho") val textChirho: String,
    @SerialName("lemma_id_chirho") val lemmaIdChirho: String? = null,
    @SerialName("lemma_augment_chirho") val lemmaAugmentChirho: String? = null,
    @SerialName("gloss_chirho") val glossChirho: String? = null,
    @SerialName("analysis_chirho") val analysisChirho: String? = null,
    /** Part of the qere's exact identity when a reviewed spoken reading is bound to it (SpokenOverridesChirho). */
    @SerialName("raw_morphology_chirho") val rawMorphologyChirho: String? = null,
)

sealed interface WordChirho {
    val idChirho: String
    val textChirho: String
    val segmentsChirho: List<String>
    val startChirho: Int
    val endChirho: Int
    val rawMorphologyChirho: String
    val lemmaIdChirho: String
    val lexicalFormChirho: String
    val glossChirho: String?
    val analysisChirho: String
    val sourceNoteChirho: String
}

@Serializable
data class HebrewWordChirho(
    @SerialName("id_chirho") override val idChirho: String,
    @SerialName("text_chirho") override val textChirho: String,
    @SerialName("segments_chirho") override val segmentsChirho: List<String>,
    @SerialName("start_chirho") override val startChirho: Int,
    @SerialName("end_chirho") override val endChirho: Int,
    @SerialName("raw_morphology_chirho") override val rawMorphologyChirho: String,
    @SerialName("lemma_id_chirho") override val lemmaIdChirho: String,
    @SerialName("lemma_augment_chirho") val lemmaAugmentChirho: String?,
    @SerialName("lexical_form_chirho") override val lexicalFormChirho: String,
    @SerialName("pos_chirho") val posChirho: String,
    @SerialName("gender_chirho") val genderChirho: String,
    @SerialName("number_chirho") val numberChirho: String,
    @SerialName("state_chirho") val stateChirho: String,
    @SerialName("root_text_chirho") val rootTextChirho: String?,
    @SerialName("root_entry_id_chirho") val rootEntryIdChirho: String?,
    @SerialName("root_status_chirho") val rootStatusChirho: String,
    @SerialName("root_note_chirho") val rootNoteChirho: String,
    @SerialName("gloss_chirho") override val glossChirho: String?,
    @SerialName("analysis_chirho") override val analysisChirho: String,
    @SerialName("source_note_chirho") override val sourceNoteChirho: String,
    @SerialName("verb_code_chirho") val verbCodeChirho: String? = null,
    @SerialName("verb_stem_chirho") val verbStemChirho: String? = null,
    @SerialName("verb_form_chirho") val verbFormChirho: String? = null,
    @SerialName("verb_construction_chirho") val verbConstructionChirho: String? = null,
    @SerialName("gloss_origin_chirho") val glossOriginChirho: String? = null,
    @SerialName("source_language_chirho") val sourceLanguageChirho: String? = null,
    @SerialName("lemma_assignment_status_chirho") val lemmaAssignmentStatusChirho: String? = null,
    @SerialName("qere_chirho") val qereChirho: List<QereChirho>? = null,
    @SerialName("form_note_chirho") val formNoteChirho: FormNoteChirho? = null,
) : WordChirho

@Serializable
data class GreekWordChirho(
    @SerialName("id_chirho") override val idChirho: String,
    @SerialName("text_chirho") override val textChirho: String,
    @SerialName("segments_chirho") override val segmentsChirho: List<String>,
    @SerialName("start_chirho") override val startChirho: Int,
    @SerialName("end_chirho") override val endChirho: Int,
    @SerialName("raw_morphology_chirho") override val rawMorphologyChirho: String,
    @SerialName("raw_form_morphology_chirho") val rawFormMorphologyChirho: String,
    @SerialName("raw_strongs_chirho") val rawStrongsChirho: String,
    @SerialName("lemma_id_chirho") override val lemmaIdChirho: String,
    @SerialName("lexical_form_chirho") override val lexicalFormChirho: String,
    @SerialName("part_of_speech_chirho") val partOfSpeechChirho: String,
    @SerialName("case_chirho") val caseChirho: String,
    @SerialName("number_chirho") val numberChirho: String,
    @SerialName("gender_chirho") val genderChirho: String,
    @SerialName("person_chirho") val personChirho: String? = null,
    @SerialName("tense_chirho") val tenseChirho: String? = null,
    @SerialName("voice_chirho") val voiceChirho: String? = null,
    @SerialName("mood_chirho") val moodChirho: String? = null,
    @SerialName("gloss_chirho") override val glossChirho: String?,
    @SerialName("analysis_chirho") override val analysisChirho: String,
    @SerialName("source_note_chirho") override val sourceNoteChirho: String,
) : WordChirho

sealed interface VerseChirho {
    val idChirho: String
    val referenceChirho: String
    val canonicalTextChirho: String
    val wordsChirho: List<WordChirho>
    val sourcesChirho: List<SourceChirho>
    val sourceNotesChirho: List<SourceNoteChirho>
}

@Serializable
data class HebrewVerseChirho(
    @SerialName("schema_version_chirho") val schemaVersionChirho: Int,
    @SerialName("id_chirho") override val idChirho: String,
    @SerialName("language_chirho") val languageChirho: String,
    @SerialName("reference_chirho") override val referenceChirho: String,
    @SerialName("canonical_text_chirho") override val canonicalTextChirho: String,
    @SerialName("translation_chirho") val translationChirho: String?,
    @SerialName("kjv_verse_id_chirho") val kjvVerseIdChirho: String? = null,
    @SerialName("gloss_origin_chirho") val glossOriginChirho: String? = null,
    @SerialName("tokens_chirho") val tokensChirho: List<HebrewWordChirho>,
    @SerialName("sources_chirho") override val sourcesChirho: List<SourceChirho>,
    @SerialName("source_notes_chirho") override val sourceNotesChirho: List<SourceNoteChirho> = emptyList(),
) : VerseChirho {
    override val wordsChirho: List<WordChirho> get() = tokensChirho
}

@Serializable
data class GreekVerseChirho(
    @SerialName("schema_version_chirho") val schemaVersionChirho: Int,
    @SerialName("id_chirho") override val idChirho: String,
    @SerialName("language_chirho") val languageChirho: String,
    @SerialName("reference_chirho") override val referenceChirho: String,
    @SerialName("canonical_text_chirho") override val canonicalTextChirho: String,
    @SerialName("translation_chirho") val translationChirho: String?,
    @SerialName("gloss_origin_chirho") val glossOriginChirho: String,
    @SerialName("tokens_chirho") val tokensChirho: List<GreekWordChirho>,
    @SerialName("sources_chirho") override val sourcesChirho: List<SourceChirho>,
    @SerialName("source_notes_chirho") override val sourceNotesChirho: List<SourceNoteChirho> = emptyList(),
) : VerseChirho {
    override val wordsChirho: List<WordChirho> get() = tokensChirho
}
