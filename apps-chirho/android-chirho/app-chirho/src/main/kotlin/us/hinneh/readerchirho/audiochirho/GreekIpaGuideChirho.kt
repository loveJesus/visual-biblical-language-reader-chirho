// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: spec-chirho/workflows-chirho/hosting-chirho/native-readers-chirho.md (shared native Greek IPA guide)
package us.hinneh.readerchirho.audiochirho

import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.SerializationException
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonNull
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import us.hinneh.readerchirho.contentchirho.GreekWordChirho
import us.hinneh.readerchirho.contentchirho.VerseChirho
import us.hinneh.readerchirho.domainchirho.SpokenChirho
import us.hinneh.readerchirho.domainchirho.SpokenOverridesChirho
import us.hinneh.readerchirho.remotechirho.sha256HexChirho

/** One exact spoken Greek form's three guide values; null where the guide gives none. */
data class GreekIpaRowChirho(val modernChirho: String?, val aspiratesChirho: String?, val erasmianChirho: String?) {
    /** The value for the reader's Greek pronunciation choice alone; another profile never stands in for it. */
    fun valueChirho(renditionChirho: GreekRenditionChirho): String? = when (renditionChirho) {
        GreekRenditionChirho.MODERN_CHIRHO -> modernChirho
        GreekRenditionChirho.MODERN_ASPIRATES_CHIRHO -> aspiratesChirho
        GreekRenditionChirho.ERASMIAN_CHIRHO -> erasmianChirho
    }
}

/**
 * Root's draft Greek IPA teaching guide (unit 175, GPT DM #3669 and #3675): the website's greekWordIpaChirho values for
 * every exact spoken form, exported unchanged and bundled as one manifest and eight parts (contract-chirho.json). It
 * is a broad teaching guide, not recorded or acoustic IPA, and nothing here derives a pronunciation. A lookup hashes
 * the exact UTF-8 bytes of the spoken text (no trimming, case folding or Unicode normalization), reads the part named
 * by the digest's first byte AND 7, and answers only when the row's own text has exactly the same bytes. The manifest
 * and each part are checked against the contract's fixed bounds and their recorded index, length and SHA-256; a
 * failure leaves the whole guide, that part or that value unavailable, quietly.
 */
