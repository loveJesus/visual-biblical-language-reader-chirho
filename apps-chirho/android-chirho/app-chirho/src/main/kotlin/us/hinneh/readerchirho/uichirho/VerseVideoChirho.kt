// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: spec-chirho/workflows-chirho/native-chirho/verse-video-chirho.md
package us.hinneh.readerchirho.uichirho

import android.graphics.SurfaceTexture
import android.view.Surface
import android.view.TextureView
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.rememberUpdatedState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import us.hinneh.readerchirho.R
import us.hinneh.readerchirho.mediachirho.ImageLoaderChirho
import us.hinneh.readerchirho.mediachirho.ScenePresentationChirho
import us.hinneh.readerchirho.videochirho.VideoRecordChirho

/**
 * The verse video in the scene's place. Until it plays, the verse scene stands in for it; tapping
 * it, or the verse Play control, plays the video with its reading. Its credit is in the verse's Sources fold.
 */
@Composable
fun VerseVideoChirho(
    videoChirho: VideoRecordChirho,
    posterChirho: ScenePresentationChirho?,
    imagesChirho: ImageLoaderChirho?,
    playingChirho: Boolean,
    loadingChirho: Boolean,
    stagedChirho: Boolean,
    onToggleChirho: () -> Unit,
    onSurfaceChirho: (Surface?) -> Unit,
) {
    val surfaceSinkChirho by rememberUpdatedState(onSurfaceChirho)
    val labelChirho = stringResource(if (playingChirho || loadingChirho) R.string.stop_chirho else R.string.play_verse_video_chirho)
    val descriptionChirho = posterChirho?.standardChirho?.altChirho ?: stringResource(R.string.verse_video_chirho)
    Column(Modifier.fillMaxWidth().padding(vertical = 8.dp)) {
        Box(
            Modifier
                .fillMaxWidth()
                .aspectRatio(videoChirho.widthChirho.toFloat() / videoChirho.heightChirho.toFloat())
                .clip(RoundedCornerShape(8.dp))
                .border(1.dp, InkChirho.LINE_CHIRHO, RoundedCornerShape(8.dp))
                .background(Color.Black)
                .clickable(role = Role.Button, onClickLabel = labelChirho, onClick = onToggleChirho)
                .semantics { contentDescription = descriptionChirho },
            contentAlignment = Alignment.Center,
        ) {
            AndroidView(
                factory = { contextChirho ->
                    TextureView(contextChirho).apply {
                        surfaceTextureListener = object : TextureView.SurfaceTextureListener {
                            private var surfaceChirho: Surface? = null

                            override fun onSurfaceTextureAvailable(textureChirho: SurfaceTexture, widthChirho: Int, heightChirho: Int) {
                                surfaceChirho = Surface(textureChirho).also { surfaceSinkChirho(it) }
                            }

                            override fun onSurfaceTextureSizeChanged(textureChirho: SurfaceTexture, widthChirho: Int, heightChirho: Int) = Unit

                            // Leaving the verse destroys the texture: the surface is handed back before release.
                            override fun onSurfaceTextureDestroyed(textureChirho: SurfaceTexture): Boolean {
                                surfaceSinkChirho(null)
                                surfaceChirho?.release()
                                surfaceChirho = null
                                return true
                            }

                            override fun onSurfaceTextureUpdated(textureChirho: SurfaceTexture) = Unit
                        }
                    }
                },
                modifier = Modifier.matchParentSize(),
            )
            // The scene stands in for the video until it plays, and returns when it ends.
            if (!playingChirho) {
                posterChirho?.standardChirho?.let { sceneChirho ->
                    val artworkChirho = rememberArtworkChirho(imagesChirho, sceneChirho.assetPathChirho, sceneChirho.sha256Chirho, 1600)
                    if (artworkChirho is ArtworkStateChirho.ReadyChirho) {
                        Image(artworkChirho.bitmapChirho, contentDescription = null, modifier = Modifier.matchParentSize(), contentScale = ContentScale.Crop)
                    }
                }
                Box(Modifier.size(56.dp).clip(CircleShape).background(Color.Black.copy(alpha = 0.55f)), contentAlignment = Alignment.Center) {
                    if (loadingChirho) {
                        CircularProgressIndicator(Modifier.size(28.dp), color = Color.White, strokeWidth = 2.dp)
                    } else {
                        Icon(painterResource(R.drawable.ic_play_chirho), contentDescription = null, tint = Color.White, modifier = Modifier.size(32.dp))
                    }
                }
            }
        }
        // Only debug builds can stage a video; it is labelled so it is never mistaken for a published one.
        if (stagedChirho) {
            Text(stringResource(R.string.video_staged_chirho), style = MaterialTheme.typography.bodySmall, color = InkChirho.QUIET_CHIRHO)
        }
    }
}
