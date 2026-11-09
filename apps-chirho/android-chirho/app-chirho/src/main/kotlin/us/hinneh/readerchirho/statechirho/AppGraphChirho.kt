// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
package us.hinneh.readerchirho.statechirho

import android.app.Application
import android.content.Context
import android.content.SharedPreferences
import androidx.core.content.edit
import us.hinneh.readerchirho.audiochirho.AudioRepositoryChirho
import us.hinneh.readerchirho.audiochirho.GreekRenditionChirho
import us.hinneh.readerchirho.contentchirho.ContentRepositoryChirho
import us.hinneh.readerchirho.domainchirho.PassageChirho
import us.hinneh.readerchirho.domainchirho.SpokenOverridesChirho
import us.hinneh.readerchirho.mediachirho.ImageLoaderChirho
import us.hinneh.readerchirho.mediachirho.MediaRepositoryChirho
import us.hinneh.readerchirho.remotechirho.HashCacheChirho
import us.hinneh.readerchirho.remotechirho.HttpTransportChirho
import us.hinneh.readerchirho.remotechirho.RemoteClientChirho
import us.hinneh.readerchirho.videochirho.VideoSourceChirho
import us.hinneh.readerchirho.videochirho.stagedVideosChirho
import java.io.File
import java.io.IOException

/** Interface language: follow the device, or a choice made in Hinneh. */
enum class InterfaceLanguageChirho(val tagChirho: String?) { SYSTEM_CHIRHO(null), ENGLISH_CHIRHO("en"), SPANISH_CHIRHO("es") }

/** Choices kept on this device only; Hinneh has no accounts or sign-in. */
class PreferencesChirho(private val storeChirho: SharedPreferences) : ReaderPreferencesChirho {
    constructor(contextChirho: Context) : this(contextChirho.getSharedPreferences(STORE_CHIRHO, Context.MODE_PRIVATE))

    /** Stored only when the reader chooses in Settings; until then the reading follows the verse (ReaderUiStateChirho). */
    override var renditionChirho: GreekRenditionChirho?
        get() = storeChirho.getString(RENDITION_CHIRHO, null)
            ?.let { nameChirho -> GreekRenditionChirho.entries.firstOrNull { it.name == nameChirho } }
        set(valueChirho) {
            storeChirho.edit { if (valueChirho == null) remove(RENDITION_CHIRHO) else putString(RENDITION_CHIRHO, valueChirho.name) }
        }

    override var speedChirho: Float?
        get() = storeChirho.getFloat(SPEED_CHIRHO, 0f).takeIf { it in ALLOWED_SPEEDS_CHIRHO }
        set(valueChirho) {
            storeChirho.edit { if (valueChirho == null) remove(SPEED_CHIRHO) else putFloat(SPEED_CHIRHO, valueChirho) }
        }

    /** Hinneh's text size, multiplied with the device's font scale; it starts a little smaller (L.J., 2026-11-05). */
    var textScaleChirho: Float
        get() = storeChirho.getFloat(TEXT_SCALE_CHIRHO, DEFAULT_TEXT_SCALE_CHIRHO).takeIf { it in ALLOWED_TEXT_SCALES_CHIRHO }
            ?: DEFAULT_TEXT_SCALE_CHIRHO
        set(valueChirho) = storeChirho.edit { putFloat(TEXT_SCALE_CHIRHO, valueChirho) }

    var interfaceLanguageChirho: InterfaceLanguageChirho
        get() = storeChirho.getString(LANGUAGE_CHIRHO, null)
            ?.let { nameChirho -> InterfaceLanguageChirho.entries.firstOrNull { it.name == nameChirho } }
            ?: InterfaceLanguageChirho.SYSTEM_CHIRHO
        set(valueChirho) {
            storeChirho.edit { putString(LANGUAGE_CHIRHO, valueChirho.name) }
        }

    override var openTodayChirho: Boolean
        get() = storeChirho.getBoolean(OPEN_TODAY_CHIRHO, ReaderPreferencesChirho.DEFAULT_OPEN_TODAY_CHIRHO)
        set(valueChirho) = storeChirho.edit { putBoolean(OPEN_TODAY_CHIRHO, valueChirho) }

    override var autoplayChirho: Boolean
        get() = storeChirho.getBoolean(AUTOPLAY_CHIRHO, ReaderPreferencesChirho.DEFAULT_AUTOPLAY_CHIRHO)
        set(valueChirho) = storeChirho.edit { putBoolean(AUTOPLAY_CHIRHO, valueChirho) }