class GreekIpaGuideChirho private constructor(
    private val readChirho: (String) -> ByteArray?,
    private val partsChirho: List<PartChirho>,
) {
    private class PartChirho(val fileChirho: String, val sha256Chirho: String, val bytesChirho: Int, val countChirho: Int)

    private class EntryChirho(val textChirho: String, val rowChirho: GreekIpaRowChirho)

    /** Parts read so far; a part that failed verification is kept empty, so it is neither trusted nor read again. */
    private val loadedChirho = arrayOfNulls<Map<String, EntryChirho>>(PART_COUNT_CHIRHO)

    /** The guide's row for this exact spoken text, or null when the guide has none or its part failed verification. */
    fun rowChirho(spokenTextChirho: String): GreekIpaRowChirho? {
        val bytesChirho = spokenTextChirho.encodeToByteArray()
        if (bytesChirho.isEmpty() || bytesChirho.size > MAX_TEXT_BYTES_CHIRHO) return null
        val keyChirho = sha256HexChirho(bytesChirho)
        val entryChirho = partChirho(keyChirho.substring(0, 2).toInt(16) and SHARD_MASK_CHIRHO)[keyChirho] ?: return null
        return entryChirho.rowChirho.takeIf { entryChirho.textChirho.encodeToByteArray().contentEquals(bytesChirho) }
    }

    @Synchronized
    private fun partChirho(indexChirho: Int): Map<String, EntryChirho> =
        loadedChirho[indexChirho] ?: (verifiedPartChirho(indexChirho) ?: emptyMap()).also { loadedChirho[indexChirho] = it }

    private fun verifiedPartChirho(indexChirho: Int): Map<String, EntryChirho>? = attemptChirho {
        val descriptorChirho = partsChirho[indexChirho]
        val bytesChirho = readChirho(descriptorChirho.fileChirho) ?: return@attemptChirho null
        if (bytesChirho.size != descriptorChirho.bytesChirho || sha256HexChirho(bytesChirho) != descriptorChirho.sha256Chirho) return@attemptChirho null
        val objectChirho = Json.parseToJsonElement(bytesChirho.decodeToString()).asObjectChirho()
        if (objectChirho.keys != PART_FIELDS_CHIRHO ||
            objectChirho.intChirho("schema_version_chirho") != 1 ||
            objectChirho.textChirho("recipe_id_chirho") != RECIPE_CHIRHO ||
            objectChirho.intChirho("part_index_chirho") != indexChirho
        ) {
            return@attemptChirho null
        }
        val entriesChirho = objectChirho["entries_chirho"].asObjectChirho()
        if (entriesChirho.size != descriptorChirho.countChirho) return@attemptChirho null
        entriesChirho.mapValues { (keyChirho, valueChirho) ->
            val rowChirho = valueChirho.asObjectChirho()
            val textChirho = rowChirho.textChirho("text_chirho") ?: throw IllegalArgumentException("row without text")
            val textBytesChirho = textChirho.encodeToByteArray()
            require(rowChirho.keys == ROW_FIELDS_CHIRHO && textBytesChirho.size in 1..MAX_TEXT_BYTES_CHIRHO)
            // Every row sits under the hash of its own exact text, in the part that hash names.
            require(HEX_CHIRHO.matches(keyChirho) && sha256HexChirho(textBytesChirho) == keyChirho)
            require(keyChirho.substring(0, 2).toInt(16) and SHARD_MASK_CHIRHO == indexChirho)
            val ipaChirho = rowChirho["ipa_chirho"].asObjectChirho()
            require(ipaChirho.keys == PROFILES_CHIRHO.toSet())
            EntryChirho(
                textChirho,
                GreekIpaRowChirho(ipaChirho.valueChirho("modern"), ipaChirho.valueChirho("modern_aspirates"), ipaChirho.valueChirho("erasmian")),
            )
        }
    }

    companion object {
        /** Where the app bundles the guide, under its assets (contract android_directory_chirho). */
        const val DIRECTORY_CHIRHO = "teaching-chirho/greek-ipa-chirho"
        const val MANIFEST_CHIRHO = "greek-ipa-manifest-chirho.json"
        const val RECIPE_CHIRHO = "greek-word-ipa-guide-v1-chirho"
        private const val PART_COUNT_CHIRHO = 8
        private const val SHARD_MASK_CHIRHO = 7
        private const val MAX_FORMS_CHIRHO = 25_000
        private const val MAX_PART_FORMS_CHIRHO = 4_096
        private const val MAX_PART_BYTES_CHIRHO = 1_048_576
        private const val MAX_MANIFEST_BYTES_CHIRHO = 131_072
        private const val MAX_TOTAL_BYTES_CHIRHO = 9_437_184L
        private const val MAX_TEXT_BYTES_CHIRHO = 1_024
        private const val MAX_IPA_BYTES_CHIRHO = 2_048
        private val PROFILES_CHIRHO = listOf("modern", "modern_aspirates", "erasmian")
        private val PART_FIELDS_CHIRHO = setOf("schema_version_chirho", "recipe_id_chirho", "part_index_chirho", "entries_chirho")
        private val ROW_FIELDS_CHIRHO = setOf("text_chirho", "ipa_chirho")
        private val HEX_CHIRHO = Regex("[0-9a-f]{64}")

        /** The contract's fixed bounds; a manifest that states any other value is not this guide. */
        private val LIMITS_CHIRHO = mapOf(
            "part_count_chirho" to PART_COUNT_CHIRHO.toLong(),
            "max_forms_chirho" to MAX_FORMS_CHIRHO.toLong(),
            "max_part_forms_chirho" to MAX_PART_FORMS_CHIRHO.toLong(),
            "max_part_bytes_chirho" to MAX_PART_BYTES_CHIRHO.toLong(),
            "max_manifest_bytes_chirho" to MAX_MANIFEST_BYTES_CHIRHO.toLong(),
            "max_total_bytes_chirho" to MAX_TOTAL_BYTES_CHIRHO,
            "max_text_bytes_chirho" to MAX_TEXT_BYTES_CHIRHO.toLong(),
            "max_ipa_bytes_chirho" to MAX_IPA_BYTES_CHIRHO.toLong(),
        )

        /**
         * The guide whose manifest [readChirho] returns (a missing file reads as null), or null when that manifest is
         * missing or breaks the contract. Parts are read and verified only when a lookup first needs them.
         */
        fun loadChirho(readChirho: (String) -> ByteArray?): GreekIpaGuideChirho? = attemptChirho {
            val bytesChirho = readChirho(MANIFEST_CHIRHO) ?: return@attemptChirho null
            if (bytesChirho.size > MAX_MANIFEST_BYTES_CHIRHO) return@attemptChirho null
            val manifestChirho = Json.parseToJsonElement(bytesChirho.decodeToString()).asObjectChirho()
            val shapeChirho = manifestChirho.intChirho("schema_version_chirho") == 1 &&
                manifestChirho.textChirho("recipe_id_chirho") == RECIPE_CHIRHO &&
                manifestChirho.textChirho("kind_chirho") == "teaching_guide" &&
                manifestChirho.textChirho("language_chirho") == "grc" &&
                (manifestChirho["profiles_chirho"] as? JsonArray)?.map { (it as? JsonPrimitive)?.content } == PROFILES_CHIRHO &&
                manifestChirho.textChirho("key_algorithm_chirho") == "sha256-utf8-exact-chirho" &&
                manifestChirho.textChirho("shard_algorithm_chirho") == "first-sha256-byte-and-7-chirho" &&
                manifestChirho.intChirho("part_count_chirho") == PART_COUNT_CHIRHO &&
                manifestChirho["limits_chirho"].asObjectChirho().mapValues { (_, valueChirho) -> (valueChirho as? JsonPrimitive)?.content?.toLongOrNull() } ==
                LIMITS_CHIRHO &&
                // The pins name what the guide was exported from; their values are root's to check, their presence ours.
                HEX_CHIRHO.matches(manifestChirho.textChirho("input_sha256_chirho").orEmpty()) &&
                manifestChirho["source_functions_chirho"] is JsonArray &&
                manifestChirho["corpus_chirho"] is JsonObject
            if (!shapeChirho) return@attemptChirho null
            val formsChirho = manifestChirho.intChirho("form_count_chirho") ?: return@attemptChirho null
            val descriptorsChirho = (manifestChirho["parts_chirho"] as? JsonArray) ?: return@attemptChirho null
            if (descriptorsChirho.size != PART_COUNT_CHIRHO) return@attemptChirho null
            val partsChirho = descriptorsChirho.mapIndexed { indexChirho, elementChirho ->
                val descriptorChirho = elementChirho.asObjectChirho()
                val fileChirho = "greek-ipa-part-%02d-chirho.json".format(indexChirho)
                require(descriptorChirho.intChirho("part_index_chirho") == indexChirho && descriptorChirho.textChirho("file_chirho") == fileChirho)
                val shaChirho = descriptorChirho.textChirho("sha256_chirho").orEmpty()
                val sizeChirho = descriptorChirho.intChirho("bytes_chirho") ?: 0
                val countChirho = descriptorChirho.intChirho("count_chirho") ?: -1
                require(HEX_CHIRHO.matches(shaChirho) && sizeChirho in 1..MAX_PART_BYTES_CHIRHO && countChirho in 0..MAX_PART_FORMS_CHIRHO)
                PartChirho(fileChirho, shaChirho, sizeChirho, countChirho)
            }
            if (formsChirho !in 0..MAX_FORMS_CHIRHO || partsChirho.sumOf { it.countChirho } != formsChirho) return@attemptChirho null
            if (partsChirho.sumOf { it.bytesChirho.toLong() } > MAX_TOTAL_BYTES_CHIRHO) return@attemptChirho null
            GreekIpaGuideChirho(readChirho, partsChirho)
        }

        /** Malformed data of any kind reads as unavailable, never as an error the reader sees. */
        private inline fun <T> attemptChirho(blockChirho: () -> T?): T? = try {
            blockChirho()
        } catch (invalidChirho: IllegalArgumentException) {
            null
        } catch (invalidChirho: SerializationException) {
            null
        } catch (invalidChirho: IndexOutOfBoundsException) {
            null
        }

        private fun JsonElement?.asObjectChirho(): JsonObject = this as? JsonObject ?: throw IllegalArgumentException("not an object")

        private fun JsonObject.textChirho(keyChirho: String): String? = (this[keyChirho] as? JsonPrimitive)?.takeIf { it.isString }?.content

        private fun JsonObject.intChirho(keyChirho: String): Int? = (this[keyChirho] as? JsonPrimitive)?.takeIf { !it.isString }?.content?.toIntOrNull()

        /** A stored value: a bounded string, or null for none; anything else breaks the part. */
        private fun JsonObject.valueChirho(profileChirho: String): String? = when (val valueChirho = this[profileChirho]) {
            JsonNull -> null
            is JsonPrimitive -> valueChirho.takeIf { it.isString && it.content.encodeToByteArray().size in 1..MAX_IPA_BYTES_CHIRHO }?.content
                ?: throw IllegalArgumentException("invalid value")
            else -> throw IllegalArgumentException("invalid value")
        }
    }
}

