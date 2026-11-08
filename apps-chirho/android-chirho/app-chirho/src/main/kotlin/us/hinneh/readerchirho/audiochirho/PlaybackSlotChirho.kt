// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: spec-chirho/workflows-chirho/native-chirho/verse-video-chirho.md
package us.hinneh.readerchirho.audiochirho

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

/**
 * One play at a time. Each play gets a new generation; a late fetch failure, completion or error from a
 * stopped or superseded play can never change the state of a newer one. Used on the main thread only.
 */
class PlaybackSlotChirho {
    private val stateChirho = MutableStateFlow<PlaybackChirho>(PlaybackChirho.IdleChirho)
    val playbackChirho: StateFlow<PlaybackChirho> = stateChirho.asStateFlow()
    private var generationChirho = 0L

    /** Starts a play: earlier plays lose their voice, and the new one is loading. */
    fun beginChirho(keyChirho: String): Long {
        generationChirho++
        stateChirho.value = PlaybackChirho.LoadingChirho(keyChirho)
        return generationChirho
    }

    fun isCurrentChirho(playChirho: Long): Boolean = playChirho == generationChirho

    /** A report from a play counts only while that play is the current one. */
    fun reportChirho(playChirho: Long, newStateChirho: PlaybackChirho) {
        if (isCurrentChirho(playChirho)) stateChirho.value = newStateChirho
    }

    fun stopChirho() {
        generationChirho++
        stateChirho.value = PlaybackChirho.IdleChirho
    }
}
