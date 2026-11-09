// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
package us.hinneh.readerchirho.audiochirho

import kotlinx.coroutines.runBlocking
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonNull
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Assume.assumeTrue
import org.junit.Test
import us.hinneh.readerchirho.FileTransportChirho
import us.hinneh.readerchirho.SPOKEN_OVERRIDES_CHIRHO
import us.hinneh.readerchirho.bundledCatalogueChirho
import us.hinneh.readerchirho.contentchirho.ContentRepositoryChirho
import us.hinneh.readerchirho.contentchirho.GreekWordChirho
import us.hinneh.readerchirho.domainchirho.PassageChirho
import us.hinneh.readerchirho.domainchirho.SpokenChirho
import us.hinneh.readerchirho.domainchirho.SpokenOverridesChirho
import us.hinneh.readerchirho.remotechirho.RemoteClientChirho
import us.hinneh.readerchirho.remotechirho.sha256HexChirho
import us.hinneh.readerchirho.staticRootChirho
import java.io.File
import java.text.Normalizer

/**
 * Root's bundled draft Greek IPA guide (unit 175, contract-chirho.json), read exactly as the app reads it. Expected
 * values come from the bundled files themselves, never from strings typed here, so a regenerated export is checked by
 * the same rules: exact bytes only, every check failing quietly, and no profile standing in for another.
 */
class GreekIpaGuideTestChirho {
    private val directoryChirho = File(GUIDE_DIRECTORY_CHIRHO)

    private fun bundledChirho(nameChirho: String): ByteArray? = File(directoryChirho, nameChirho).takeIf { it.isFile }?.readBytes()

    private fun partNameChirho(indexChirho: Int) = "greek-ipa-part-%02d-chirho.json".format(indexChirho)

    private fun objectChirho(bytesChirho: ByteArray): JsonObject = Json.parseToJsonElement(bytesChirho.decodeToString()).jsonObject

    /** A part's row as the file records it (the first unless [atChirho] says otherwise): its text and its three values. */
    private fun firstRowChirho(indexChirho: Int, atChirho: Int = 0): Pair<String, JsonObject> {
        val entriesChirho = objectChirho(requireNotNull(bundledChirho(partNameChirho(indexChirho))))["entries_chirho"]!!.jsonObject
        val rowChirho = entriesChirho.values.elementAt(atChirho).jsonObject
        return rowChirho["text_chirho"]!!.jsonPrimitive.content to rowChirho["ipa_chirho"]!!.jsonObject
    }

    private fun recordedChirho(valuesChirho: JsonObject, profileChirho: String): String? =
        (valuesChirho[profileChirho] as? JsonPrimitive)?.takeIf { it.isString }?.content

    /** The bundled files with [changesChirho] served in their place (a null change reads as a missing file). */
    private fun guideChirho(changesChirho: Map<String, ByteArray?> = emptyMap()): GreekIpaGuideChirho? =
        GreekIpaGuideChirho.loadChirho { nameChirho -> if (nameChirho in changesChirho) changesChirho[nameChirho] else bundledChirho(nameChirho) }

    private fun manifestChirho(): JsonObject = objectChirho(requireNotNull(bundledChirho(GreekIpaGuideChirho.MANIFEST_CHIRHO)))

    private fun JsonObject.withChirho(keyChirho: String, valueChirho: JsonElement) = JsonObject(this + (keyChirho to valueChirho))

    private fun encodedChirho(objectChirho: JsonObject) = objectChirho.toString().encodeToByteArray()

    /** The manifest as a consistent export would record part [indexChirho] after it changed to [bytesChirho]. */
    private fun manifestForChirho(indexChirho: Int, bytesChirho: ByteArray): ByteArray {
        val manifestChirho = manifestChirho()
        val partsChirho = manifestChirho["parts_chirho"] as JsonArray
        val rewrittenChirho = JsonArray(
            partsChirho.mapIndexed { atChirho, partChirho ->
                if (atChirho != indexChirho) partChirho
                else partChirho.jsonObject
                    .withChirho("bytes_chirho", JsonPrimitive(bytesChirho.size))
                    .withChirho("sha256_chirho", JsonPrimitive(sha256HexChirho(bytesChirho)))
            },
        )
        return encodedChirho(manifestChirho.withChirho("parts_chirho", rewrittenChirho))
    }

    /** Part [indexChirho] with its first row changed by [editChirho], and a manifest that records the change. */
    private fun editedPartChirho(indexChirho: Int, editChirho: (JsonObject) -> JsonObject): Map<String, ByteArray?> {
        val partChirho = objectChirho(requireNotNull(bundledChirho(partNameChirho(indexChirho))))
        val entriesChirho = partChirho["entries_chirho"]!!.jsonObject
        val firstKeyChirho = entriesChirho.keys.first()
        val changedChirho = JsonObject(entriesChirho + (firstKeyChirho to editChirho(entriesChirho.getValue(firstKeyChirho).jsonObject)))
        val bytesChirho = encodedChirho(partChirho.withChirho("entries_chirho", changedChirho))
        return mapOf(partNameChirho(indexChirho) to bytesChirho, GreekIpaGuideChirho.MANIFEST_CHIRHO to manifestForChirho(indexChirho, bytesChirho))
    }

