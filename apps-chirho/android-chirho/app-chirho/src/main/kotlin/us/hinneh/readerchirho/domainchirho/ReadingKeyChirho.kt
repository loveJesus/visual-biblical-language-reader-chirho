// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
package us.hinneh.readerchirho.domainchirho

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import us.hinneh.readerchirho.contentchirho.ContentJsonChirho
import us.hinneh.readerchirho.remotechirho.decodeUtf8Chirho

/**
 * The reading key: the website's legend, exported with the other teaching tables by
 * apps-chirho/ios-chirho/scripts-chirho/export_teaching_chirho.ts into this app's assets (the iOS
 * reader bundles the same bytes). Only the legend is read here.
 */
@Serializable
data class ReadingKeyChirho(
    @SerialName("schema_version_chirho") val schemaVersionChirho: Int,
    @SerialName("legend_hebrew_chirho") val legendHebrewChirho: List<LegendRowChirho>,
    @SerialName("legend_greek_chirho") val legendGreekChirho: List<LegendRowChirho>,
) {
    fun rowsChirho(greekChirho: Boolean): List<LegendRowChirho> = if (greekChirho) legendGreekChirho else legendHebrewChirho

    companion object {
        const val ASSET_PATH_CHIRHO = "teaching-chirho/teaching-chirho.json"
        private const val SCHEMA_VERSION_CHIRHO = 1

        /** Strict UTF-8, and another schema is refused rather than guessed at. */
        fun parseChirho(bytesChirho: ByteArray): ReadingKeyChirho {
            val keyChirho = ContentJsonChirho.decodeFromString(serializer(), decodeUtf8Chirho(bytesChirho))
            require(keyChirho.schemaVersionChirho == SCHEMA_VERSION_CHIRHO) { "Unsupported teaching schema ${keyChirho.schemaVersionChirho}" }
            return keyChirho
        }
    }
}

@Serializable
data class LegendRowChirho(
    @SerialName("label_en_chirho") val labelEnChirho: String,
    @SerialName("label_es_chirho") val labelEsChirho: String,
    @SerialName("items_chirho") val itemsChirho: List<LegendItemChirho>,
) {
    fun labelChirho(spanishChirho: Boolean): String = if (spanishChirho) labelEsChirho else labelEnChirho
}

@Serializable
data class LegendItemChirho(
    @SerialName("id_chirho") val idChirho: String,
    @SerialName("style_chirho") val styleChirho: String,
    @SerialName("source_chirho") val sourceChirho: String? = null,
    @SerialName("label_en_chirho") val labelEnChirho: String,
    @SerialName("help_en_chirho") val helpEnChirho: String,
    @SerialName("label_es_chirho") val labelEsChirho: String,
    @SerialName("help_es_chirho") val helpEsChirho: String,
    @SerialName("spanish_available_chirho") val spanishAvailableChirho: Boolean,
) {
    /** Spanish only where the website has a Spanish explanation; otherwise its English original. */
    fun labelChirho(spanishChirho: Boolean): String = if (spanishChirho && spanishAvailableChirho) labelEsChirho else labelEnChirho

    fun helpChirho(spanishChirho: Boolean): String = if (spanishChirho && spanishAvailableChirho) helpEsChirho else helpEnChirho
}
