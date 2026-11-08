// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: spec-chirho/workflows-chirho/native-chirho/verse-video-chirho.md
package us.hinneh.readerchirho.videochirho

import android.content.Context
import android.media.AudioAttributes
import android.media.AudioFocusRequest
import android.media.AudioManager
import android.media.MediaPlayer
import android.media.PlaybackParams
import android.view.Surface
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import us.hinneh.readerchirho.audiochirho.BytesSourceChirho
import us.hinneh.readerchirho.audiochirho.PlaybackChirho
import us.hinneh.readerchirho.audiochirho.PlaybackSlotChirho

/** One verse video at a time; the screen lends the surface it is drawn on. */
interface VideoPlaybackChirho {
    val playbackChirho: StateFlow<PlaybackChirho>
    fun playChirho(keyChirho: String, videoChirho: VideoRecordChirho, speedChirho: Float)
    fun stopChirho()

    /** The surface to draw on, or null when the screen has none; the reading keeps playing either way. */
    fun surfaceChirho(surfaceChirho: Surface?)
}

/**
 * Plays a hash-verified verse video from memory, with its own reading as the sound, to its natural
 * end. Speed keeps the reader's pitch. Starting another video, changing passage or leaving stops it.
 */
class VideoPlayerChirho(
    contextChirho: Context,
    private val bytesChirho: suspend (VideoRecordChirho) -> ByteArray,
    private val scopeChirho: CoroutineScope,
) : VideoPlaybackChirho {
    private val slotChirho = PlaybackSlotChirho()
    override val playbackChirho: StateFlow<PlaybackChirho> = slotChirho.playbackChirho
    private val audioManagerChirho = contextChirho.getSystemService(AudioManager::class.java)
    private var jobChirho: Job? = null
    private var playerChirho: MediaPlayer? = null
    private var surfaceChirho: Surface? = null
    private var focusChirho: AudioFocusRequest? = null
    private val attributesChirho = AudioAttributes.Builder()
        .setUsage(AudioAttributes.USAGE_MEDIA)
        .setContentType(AudioAttributes.CONTENT_TYPE_MOVIE)
        .build()

    override fun playChirho(keyChirho: String, videoChirho: VideoRecordChirho, speedChirho: Float) {
        stopChirho()
        val playChirho = slotChirho.beginChirho(keyChirho)
        jobChirho = scopeChirho.launch {
            try {
                val videoBytesChirho = bytesChirho(videoChirho)
                if (slotChirho.isCurrentChirho(playChirho)) startChirho(playChirho, keyChirho, videoBytesChirho, speedChirho)
            } catch (cancelledChirho: CancellationException) {
                throw cancelledChirho
            } catch (errorChirho: Exception) {
                slotChirho.reportChirho(playChirho, PlaybackChirho.FailedChirho(keyChirho))
            }
        }
    }

    override fun surfaceChirho(surfaceChirho: Surface?) {
        this.surfaceChirho = surfaceChirho
        playerChirho?.setSurface(surfaceChirho)
    }

    private fun startChirho(playChirho: Long, keyChirho: String, videoBytesChirho: ByteArray, speedChirho: Float) {
        val playerChirho = MediaPlayer()
        this.playerChirho = playerChirho
        playerChirho.setAudioAttributes(attributesChirho)
        playerChirho.setDataSource(BytesSourceChirho(videoBytesChirho))
        playerChirho.setSurface(surfaceChirho)
        playerChirho.setOnPreparedListener { preparedChirho ->
            if (this.playerChirho !== preparedChirho || !slotChirho.isCurrentChirho(playChirho)) return@setOnPreparedListener
            requestFocusChirho()
            preparedChirho.playbackParams = PlaybackParams().setSpeed(speedChirho).setPitch(1f)
            preparedChirho.start()
            slotChirho.reportChirho(playChirho, PlaybackChirho.PlayingChirho(keyChirho))
        }
        playerChirho.setOnCompletionListener { doneChirho ->
            if (this.playerChirho === doneChirho) {
                releaseChirho()
                slotChirho.reportChirho(playChirho, PlaybackChirho.IdleChirho)
            }
        }
        playerChirho.setOnErrorListener { failedChirho, _, _ ->
            if (this.playerChirho === failedChirho) {
                releaseChirho()
                slotChirho.reportChirho(playChirho, PlaybackChirho.FailedChirho(keyChirho))
            }
            true
        }
        playerChirho.prepareAsync()
    }

    private fun requestFocusChirho() {
        val requestChirho = AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN_TRANSIENT)
            .setAudioAttributes(attributesChirho)
            .setOnAudioFocusChangeListener { changeChirho ->
                if (changeChirho == AudioManager.AUDIOFOCUS_LOSS || changeChirho == AudioManager.AUDIOFOCUS_LOSS_TRANSIENT) stopChirho()
            }
            .build()
        focusChirho = requestChirho
        audioManagerChirho?.requestAudioFocus(requestChirho)
    }

    private fun releaseChirho() {
        playerChirho?.let { activeChirho ->
            activeChirho.setOnPreparedListener(null)
            activeChirho.setOnCompletionListener(null)
            activeChirho.setOnErrorListener(null)
            activeChirho.release()
        }
        playerChirho = null
        focusChirho?.let { audioManagerChirho?.abandonAudioFocusRequest(it) }
        focusChirho = null
    }

    override fun stopChirho() {
        jobChirho?.cancel()
        jobChirho = null
        releaseChirho()
        slotChirho.stopChirho()
    }
}
