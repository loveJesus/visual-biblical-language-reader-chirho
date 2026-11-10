// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
package us.hinneh.readerchirho.statechirho

import us.hinneh.readerchirho.audiochirho.AudioSelectionChirho
import us.hinneh.readerchirho.audiochirho.ClipChirho
import us.hinneh.readerchirho.audiochirho.GreekIpaRowChirho
import us.hinneh.readerchirho.audiochirho.GreekRenditionChirho
import us.hinneh.readerchirho.audiochirho.VerseRecordingsChirho
import us.hinneh.readerchirho.contentchirho.BookCatalogueChirho
import us.hinneh.readerchirho.contentchirho.BookManifestChirho
import us.hinneh.readerchirho.contentchirho.GreekWordChirho
import us.hinneh.readerchirho.contentchirho.HebrewWordChirho
import us.hinneh.readerchirho.contentchirho.LoadedVerseChirho
import us.hinneh.readerchirho.contentchirho.WordChirho
import us.hinneh.readerchirho.domainchirho.PassageChirho
import us.hinneh.readerchirho.mediachirho.VerseMediaChirho
import us.hinneh.readerchirho.videochirho.VideoRecordChirho
import us.hinneh.readerchirho.videochirho.VideoSelectionChirho

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
    /** Whether word boxes show the IPA line (Show IPA in Settings). */
    val showIpaChirho: Boolean = ReaderPreferencesChirho.DEFAULT_SHOW_IPA_CHIRHO,
    /** A Greek verse's guide rows by word id, looked up once Show IPA is on; null until then or with no guide. */
    val greekIpaChirho: Map<String, GreekIpaRowChirho?>? = null,
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

    /**
     * The one clip a word's speaker plays under the reading now in effect. The speaker, the view model's word play
     * and the IPA line all read it here, so a word's IPA can never come from a different recording.
     */
    fun wordClipChirho(wordIdChirho: String): ClipChirho? =
        (recordingsChirho as? OptionalChirho.ReadyChirho)?.valueChirho
            ?.let { AudioSelectionChirho.bestChirho(it.wordsChirho[wordIdChirho], greekChirho, renditionChirho) }

    /**
     * Whether word boxes carry an IPA line: Show IPA is on and the passage has an IPA source. Hebrew takes IPA from
     * its accepted word recordings; Greek from root's bundled draft guide, once its rows for this verse are looked up.
     */
    val ipaLineChirho: Boolean get() = showIpaChirho && (!greekChirho || greekIpaChirho != null)

    /**
     * A word's IPA for that line (GPT, DM #3669). A Hebrew word's comes only from the clip its speaker plays, which
     * already passed every identity, recipe and IPA check, so Aramaic, held and unbound words have none. A Greek word's
     * is the guide's value for the Greek pronunciation in effect, never another profile's. Null means the line shows
     * that none is available; no reading is inferred here.
     */
    fun wordIpaChirho(wordChirho: WordChirho): String? = when (wordChirho) {
        is HebrewWordChirho -> wordClipChirho(wordChirho.idChirho)?.ipaChirho
        is GreekWordChirho -> greekIpaChirho?.get(wordChirho.idChirho)?.valueChirho(renditionChirho)
    }

    /** The verse recording Play would play under the reading now in effect, if any. */
    val verseClipChirho: ClipChirho?
        get() = (recordingsChirho as? OptionalChirho.ReadyChirho)?.valueChirho
            ?.let { AudioSelectionChirho.bestChirho(it.versesChirho, greekChirho, renditionChirho) }

    /**
     * The verse video shown in the scene's place and played by Play. As on the website (speech-controls), a video
     * that failed is not tried again on this visit while a recording can be read over the still instead; with no
     * recording to fall back on, Play may try the video again.
     *
     * A video whose sound is a synthesized recording plays only while that exact clip is the verse recording chosen
     * under the reading in effect (unit 194, GPT DM #3807). Otherwise the same Play reads the chosen recording over
     * the still, and with none chosen the video stays withheld: a reading choice is never overridden by a video.
     */
    val playableVideoChirho: VideoRecordChirho?
        get() {
            val videoChirho = (mediaChirho as? OptionalChirho.ReadyChirho)?.valueChirho?.videoChirho ?: return null
            val clipChirho = verseClipChirho
            if (videoChirho.embeddedClipChirho != null &&
                (clipChirho == null || !VideoSelectionChirho.sameEmbeddedReadingChirho(videoChirho, clipChirho))
            ) {
                return null
            }
            return if (videoFailedChirho && clipChirho != null) null else videoChirho
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
    /** Whether word boxes show the IPA line. */
    var showIpaChirho: Boolean

    companion object {
        /** Today's Proverbs is on by default (root, GPT DM #3642). */
        const val DEFAULT_OPEN_TODAY_CHIRHO = true

        /**
         * Autoplay is on for a new install (L.J., 2026-11-08, via GPT DM #3664: "our app should default to audio/video
         * autoplay on for new installs etc"). A choice saved in Settings, on or off, always wins.
         */
        const val DEFAULT_AUTOPLAY_CHIRHO = true

        /** Show IPA is an optional view, off until the reader turns it on (L.J. via GPT DM #3665 and #3669). */
        const val DEFAULT_SHOW_IPA_CHIRHO = false
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
