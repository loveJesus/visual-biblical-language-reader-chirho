// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
package us.hinneh.readerchirho

import kotlinx.coroutines.CompletableDeferred
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonNull
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import org.junit.Assume.assumeTrue
import us.hinneh.readerchirho.audiochirho.AudioRepositoryChirho
import us.hinneh.readerchirho.contentchirho.BookCatalogueChirho
import us.hinneh.readerchirho.contentchirho.ContentRepositoryChirho
import us.hinneh.readerchirho.contentchirho.LoadedVerseChirho
import us.hinneh.readerchirho.domainchirho.PassageChirho
import us.hinneh.readerchirho.mediachirho.MediaRepositoryChirho
import us.hinneh.readerchirho.remotechirho.RemoteClientChirho
import us.hinneh.readerchirho.contentchirho.GreekVerseChirho
import us.hinneh.readerchirho.contentchirho.GreekWordChirho
import us.hinneh.readerchirho.contentchirho.HebrewVerseChirho
import us.hinneh.readerchirho.contentchirho.HebrewWordChirho
import us.hinneh.readerchirho.contentchirho.SourceChirho
import us.hinneh.readerchirho.remotechirho.RemoteFailureChirho
import us.hinneh.readerchirho.remotechirho.TransportChirho
import java.io.File
import java.io.IOException
import java.net.URL
import java.util.Collections

/** The bundled identities-only book list, exactly as the app ships it. */
fun bundledCatalogueChirho(): BookCatalogueChirho =
    BookCatalogueChirho.decodeChirho(File(BUNDLED_BOOKS_CHIRHO).readBytes(), liveChirho = false)

/** This repository's published static tree, or null when the tests run outside the repository. */
fun staticRootChirho(): File? = System.getProperty("hinneh.staticRootChirho")?.let(::File)?.takeIf { it.isDirectory }

/** Serves fixed bytes by path, else its fallback; records requests and fails or holds chosen paths. */
class FakeTransportChirho(private val fallbackChirho: TransportChirho? = null) : TransportChirho {
    private val routesChirho = mutableMapOf<String, ByteArray>()
    val requestsChirho: MutableList<String> = Collections.synchronizedList(mutableListOf())
    val gatesChirho = mutableMapOf<String, CompletableDeferred<Unit>>()
    val failingChirho: MutableSet<String> = Collections.synchronizedSet(mutableSetOf())

    fun putChirho(pathChirho: String, textChirho: String) {
        routesChirho[pathChirho] = textChirho.encodeToByteArray()
    }

    fun putChirho(pathChirho: String, bytesChirho: ByteArray) {
        routesChirho[pathChirho] = bytesChirho
    }

    override suspend fun getChirho(urlChirho: URL, limitChirho: Int): ByteArray {
        val pathChirho = urlChirho.path
        requestsChirho.add(pathChirho)
        gatesChirho[pathChirho]?.await()
        if (pathChirho in failingChirho) throw RemoteFailureChirho.NetworkChirho(IOException("offline"))
        val bytesChirho = routesChirho[pathChirho]
            ?: return fallbackChirho?.getChirho(urlChirho, limitChirho) ?: throw RemoteFailureChirho.HttpChirho(404)
        if (bytesChirho.size > limitChirho) throw RemoteFailureChirho.TooLargeChirho(limitChirho)
        return bytesChirho
    }
}

/** The repository's published static tree behind a controllable transport, as the app reads it. */
class PublishedWorldChirho(rootChirho: File, dispatcherChirho: CoroutineDispatcher) {
    val transportChirho = FakeTransportChirho(FileTransportChirho(rootChirho))
    private val remoteChirho = RemoteClientChirho(transportChirho, null, dispatcherChirho)
    val contentChirho = ContentRepositoryChirho(remoteChirho, { File(BUNDLED_BOOKS_CHIRHO).readBytes() }, dispatcherChirho)
    val mediaChirho = MediaRepositoryChirho(remoteChirho, workDispatcherChirho = dispatcherChirho)
    val audioChirho = AudioRepositoryChirho(remoteChirho, workDispatcherChirho = dispatcherChirho)

    suspend fun loadedChirho(idChirho: String): LoadedVerseChirho {
        val passageChirho = requireNotNull(PassageChirho.parseChirho(idChirho))
        val bookChirho = requireNotNull(contentChirho.catalogueChirho().bookChirho(passageChirho.bookIdChirho))
        return contentChirho.verseChirho(bookChirho, passageChirho)
    }

    companion object {
        /** The published world, or a skipped test when the static tree is unavailable. */
        fun orSkipChirho(dispatcherChirho: CoroutineDispatcher): PublishedWorldChirho {
            val rootChirho = staticRootChirho()
            assumeTrue("repository static tree unavailable", rootChirho != null && File(rootChirho, "content-chirho").isDirectory)
            return PublishedWorldChirho(rootChirho!!, dispatcherChirho)
        }
    }
}

/** One published JSON record list from the static tree, filtered to a verse. */
fun publishedRecordsChirho(relativePathChirho: String, listKeyChirho: String, lessonIdChirho: String): List<JsonObject> {
    val rootChirho = requireNotNull(staticRootChirho())
    val objectChirho = Json.parseToJsonElement(File(rootChirho, relativePathChirho).readText()).jsonObject
    return objectChirho.getValue(listKeyChirho).jsonArray.map { it.jsonObject }
        .filter { (it["lesson_id_chirho"] as? JsonPrimitive)?.content == lessonIdChirho }
}

