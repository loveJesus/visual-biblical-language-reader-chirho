// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
package us.hinneh.readerchirho.domainchirho

/** Local teaching letters for sourced Hebrew verb forms (website: verb-forms-chirho.ts). */
object VerbFormsChirho {
    data class NamedFormChirho(
        val idChirho: String,
        val formChirho: String,
        val constructionChirho: String?,
        val labelChirho: String,
        val markerChirho: String,
    )

    private val FORM_NAMES_CHIRHO = setOf(
        "qatal", "weqatal", "yiqtol", "wayyiqtol", "cohortative", "jussive", "imperative",
        "participle_active", "participle_passive", "infinitive_absolute", "infinitive_construct",
    )

    val NAMED_FORMS_CHIRHO = listOf(
        NamedFormChirho("weqatal", "weqatal", null, "weqatal", "W"),
        NamedFormChirho("wayyiqtol", "wayyiqtol", null, "wayyiqtol", "Y"),
        NamedFormChirho("weyiqtol", "yiqtol", "weyiqtol", "weyiqtol", "E"),
        NamedFormChirho("jussive", "jussive", null, "jussive", "J"),
        NamedFormChirho("cohortative", "cohortative", null, "cohortative", "O"),
        NamedFormChirho("qatal-copulative", "qatal", "qatal_copulative", "waw + qatal", "Q"),
    )

    val STEMS_CHIRHO = listOf("qal", "niphal", "piel", "pual", "hiphil", "hophal", "hithpael")

    private val BASIC_MARKERS_CHIRHO = mapOf(
        "qatal" to "P", "yiqtol" to "I", "imperative" to "M", "participle_active" to "A",
        "participle_passive" to "A", "infinitive_construct" to "C", "infinitive_absolute" to "B",
    )

    fun stemNumberChirho(stemChirho: String?): String =
        STEMS_CHIRHO.indexOf(stemChirho).takeIf { it >= 0 }?.let { (it + 1).toString() } ?: ""

    private fun namedFormChirho(formChirho: String?) =
        NAMED_FORMS_CHIRHO.firstOrNull { it.constructionChirho == null && it.formChirho == formChirho }

    private fun namedConstructionChirho(constructionChirho: String) =
        NAMED_FORMS_CHIRHO.firstOrNull { it.constructionChirho == constructionChirho }

    /** Display convention only: imported morphology and legacy source codes stay unchanged. */
    fun formMarkerChirho(formChirho: String?, constructionChirho: String?): String {
        if (constructionChirho != null) {
            return namedConstructionChirho(constructionChirho)?.takeIf { it.formChirho == formChirho }?.markerChirho ?: ""
        }
        if (formChirho == null) return ""
        return namedFormChirho(formChirho)?.markerChirho ?: BASIC_MARKERS_CHIRHO[formChirho] ?: ""
    }

    /** Full names supplement the letter codes; nothing is inferred from spelling or waw. */
    fun formLabelChirho(formChirho: String?, constructionChirho: String?): String {
        if (constructionChirho != null) {
            return namedConstructionChirho(constructionChirho)?.takeIf { it.formChirho == formChirho }?.labelChirho ?: ""
        }
        return namedFormChirho(formChirho)?.labelChirho ?: ""
    }

    fun isValidClassificationChirho(formChirho: String?, constructionChirho: String?): Boolean {
        if (formChirho != null && formChirho !in FORM_NAMES_CHIRHO) return false
        if (constructionChirho == null) return true
        return namedConstructionChirho(constructionChirho)?.formChirho == formChirho
    }
}