/**
 * A verse's Greek words in the guide, looked up off the main thread with the same spoken form the recordings bind
 * (SpokenChirho.wordChirho with the bundled reviewed readings). Null when the guide is unavailable. It never reaches
 * audio selection or any hold.
 */
class GreekIpaSourceChirho(
    guideChirho: () -> GreekIpaGuideChirho?,
    private val overridesChirho: () -> SpokenOverridesChirho,
    private val workDispatcherChirho: CoroutineDispatcher = Dispatchers.IO,
) {
    private val loadedGuideChirho: GreekIpaGuideChirho? by lazy(guideChirho)

    suspend fun wordsChirho(verseChirho: VerseChirho): Map<String, GreekIpaRowChirho?>? = withContext(workDispatcherChirho) {
        val guideChirho = loadedGuideChirho ?: return@withContext null
        val readingsChirho = overridesChirho()
        verseChirho.wordsChirho.filterIsInstance<GreekWordChirho>()
            .associate { it.idChirho to guideChirho.rowChirho(SpokenChirho.wordChirho(it, readingsChirho)) }
    }

    companion object {
        /** No guide: Greek passages carry no IPA line. */
        val NONE_CHIRHO = GreekIpaSourceChirho({ null }, { SpokenOverridesChirho.NONE_CHIRHO })
    }
}
