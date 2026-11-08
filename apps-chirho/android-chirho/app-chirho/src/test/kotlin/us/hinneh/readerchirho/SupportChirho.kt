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
import us.hinneh.readerchirho.audiochirho.HumanReadingChirho
import us.hinneh.readerchirho.audiochirho.ReadingSourceChirho
import us.hinneh.readerchirho.contentchirho.BookCatalogueChirho
import us.hinneh.readerchirho.contentchirho.ContentRepositoryChirho
import us.hinneh.readerchirho.contentchirho.LoadedVerseChirho
import us.hinneh.readerchirho.domainchirho.SpokenOverridesChirho
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
import us.hinneh.readerchirho.remotechirho.sha256HexChirho
import us.hinneh.readerchirho.videochirho.StagedVideosChirho
import us.hinneh.readerchirho.videochirho.VideoRecordChirho
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
class PublishedWorldChirho(rootChirho: File, dispatcherChirho: CoroutineDispatcher, stagedVideosChirho: StagedVideosChirho? = null) {
    val transportChirho = FakeTransportChirho(FileTransportChirho(rootChirho))
    private val remoteChirho = RemoteClientChirho(transportChirho, null, dispatcherChirho)
    val contentChirho = ContentRepositoryChirho(remoteChirho, { File(BUNDLED_BOOKS_CHIRHO).readBytes() }, dispatcherChirho)
    val mediaChirho = MediaRepositoryChirho(
        remoteChirho, workDispatcherChirho = dispatcherChirho, stagedVideosChirho = stagedVideosChirho, ioDispatcherChirho = dispatcherChirho,
    )
    val audioChirho = AudioRepositoryChirho(remoteChirho, workDispatcherChirho = dispatcherChirho, spokenOverridesChirho = {
        SpokenOverridesChirho.decodeChirho(File(SPOKEN_OVERRIDES_CHIRHO).readBytes())
    })

    suspend fun loadedChirho(idChirho: String): LoadedVerseChirho {
        val passageChirho = requireNotNull(PassageChirho.parseChirho(idChirho))
        val bookChirho = requireNotNull(contentChirho.catalogueChirho().bookChirho(passageChirho.bookIdChirho))
        return contentChirho.verseChirho(bookChirho, passageChirho)
    }