    @Test
    fun theBundledGuideAnswersEachPartsRowsWithTheirRecordedValues() {
        val guideChirho = requireNotNull(guideChirho()) { "the bundled guide must load" }
        for (indexChirho in 0 until 8) {
            val (textChirho, valuesChirho) = firstRowChirho(indexChirho)
            val rowChirho = requireNotNull(guideChirho.rowChirho(textChirho)) { "part $indexChirho: $textChirho" }
            assertEquals(recordedChirho(valuesChirho, "modern"), rowChirho.valueChirho(GreekRenditionChirho.MODERN_CHIRHO))
            assertEquals(recordedChirho(valuesChirho, "modern_aspirates"), rowChirho.valueChirho(GreekRenditionChirho.MODERN_ASPIRATES_CHIRHO))
            assertEquals(recordedChirho(valuesChirho, "erasmian"), rowChirho.valueChirho(GreekRenditionChirho.ERASMIAN_CHIRHO))
        }
    }

    /** UTF-8 bytes, not normalized text (GPT, DM #3677): a decomposed, padded or re-cased form is a different form. */
    @Test
    fun onlyTheExactSpokenBytesMatch() {
        val guideChirho = requireNotNull(guideChirho())
        val (textChirho, _) = (0 until 8).map { firstRowChirho(it) }
            .first { (textChirho, _) -> Normalizer.normalize(textChirho, Normalizer.Form.NFD) != textChirho }
        assertNotNull(guideChirho.rowChirho(textChirho))
        assertNull("decomposed", guideChirho.rowChirho(Normalizer.normalize(textChirho, Normalizer.Form.NFD)))
        assertNull("padded", guideChirho.rowChirho(" $textChirho"))
        assertNull("re-cased", guideChirho.rowChirho(textChirho.uppercase()))
        assertNull("empty", guideChirho.rowChirho(""))
    }

    @Test
    fun aMissingOrChangedManifestLeavesNoGuide() {
        val manifestChirho = manifestChirho()
        val limitsChirho = manifestChirho["limits_chirho"]!!.jsonObject
        val brokenChirho = mapOf(
            "missing" to null,
            "another recipe" to encodedChirho(manifestChirho.withChirho("recipe_id_chirho", JsonPrimitive("other-recipe-chirho"))),
            "another profile list" to encodedChirho(manifestChirho.withChirho("profiles_chirho", JsonArray(listOf(JsonPrimitive("modern"))))),
            "a widened bound" to encodedChirho(manifestChirho.withChirho("limits_chirho", limitsChirho.withChirho("max_forms_chirho", JsonPrimitive(25_001)))),
            "a count that disagrees" to encodedChirho(manifestChirho.withChirho("form_count_chirho", JsonPrimitive(1))),
            "a renamed part" to encodedChirho(
                manifestChirho.withChirho(
                    "parts_chirho",
                    JsonArray((manifestChirho["parts_chirho"] as JsonArray).mapIndexed { atChirho, partChirho ->
                        if (atChirho == 0) partChirho.jsonObject.withChirho("file_chirho", JsonPrimitive("../other-chirho.json")) else partChirho
                    }),
                ),
            ),
            "oversize" to (encodedChirho(manifestChirho).decodeToString() + " ".repeat(131_072)).encodeToByteArray(),
            "not JSON" to "{".encodeToByteArray(),
        )
        for ((nameChirho, bytesChirho) in brokenChirho) {
            assertNull(nameChirho, guideChirho(mapOf(GreekIpaGuideChirho.MANIFEST_CHIRHO to bytesChirho)))
        }
    }

    /**
     * A changed, missing or misplaced part is unavailable as a whole, even its untouched rows, since it is no longer
     * the export the manifest describes; the other parts still answer.
     */
    @Test
    fun aChangedPartIsUnavailableWhileTheOthersAnswer() {
        val (otherTextChirho, _) = firstRowChirho(1)
        val (textChirho, _) = firstRowChirho(0)
        val (untouchedTextChirho, _) = firstRowChirho(0, atChirho = 1)
        val partChirho = requireNotNull(bundledChirho(partNameChirho(0)))
        val flippedChirho = partChirho.copyOf().also { it[it.size / 2] = (it[it.size / 2].toInt() xor 1).toByte() }
        val changesChirho = mapOf(
            "a flipped byte" to mapOf(partNameChirho(0) to flippedChirho),
            "a missing part" to mapOf(partNameChirho(0) to null),
            "the wrong part's file" to mapOf(partNameChirho(0) to bundledChirho(partNameChirho(1))),
            "a row whose text is not its key" to editedPartChirho(0) { it.withChirho("text_chirho", JsonPrimitive("$textChirho·")) },
            "an extra field" to editedPartChirho(0) { it.withChirho("note_chirho", JsonPrimitive("x")) },
            "an empty value" to editedPartChirho(0) {
                it.withChirho("ipa_chirho", it["ipa_chirho"]!!.jsonObject.withChirho("modern", JsonPrimitive("")))
            },
        )
        for ((nameChirho, changeChirho) in changesChirho) {
            val guideChirho = requireNotNull(guideChirho(changeChirho)) { "$nameChirho: the manifest itself still verifies" }
            assertNull(nameChirho, guideChirho.rowChirho(textChirho))
            assertNull("$nameChirho: the rest of that part is not trusted either", guideChirho.rowChirho(untouchedTextChirho))
            assertNotNull("$nameChirho: another part still answers", guideChirho.rowChirho(otherTextChirho))
        }
    }

