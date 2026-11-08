// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
package us.hinneh.readerchirho.audiochirho

import android.content.Context
import android.media.AudioAttributes
import android.media.AudioFocusRequest
import android.media.AudioManager
import android.media.MediaPlayer
import android.media.PlaybackParams
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import us.hinneh.readerchirho.remotechirho.RemoteClientChirho
import us.hinneh.readerchirho.remotechirho.ResourceKindChirho

sealed interface PlaybackChirho {
    val keyChirho: String?

    data object IdleChirho : PlaybackChirho {
        override val keyChirho: String? = null
    }

    data class LoadingChirho(override val keyChirho: String) : PlaybackChirho
    data class PlayingChirho(override val keyChirho: String) : PlaybackChirho
    data class FailedChirho(override val keyChirho: String) : PlaybackChirho
}

/** One clip at a time; the reader only asks to play or stop. */
interface AudioPlaybackChirho {
    val playbackChirho: StateFlow<PlaybackChirho>
    fun playChirho(keyChirho: String, clipChirho: ClipChirho, speedChirho: Float)
    fun stopChirho()
}

/**
 * Plays one hash-verified recording at a time, completely, to its natural end. Starting another
 * clip, changing passage or leaving the screen stops the current one first.
 */
class ClipPlayerChirho(
    contextChirho: Context,
    private val remoteChirho: RemoteClientChirho,
    private val scopeChirho: CoroutineScope,
) : AudioPlaybackChirho {
    private val slotChirho = PlaybackSlotChirho()
    override val playbackChirho: StateFlow<PlaybackChirho> = slotChirho.playbackChirho
    private val audioManagerChirho = contextChirho.getSystemService(AudioManager::class.java)
    private var jobChirho: Job? = null
    private var playerChirho: MediaPlayer? = null
    private var focusChirho: AudioFocusRequest? = null
    private val attributesChirho = AudioAttributes.Builder()
        .setUsage(AudioAttributes.USAGE_MEDIA)
        .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
        .build()

    override fun playChirho(keyChirho: String, clipChirho: ClipChirho, speedChirho: Float) {
        stopChirho()
        val playChirho = slotChirho.beginChirho(keyChirho)
        jobChirho = scopeChirho.launch {
            try {
                val bytesChirho = remoteChirho.fetchVerifiedChirho(
                    clipChirho.assetPathChirho, ResourceKindChirho.AUDIO_CLIP_CHIRHO, clipChirho.sha256Chirho,
                    expectedBytesChirho = clipChirho.bytesChirho.toInt(),
                )
                if (slotChirho.isCurrentChirho(playChirho)) startChirho(playChirho, keyChirho, bytesChirho, speedChirho)
            } catch (cancelledChirho: CancellationException) {
                throw cancelledChirho
            } catch (errorChirho: Exception) {
                slotChirho.reportChirho(playChirho, PlaybackChirho.FailedChirho(keyChirho))
            }
        }
    }

    private fun startChirho(playChirho: Long, keyChirho: String, bytesChirho: ByteArray, speedChirho: Float) {
        val playerChirho = MediaPlayer()
        this.playerChirho = playerChirho
        playerChirho.setAudioAttributes(attributesChirho)
        playerChirho.setDataSource(BytesSourceChirho(bytesChirho))
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
