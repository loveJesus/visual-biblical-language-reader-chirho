// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
package us.hinneh.readerchirho.videochirho

import android.content.Context

/** Release builds never read staged videos: only published, hash-verified ones play. */
fun Context.stagedVideosChirho(): StagedVideosChirho? = null