    /** Kept as the published id; a value that no longer parses is ignored. */
    override var lastShownChirho: PassageChirho?
        get() = storeChirho.getString(LAST_SHOWN_CHIRHO, null)?.let { PassageChirho.parseChirho(it) }
        set(valueChirho) {
            storeChirho.edit { if (valueChirho == null) remove(LAST_SHOWN_CHIRHO) else putString(LAST_SHOWN_CHIRHO, valueChirho.idChirho) }
        }

    /** The versionCode whose welcome the reader last closed; null before the first (LaunchChirho.welcomeDueChirho). */
    var welcomeSeenVersionChirho: Long?
        get() = if (storeChirho.contains(WELCOME_SEEN_CHIRHO)) storeChirho.getLong(WELCOME_SEEN_CHIRHO, 0L) else null
        set(valueChirho) {
            storeChirho.edit { if (valueChirho == null) remove(WELCOME_SEEN_CHIRHO) else putLong(WELCOME_SEEN_CHIRHO, valueChirho) }
        }

    companion object {
        /** The one preferences file, kept on this device only (backup is off in the manifest). */
        const val STORE_CHIRHO = "reader_chirho"
        val ALLOWED_SPEEDS_CHIRHO = listOf(0.65f, 0.85f, 0.88f, 1f)
        /** Small, Medium (the default), Large (the original size) and Extra large. */
        val ALLOWED_TEXT_SCALES_CHIRHO = listOf(0.8f, 0.9f, 1f, 1.15f)
        const val DEFAULT_TEXT_SCALE_CHIRHO = 0.9f
        private const val TEXT_SCALE_CHIRHO = "text_scale_chirho"
        private const val RENDITION_CHIRHO = "greek_rendition_chirho"
        private const val SPEED_CHIRHO = "speed_chirho"
        private const val LANGUAGE_CHIRHO = "interface_language_chirho"
        private const val OPEN_TODAY_CHIRHO = "open_today_chirho"
        private const val AUTOPLAY_CHIRHO = "autoplay_verse_change_chirho"
        private const val LAST_SHOWN_CHIRHO = "last_shown_passage_chirho"
        private const val WELCOME_SEEN_CHIRHO = "welcome_seen_version_chirho"
    }
}

/** Process-wide services. Caches live under the app's cache directory and stay bounded. */
class AppGraphChirho(contextChirho: Context) {
    private val appContextChirho = contextChirho.applicationContext
    val remoteChirho = RemoteClientChirho(
        HttpTransportChirho(),
        HashCacheChirho(File(appContextChirho.cacheDir, "verified-chirho"), 96L * 1024 * 1024),
    )
    val contentChirho = ContentRepositoryChirho(remoteChirho, {
        appContextChirho.assets.open("library-chirho/books-chirho.json").use { it.readBytes() }
    })
    /** Development videos staged on this device; always null in release builds. */
    private val stagedVideosChirho = appContextChirho.stagedVideosChirho()
    val mediaChirho = MediaRepositoryChirho(remoteChirho, stagedVideosChirho = stagedVideosChirho)

    /** Verse videos get their own bounded cache, so they never push text, pictures or recordings out. */
    val videoSourceChirho = VideoSourceChirho(
        RemoteClientChirho(HttpTransportChirho(), HashCacheChirho(File(appContextChirho.cacheDir, "verified-video-chirho"), 64L * 1024 * 1024)),
        stagedVideosChirho,
    )
    /** Reviewed spoken readings exported from the website (GPT, DM #3551); a missing or invalid asset gives none. */
    val audioChirho = AudioRepositoryChirho(remoteChirho, spokenOverridesChirho = {
        try {
            appContextChirho.assets.open(SpokenOverridesChirho.ASSET_PATH_CHIRHO).use { SpokenOverridesChirho.decodeChirho(it.readBytes()) }
        } catch (missingChirho: IOException) {
            SpokenOverridesChirho.NONE_CHIRHO
        }
    })
    val imagesChirho = ImageLoaderChirho(remoteChirho, minOf(32L * 1024 * 1024, Runtime.getRuntime().maxMemory() / 8))
    val preferencesChirho = PreferencesChirho(appContextChirho)
}

class HinnehApplicationChirho : Application() {
    val graphChirho: AppGraphChirho by lazy { AppGraphChirho(this) }
}
