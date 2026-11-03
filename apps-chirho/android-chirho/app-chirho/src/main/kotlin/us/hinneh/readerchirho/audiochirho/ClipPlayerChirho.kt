// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
package us.hinneh.readerchirho.audiochirho

import android.content.Context
import android.media.AudioAttributes
import android.media.AudioFocusRequest
import android.media.AudioManager
import android.media.MediaDataSource
import android.media.MediaPlayer
import android.media.PlaybackParams
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
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

/** Verified MP3 bytes played from memory; no audio file is written to disk. */
private class BytesSourceChirho(private val bytesChirho: ByteArray) : MediaDataSource() {
    override fun readAt(positionChirho: Long, bufferChirho: ByteArray, offsetChirho: Int, sizeChirho: Int): Int {
        if (positionChirho >= bytesChirho.size) return -1
        val countChirho = minOf(sizeChirho.toLong(), bytesChirho.size - positionChirho).toInt()
        System.arraycopy(bytesChirho, positionChirho.toInt(), bufferChirho, offsetChirho, countChirho)
        return countChirho
    }

    override fun getSize(): Long = bytesChirho.size.toLong()
    override fun close() = Unit
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
    private val stateChirho = MutableStateFlow<PlaybackChirho>(PlaybackChirho.IdleChirho)
    override val playbackChirho: StateFlow<PlaybackChirho> = stateChirho.asStateFlow()
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
        stateChirho.value = PlaybackChirho.LoadingChirho(keyChirho)
        jobChirho = scopeChirho.launch {
            try {
                val bytesChirho = remoteChirho.fetchVerifiedChirho(
                    clipChirho.assetPathChirho, ResourceKindChirho.AUDIO_CLIP_CHIRHO, clipChirho.sha256Chirho,
                    expectedBytesChirho = clipChirho.bytesChirho.toInt(),
                )
                startChirho(keyChirho, bytesChirho, speedChirho)
            } catch (cancelledChirho: CancellationException) {
                throw cancelledChirho
            } catch (errorChirho: Exception) {
                stateChirho.value = PlaybackChirho.FailedChirho(keyChirho)
            }
        }
    }

    private fun startChirho(keyChirho: String, bytesChirho: ByteArray, speedChirho: Float) {
        val playerChirho = MediaPlayer()
        this.playerChirho = playerChirho
        playerChirho.setAudioAttributes(attributesChirho)
        playerChirho.setDataSource(BytesSourceChirho(bytesChirho))
        playerChirho.setOnPreparedListener { preparedChirho ->
            if (this.playerChirho !== preparedChirho) return@setOnPreparedListener
            requestFocusChirho()
            preparedChirho.playbackParams = PlaybackParams().setSpeed(speedChirho).setPitch(1f)
            preparedChirho.start()
            stateChirho.value = PlaybackChirho.PlayingChirho(keyChirho)
        }
        playerChirho.setOnCompletionListener { doneChirho ->
            if (this.playerChirho === doneChirho) {
                releaseChirho()
                stateChirho.value = PlaybackChirho.IdleChirho
            }
        }
        playerChirho.setOnErrorListener { failedChirho, _, _ ->
            if (this.playerChirho === failedChirho) {
                releaseChirho()
                stateChirho.value = PlaybackChirho.FailedChirho(keyChirho)
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
        stateChirho.value = PlaybackChirho.IdleChirho
    }
}