    companion object {
        /** The published world, or a skipped test when the static tree is unavailable. */
        fun orSkipChirho(dispatcherChirho: CoroutineDispatcher, stagedVideosChirho: StagedVideosChirho? = null): PublishedWorldChirho {
            val rootChirho = staticRootChirho()
            assumeTrue("repository static tree unavailable", rootChirho != null && File(rootChirho, "content-chirho").isDirectory)
            return PublishedWorldChirho(rootChirho!!, dispatcherChirho, stagedVideosChirho)
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

/** A verse's entries in one audio chapter: clips_chirho plus, when present, the human readings_chirho (GPT, DM #3410). */
fun audioEntriesChirho(chapterChirho: JsonObject, lessonIdChirho: String): List<JsonObject> = listOf("clips_chirho", "readings_chirho")
    .flatMap { keyChirho -> chapterChirho[keyChirho]?.jsonArray?.map { it.jsonObject }.orEmpty() }
    .filter { (it["lesson_id_chirho"] as? JsonPrimitive)?.content == lessonIdChirho }

fun publishedAudioEntriesChirho(relativePathChirho: String, lessonIdChirho: String): List<JsonObject> =
    audioEntriesChirho(Json.parseToJsonElement(File(requireNotNull(staticRootChirho()), relativePathChirho).readText()).jsonObject, lessonIdChirho)

fun JsonObject.withChirho(keyChirho: String, valueChirho: String?): JsonObject =
    JsonObject(this + (keyChirho to (valueChirho?.let(::JsonPrimitive) ?: JsonNull)))

const val BUNDLED_BOOKS_CHIRHO = "src/main/assets/library-chirho/books-chirho.json"
/** The reviewed spoken readings exported from the website (GPT, DM #3551), as the app bundles them. */
const val SPOKEN_OVERRIDES_CHIRHO = "src/main/assets/teaching-chirho/spoken-overrides-chirho.json"

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

/** A Proverbs verse's canonical-text hash and current standard scene hash in the static tree (placeholders without it). */
fun proverbsVerseIdentityChirho(lessonIdChirho: String): Pair<String, String> {
    val rootChirho = staticRootChirho() ?: return "a".repeat(64) to "c".repeat(64)
    val fileChirho = "proverbs-chirho/chapter-%02d-chirho.json".format(lessonIdChirho.split(".")[1].toInt())
    fun listChirho(folderChirho: String, keyChirho: String) =
        Json.parseToJsonElement(File(rootChirho, "$folderChirho/$fileChirho").readText()).jsonObject.getValue(keyChirho).jsonArray.map { it.jsonObject }
    val verseChirho = listChirho("content-chirho", "verses_chirho").first { (it["id_chirho"] as JsonPrimitive).content == lessonIdChirho }
    val sceneChirho = listChirho("media-chirho", "scenes_chirho").first {
        (it["lesson_id_chirho"] as JsonPrimitive).content == lessonIdChirho && ((it["variant_chirho"] as? JsonPrimitive)?.content ?: "standard") == "standard"
    }
    return sha256HexChirho((verseChirho.getValue("canonical_text_chirho") as JsonPrimitive).content.encodeToByteArray()) to
        (sceneChirho.getValue("sha256_chirho") as JsonPrimitive).content
}

/** Where a video's Be'eri sound was cut from, valid for its book (GPT, DM #3390); the window matches a 4.958 s video. */
fun sampleReadingSourceChirho(gbtIdChirho: String = "OT/RDB/Pro") = ReadingSourceChirho(
    kindChirho = "human", readerIdChirho = "rdb-chirho", gbtIdChirho = gbtIdChirho,
    packageSha256Chirho = "1".repeat(64), chapterSha256Chirho = "2".repeat(64), timingsSha256Chirho = "3".repeat(64),
    startChirho = 0.0, endChirho = 4.95, chapterDurationChirho = 169.0,
    attributionChirho = HumanReadingChirho.BEERI_ATTRIBUTION_CHIRHO, licenseChirho = HumanReadingChirho.BEERI_LICENSE_CHIRHO,
    licenseUrlChirho = HumanReadingChirho.BEERI_LICENSE_URL_CHIRHO,
)

/** A Proverbs verse video record as GPT's verse-video-chirho.ts defines it (DM #3399), bound to the verse's real text and scene. */
fun sampleVideoChirho(lessonIdChirho: String = "Prov.1.1", sha256Chirho: String = "b".repeat(64)): VideoRecordChirho {
    val (canonicalChirho, sceneChirho) = proverbsVerseIdentityChirho(lessonIdChirho)
    return VideoRecordChirho(
        lessonIdChirho = lessonIdChirho,
        assetPathChirho = "/video-chirho/sha256-chirho/$sha256Chirho-chirho.mp4",
        sha256Chirho = sha256Chirho,
        bytesChirho = 1_551_755,
        durationChirho = 4.958,
        widthChirho = 1108,
        heightChirho = 832,
        sceneSha256Chirho = sceneChirho,
        canonicalSha256Chirho = canonicalChirho,
        readingLanguageChirho = "he",
        embeddedReadingChirho = sampleReadingSourceChirho(),
        attributionChirho = HumanReadingChirho.BEERI_ATTRIBUTION_CHIRHO,
        licenseChirho = HumanReadingChirho.BEERI_LICENSE_CHIRHO,
        licenseUrlChirho = HumanReadingChirho.BEERI_LICENSE_URL_CHIRHO,
        reviewChirho = "pending",
    )
}

/** Staged development videos held in memory. */
class FixedStagedVideosChirho(vararg recordsChirho: VideoRecordChirho) : StagedVideosChirho {
    private val byVerseChirho = recordsChirho.associateBy { it.lessonIdChirho }
    override fun recordChirho(verseIdChirho: String): VideoRecordChirho? = byVerseChirho[verseIdChirho]
    override fun bytesChirho(recordChirho: VideoRecordChirho): ByteArray? = null
}
