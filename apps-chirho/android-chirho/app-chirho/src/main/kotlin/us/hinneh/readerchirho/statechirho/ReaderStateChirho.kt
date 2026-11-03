// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
package us.hinneh.readerchirho.statechirho

import us.hinneh.readerchirho.audiochirho.GreekRenditionChirho
import us.hinneh.readerchirho.audiochirho.VerseRecordingsChirho
import us.hinneh.readerchirho.contentchirho.BookCatalogueChirho
import us.hinneh.readerchirho.contentchirho.BookManifestChirho
import us.hinneh.readerchirho.contentchirho.LoadedVerseChirho
import us.hinneh.readerchirho.domainchirho.PassageChirho
import us.hinneh.readerchirho.mediachirho.VerseMediaChirho

enum class FailureChirho { BOOK_CHIRHO, VERSE_CHIRHO, ABSENT_CHIRHO }

sealed interface VerseLoadChirho {
    data object LoadingChirho : VerseLoadChirho
    data class ReadyChirho(val loadedChirho: LoadedVerseChirho) : VerseLoadChirho
    data class FailedChirho(val failureChirho: FailureChirho) : VerseLoadChirho
}

/** Optional media and audio: their absence or failure never removes the verified text. */
sealed interface OptionalChirho<out T> {
    data object LoadingChirho : OptionalChirho<Nothing>
    data class ReadyChirho<T>(val valueChirho: T) : OptionalChirho<T>
    data object UnavailableChirho : OptionalChirho<Nothing>
}

data class ReaderUiStateChirho(
    val passageChirho: PassageChirho,
    val catalogueChirho: BookCatalogueChirho? = null,
    val manifestChirho: BookManifestChirho? = null,
    val verseChirho: VerseLoadChirho = VerseLoadChirho.LoadingChirho,
    val mediaChirho: OptionalChirho<VerseMediaChirho> = OptionalChirho.LoadingChirho,
    val recordingsChirho: OptionalChirho<VerseRecordingsChirho> = OptionalChirho.LoadingChirho,
    val renditionChirho: GreekRenditionChirho = GreekRenditionChirho.MODERN_ASPIRATES_CHIRHO,
    val speedChoiceChirho: Float? = null,
) {
    val greekChirho: Boolean get() = catalogueChirho?.bookChirho(passageChirho.bookIdChirho)?.greekChirho == true

    /** The website's defaults: Greek 12% slower (0.88), Hebrew gentle (0.85). */
    val speedChirho: Float get() = speedChoiceChirho ?: if (greekChirho) 0.88f else 0.85f
}

/** Saved reading choices; the passage itself is never persisted across fresh launches. */
interface ReaderPreferencesChirho {
    var renditionChirho: GreekRenditionChirho
    var speedChirho: Float?
}

/** Previous/next by the published verse numbering, crossing chapters but not books. */
fun neighborChirho(manifestChirho: BookManifestChirho, passageChirho: PassageChirho, forwardChirho: Boolean): PassageChirho? {
    val chaptersChirho = manifestChirho.chaptersChirho
    val versesChirho = chaptersChirho.getOrNull(passageChirho.chapterChirho - 1)?.versesChirho ?: return null
    val indexChirho = versesChirho.indexOf(passageChirho.verseChirho)
    if (indexChirho < 0) return null
    return if (forwardChirho) {
        versesChirho.getOrNull(indexChirho + 1)?.let { passageChirho.copy(verseChirho = it) }
            ?: chaptersChirho.getOrNull(passageChirho.chapterChirho)?.let {
                PassageChirho(passageChirho.bookIdChirho, it.numberChirho, it.versesChirho.first())
            }
    } else {
        versesChirho.getOrNull(indexChirho - 1)?.let { passageChirho.copy(verseChirho = it) }
            ?: chaptersChirho.getOrNull(passageChirho.chapterChirho - 2)?.let {
                PassageChirho(passageChirho.bookIdChirho, it.numberChirho, it.versesChirho.last())
            }
    }
}
