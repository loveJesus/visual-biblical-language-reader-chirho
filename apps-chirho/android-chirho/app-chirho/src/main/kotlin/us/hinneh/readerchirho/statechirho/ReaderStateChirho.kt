// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
package us.hinneh.readerchirho.statechirho

import us.hinneh.readerchirho.audiochirho.AudioSelectionChirho
import us.hinneh.readerchirho.audiochirho.ClipChirho
import us.hinneh.readerchirho.audiochirho.GreekRenditionChirho
import us.hinneh.readerchirho.audiochirho.VerseRecordingsChirho
import us.hinneh.readerchirho.contentchirho.BookCatalogueChirho
import us.hinneh.readerchirho.contentchirho.BookManifestChirho
import us.hinneh.readerchirho.contentchirho.LoadedVerseChirho
import us.hinneh.readerchirho.domainchirho.PassageChirho
import us.hinneh.readerchirho.mediachirho.VerseMediaChirho
import us.hinneh.readerchirho.videochirho.VideoRecordChirho

enum class FailureChirho { BOOK_CHIRHO, VERSE_CHIRHO, ABSENT_CHIRHO }

/** What a verse's Play plays: its video with the video's own reading, its recording alone, or nothing. */
enum class VersePlayChirho { VIDEO_CHIRHO, RECORDING_CHIRHO, NONE_CHIRHO }

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
    /** The reader's saved Greek choice; null until one is made, which means automatic. */
    val renditionChoiceChirho: GreekRenditionChirho? = null,
    val speedChoiceChirho: Float? = null,
    /** This visit's verse video failed to play; cleared when another passage loads. */
    val videoFailedChirho: Boolean = false,
    /** Whether a fresh launch opens today's Proverbs (on) or the last verse shown (off). */
    val openTodayChirho: Boolean = ReaderPreferencesChirho.DEFAULT_OPEN_TODAY_CHIRHO,
    /** Whether a verse the reader moves to starts its Play by itself. */
    val autoplayChirho: Boolean = ReaderPreferencesChirho.DEFAULT_AUTOPLAY_CHIRHO,
) {
    val greekChirho: Boolean get() = catalogueChirho?.bookChirho(passageChirho.bookIdChirho)?.greekChirho == true

    /**
     * The Greek reading in effect. With no saved choice it follows the website (AudioVerseChirho.svelte):
     * Modern with Aspirates when this verse has an Aspirates verse reading, otherwise Modern. Either way a
     * plain Modern recording never stands in for Aspirates in a rough-breathing verse (compatibleChirho).
     */
    val renditionChirho: GreekRenditionChirho
        get() = renditionChoiceChirho ?: if (greekChirho) automaticRenditionChirho(recordingsChirho) else GreekRenditionChirho.MODERN_ASPIRATES_CHIRHO

    /** Normal for Hebrew and Greek, as on the website since 2026-11-03 (L.J.: "let's start at normal"). */
    val speedChirho: Float get() = speedChoiceChirho ?: DEFAULT_SPEED_CHIRHO

    /** The verse recording Play would play under the reading now in effect, if any. */
    val verseClipChirho: ClipChirho?
        get() = (recordingsChirho as? OptionalChirho.ReadyChirho)?.valueChirho
            ?.let { AudioSelectionChirho.bestChirho(it.versesChirho, greekChirho, renditionChirho) }

    /**
     * The verse video shown in the scene's place and played by Play. As on the website (speech-controls), a video
     * that failed is not tried again on this visit while a recording can be read over the still instead; with no
     * recording to fall back on, Play may try the video again.
     */
    val playableVideoChirho: VideoRecordChirho?
        get() {
            val videoChirho = (mediaChirho as? OptionalChirho.ReadyChirho)?.valueChirho?.videoChirho ?: return null
            return if (videoFailedChirho && verseClipChirho != null) null else videoChirho
        }

    /**
     * What the verse's Play plays now, and so what its label names (L.J., via GPT DM #3653): the playable video,
     * which is verified, selected for this verse and scene, and not failed on this visit while a recording can
     * stand in; otherwise the verse's recording.
     */
    val versePlayChirho: VersePlayChirho
        get() = when {
            playableVideoChirho != null -> VersePlayChirho.VIDEO_CHIRHO
            verseClipChirho != null -> VersePlayChirho.RECORDING_CHIRHO
            else -> VersePlayChirho.NONE_CHIRHO
        }

    /** Whether Previous/Next (button or swipe) has a verse to go to; a manifest of another book does not count. */
    fun canStepChirho(forwardChirho: Boolean): Boolean {
        val currentManifestChirho = manifestChirho?.takeIf { it.bookIdChirho == passageChirho.bookIdChirho } ?: return false
        return neighborChirho(currentManifestChirho, passageChirho, forwardChirho) != null
    }

    companion object {
        const val DEFAULT_SPEED_CHIRHO = 1f

        /** Until the verse's recordings arrive, the preferred Modern with Aspirates stands. */
        fun automaticRenditionChirho(recordingsChirho: OptionalChirho<VerseRecordingsChirho>): GreekRenditionChirho {
            val readyChirho = recordingsChirho as? OptionalChirho.ReadyChirho ?: return GreekRenditionChirho.MODERN_ASPIRATES_CHIRHO
            return if (readyChirho.valueChirho.versesChirho.any { it.pronunciationChirho == "modern_greek_aspirates" }) {
                GreekRenditionChirho.MODERN_ASPIRATES_CHIRHO
            } else {
                GreekRenditionChirho.MODERN_CHIRHO
            }
        }
    }
}

/** Saved reading choices. Null means not chosen. */
interface ReaderPreferencesChirho {
    var renditionChirho: GreekRenditionChirho?
    var speedChirho: Float?
    /** Whether a fresh launch opens today's Proverbs; off, it opens [lastShownChirho]. */
    var openTodayChirho: Boolean
    /** Whether a verse change the reader makes starts that verse's Play by itself. */
    var autoplayChirho: Boolean
    /** The last verse shown, for a fresh launch with [openTodayChirho] off. */
    var lastShownChirho: PassageChirho?

    companion object {
        /** Root's defaults (GPT, DM #3642): today's Proverbs on, autoplay off. */
        const val DEFAULT_OPEN_TODAY_CHIRHO = true
        const val DEFAULT_AUTOPLAY_CHIRHO = false
    }
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
