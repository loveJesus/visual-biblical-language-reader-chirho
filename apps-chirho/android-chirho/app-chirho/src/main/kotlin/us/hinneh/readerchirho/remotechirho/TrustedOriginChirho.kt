// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
package us.hinneh.readerchirho.remotechirho

import java.net.URL

/** The single origin every root-relative resource resolves against. Nothing else is fetched. */
object TrustedOriginChirho {
    const val SCHEME_CHIRHO = "https"
    const val HOST_CHIRHO = "hinneh.us"
    const val ORIGIN_CHIRHO = "$SCHEME_CHIRHO://$HOST_CHIRHO"
    private const val MAX_PATH_CHIRHO = 512

    /** Resolves one published path, refusing any shape outside its resource kind. */
    fun resolveChirho(pathChirho: String, kindChirho: ResourceKindChirho): URL {
        if (!isTrustedPathChirho(pathChirho, kindChirho)) throw RemoteFailureChirho.UntrustedChirho(pathChirho)
        return URL(SCHEME_CHIRHO, HOST_CHIRHO, pathChirho)
    }

    fun isTrustedPathChirho(pathChirho: String, kindChirho: ResourceKindChirho): Boolean =
        pathChirho.length <= MAX_PATH_CHIRHO &&
            pathChirho.startsWith("/") &&
            !pathChirho.contains("//") &&
            kindChirho.patternChirho.matches(pathChirho)

    /** A web address for opening the same verse on the website in the user's browser. */
    fun versePageChirho(passageIdChirho: String): String = "$ORIGIN_CHIRHO/#$passageIdChirho"

    /** One of the website's own pages (privacy-chirho, about-chirho, contact-chirho) in the interface language. */
    fun sitePageChirho(slugChirho: String, spanishChirho: Boolean): String =
        "$ORIGIN_CHIRHO/$slugChirho/?lang_chirho=${if (spanishChirho) "es" else "en"}"
}

/** Every remote resource kind: its exact published path shape and its byte ceiling. */
enum class ResourceKindChirho(val patternChirho: Regex, val limitChirho: Int) {
    BOOTSTRAP_CHIRHO(Regex("/library-chirho/books-chirho\\.json"), 128 * 1024),
    CONTENT_MANIFEST_CHIRHO(Regex("/content-chirho/[a-z0-9-]+/manifest-chirho\\.json"), 128 * 1024),
    CONTENT_CHAPTER_CHIRHO(Regex("/content-chirho/[a-z0-9-]+/chapter-[0-9]{2,3}-chirho\\.json"), 4 * 1024 * 1024),
    MEDIA_SUMMARY_CHIRHO(Regex("/media-chirho/[a-z0-9-]+/summary-chirho\\.json"), 2 * 1024 * 1024),
    MEDIA_CHAPTER_CHIRHO(Regex("/media-chirho/[a-z0-9-]+/chapter-[0-9]{2,3}-chirho\\.json"), 2 * 1024 * 1024),
    AUDIO_MANIFEST_CHIRHO(Regex("/audio-chirho/manifest-chirho\\.json"), 2_000_000),
    AUDIO_CHAPTER_CHIRHO(Regex("/audio-chirho/[a-z0-9-]+/chapter-[0-9]{2,3}-chirho\\.json"), 2_000_000),
    AUDIO_CLIP_CHIRHO(Regex("/audio-chirho/sha256-chirho/[a-f0-9]{64}-chirho\\.mp3"), 4_000_000),
    ARTWORK_CHIRHO(Regex("/assets-chirho/[a-z0-9/-]+\\.webp"), 8 * 1024 * 1024),
    VERSE_VIDEO_CHIRHO(Regex("/video-chirho/sha256-chirho/[a-f0-9]{64}-chirho\\.mp4"), 16 * 1024 * 1024),
}