    /** A profile the guide gives no value for stays unavailable; neither of the others stands in for it. */
    @Test
    fun eachProfileAnswersAloneWithoutFallback() {
        val (textChirho, valuesChirho) = firstRowChirho(0)
        val changedChirho = editedPartChirho(0) { it.withChirho("ipa_chirho", it["ipa_chirho"]!!.jsonObject.withChirho("erasmian", JsonNull)) }
        val rowChirho = requireNotNull(requireNotNull(guideChirho(changedChirho)).rowChirho(textChirho))
        assertNull(rowChirho.valueChirho(GreekRenditionChirho.ERASMIAN_CHIRHO))
        assertEquals(recordedChirho(valuesChirho, "modern"), rowChirho.valueChirho(GreekRenditionChirho.MODERN_CHIRHO))
        assertEquals(recordedChirho(valuesChirho, "modern_aspirates"), rowChirho.valueChirho(GreekRenditionChirho.MODERN_ASPIRATES_CHIRHO))
    }

    /**
     * Every Greek word in the published content, spoken as the app speaks it (SpokenChirho.wordChirho with the bundled
     * reviewed readings), is in the guide with all three values. John is read whole; every other Greek book's first
     * chapter too, and all of them with -Phinneh.fullCorpusChirho=true, where the distinct forms must match the export.
     */
    @Test
    fun everyPublishedGreekWordHasItsThreeValues() = runBlocking {
        val rootChirho = staticRootChirho()
        assumeTrue("repository static tree unavailable", rootChirho != null && File(rootChirho, "content-chirho").isDirectory)
        val fullChirho = System.getProperty("hinneh.fullCorpusChirho") == "true"
        val guideChirho = requireNotNull(guideChirho())
        val overridesChirho = SpokenOverridesChirho.decodeChirho(File(SPOKEN_OVERRIDES_CHIRHO).readBytes())
        val repositoryChirho = ContentRepositoryChirho(RemoteClientChirho(FileTransportChirho(rootChirho!!), null), { ByteArray(0) })
        val formsChirho = mutableSetOf<String>()
        val missingChirho = mutableListOf<String>()
        var wordsChirho = 0
        for (bookChirho in bundledCatalogueChirho().booksChirho.filter { it.greekChirho }) {
            val manifestChirho = repositoryChirho.manifestChirho(bookChirho)
            val chaptersChirho = if (fullChirho || bookChirho.idChirho == "John") manifestChirho.chaptersChirho else manifestChirho.chaptersChirho.take(1)
            for (entryChirho in chaptersChirho) {
                for (verseNumberChirho in entryChirho.versesChirho) {
                    val verseChirho = repositoryChirho.verseChirho(bookChirho, PassageChirho(bookChirho.idChirho, entryChirho.numberChirho, verseNumberChirho)).verseChirho
                    for (wordChirho in verseChirho.wordsChirho.filterIsInstance<GreekWordChirho>()) {
                        wordsChirho++
                        val spokenChirho = SpokenChirho.wordChirho(wordChirho, overridesChirho)
                        formsChirho += spokenChirho
                        val rowChirho = guideChirho.rowChirho(spokenChirho)
                        if (rowChirho == null || GreekRenditionChirho.entries.any { rowChirho.valueChirho(it) == null }) {
                            missingChirho += "${verseChirho.idChirho} $spokenChirho"
                        }
                    }
                }
            }
        }
        println("Greek IPA guide: $wordsChirho words, ${formsChirho.size} distinct forms, missing ${missingChirho.size}")
        assertTrue(missingChirho.take(20).joinToString("\n"), missingChirho.isEmpty())
        if (fullChirho) {
            assertEquals("the app's spoken forms are exactly the exported ones", manifestChirho()["form_count_chirho"]!!.jsonPrimitive.content.toInt(), formsChirho.size)
        }
    }

    private companion object {
        /** The guide as the app bundles it (contract android_directory_chirho), relative to the module. */
        const val GUIDE_DIRECTORY_CHIRHO = "src/main/assets/teaching-chirho/greek-ipa-chirho"
    }
}