fun JsonObject.withChirho(keyChirho: String, valueChirho: String?): JsonObject =
    JsonObject(this + (keyChirho to (valueChirho?.let(::JsonPrimitive) ?: JsonNull)))

const val BUNDLED_BOOKS_CHIRHO = "src/main/assets/library-chirho/books-chirho.json"

val SOURCE_CHIRHO = SourceChirho(
    idChirho = "oshb-prov-chirho", titleChirho = "Open Scriptures Hebrew Bible", urlChirho = "https://github.com/openscriptures/morphhb",
    revisionChirho = "r1", sha256Chirho = "a".repeat(64), licenseChirho = "CC BY 4.0", attributionChirho = "OSHB",
)

fun hebrewWordChirho(
    idChirho: String,
    textChirho: String,
    startChirho: Int,
    segmentsChirho: List<String> = listOf(textChirho),
    posChirho: String = "noun",
    genderChirho: String = "masculine",
    numberChirho: String = "singular",
    stateChirho: String = "absolute",
    lemmaChirho: String = "H7950",
    augmentChirho: String? = null,
    glossChirho: String? = "snow",
) = HebrewWordChirho(
    idChirho = idChirho, textChirho = textChirho, segmentsChirho = segmentsChirho, startChirho = startChirho,
    endChirho = startChirho + textChirho.length, rawMorphologyChirho = "HNcmsa", lemmaIdChirho = lemmaChirho,
    lemmaAugmentChirho = augmentChirho, lexicalFormChirho = textChirho, posChirho = posChirho, genderChirho = genderChirho,
    numberChirho = numberChirho, stateChirho = stateChirho, rootTextChirho = null, rootEntryIdChirho = null,
    rootStatusChirho = "unresolved", rootNoteChirho = "No root is assigned.", glossChirho = glossChirho,
    analysisChirho = "noun", sourceNoteChirho = "From the pinned source.",
)

/** Prov.1.1 with two words separated by a space and a sof pasuq after the last word. */
fun hebrewVerseChirho(): HebrewVerseChirho {
    val canonicalChirho = "כשלג בקיץ׃"
    return HebrewVerseChirho(
        schemaVersionChirho = 1, idChirho = "Prov.1.1", languageChirho = "he", referenceChirho = "Proverbs 1:1",
        canonicalTextChirho = canonicalChirho, translationChirho = null,
        tokensChirho = listOf(
            hebrewWordChirho("20aAa", "כשלג", 0, segmentsChirho = listOf("כ", "שלג")),
            hebrewWordChirho("20aAb", "בקיץ", 5, lemmaChirho = "H7019", glossChirho = "summer"),
        ),
        sourcesChirho = listOf(SOURCE_CHIRHO),
    )
}

fun greekWordChirho(idChirho: String, textChirho: String, startChirho: Int, lemmaChirho: String, lexicalChirho: String, partChirho: String = "noun") =
    GreekWordChirho(
        idChirho = idChirho, textChirho = textChirho, segmentsChirho = listOf(textChirho), startChirho = startChirho,
        endChirho = startChirho + textChirho.length, rawMorphologyChirho = "N-NSM", rawFormMorphologyChirho = "N-NSM",
        rawStrongsChirho = lemmaChirho.removePrefix("G"), lemmaIdChirho = lemmaChirho, lexicalFormChirho = lexicalChirho,
        partOfSpeechChirho = partChirho, caseChirho = "nominative", numberChirho = "singular", genderChirho = "masculine",
        glossChirho = "word", analysisChirho = "noun", sourceNoteChirho = "Uncurated parse.",
    )

/** John.1.1 fragment: "ὁ λόγος." with an article that carries a rough breathing. */
fun greekVerseChirho(): GreekVerseChirho = GreekVerseChirho(
    schemaVersionChirho = 1, idChirho = "John.1.1", languageChirho = "grc", referenceChirho = "John 1:1",
    canonicalTextChirho = "ὁ λόγος.", translationChirho = null, glossOriginChirho = "berean_interlinear",
    tokensChirho = listOf(
        greekWordChirho("John.1.1!1", "ὁ", 0, "G3588", "ὁ", partChirho = "article"),
        greekWordChirho("John.1.1!2", "λόγος", 2, "G3056", "λόγος"),
    ),
    sourcesChirho = listOf("nestle1904-morph-chirho", "nestle1904-parsing-chirho", "berean-glosses-chirho").map {
        SOURCE_CHIRHO.copy(idChirho = it, urlChirho = "https://github.com/biblicalhumanities/Nestle1904")
    },
)

/** Serves this repository's static files as if they were the trusted origin, read-only. */
class FileTransportChirho(private val rootChirho: File) : TransportChirho {
    override suspend fun getChirho(urlChirho: URL, limitChirho: Int): ByteArray {
        val fileChirho = File(rootChirho, urlChirho.path.removePrefix("/"))
        if (!fileChirho.canonicalPath.startsWith(rootChirho.canonicalPath) || !fileChirho.isFile) {
            throw RemoteFailureChirho.HttpChirho(404)
        }
        val bytesChirho = fileChirho.readBytes()
        if (bytesChirho.size > limitChirho) throw RemoteFailureChirho.TooLargeChirho(limitChirho)
        return bytesChirho
    }
}
