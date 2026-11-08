// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
package us.hinneh.readerchirho.uichirho

import androidx.compose.foundation.Image
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.FilterChip
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.CancellationException
import us.hinneh.readerchirho.R
import us.hinneh.readerchirho.domainchirho.OutlineChirho
import us.hinneh.readerchirho.mediachirho.ImageLoaderChirho
import us.hinneh.readerchirho.mediachirho.ScenePresentationChirho
import us.hinneh.readerchirho.mediachirho.SceneRecordChirho

/** A verified picture's progress: still loading, shown, or withheld after a failed or refused fetch. */
sealed interface ArtworkStateChirho {
    data object LoadingChirho : ArtworkStateChirho
    data class ReadyChirho(val bitmapChirho: ImageBitmap) : ArtworkStateChirho
    data object FailedChirho : ArtworkStateChirho
}

/** Keyed by the exact image: a different picture never shows the previous one's bytes or result. */
@Composable
fun rememberArtworkChirho(imagesChirho: ImageLoaderChirho?, assetPathChirho: String, sha256Chirho: String, maxEdgeChirho: Int): ArtworkStateChirho {
    val stateChirho = remember(imagesChirho, assetPathChirho, sha256Chirho, maxEdgeChirho) {
        val cachedChirho = imagesChirho?.cachedChirho(sha256Chirho, maxEdgeChirho)?.asImageBitmap()
        mutableStateOf(
            when {
                cachedChirho != null -> ArtworkStateChirho.ReadyChirho(cachedChirho)
                imagesChirho == null -> ArtworkStateChirho.FailedChirho
                else -> ArtworkStateChirho.LoadingChirho
            },
        )
    }
    LaunchedEffect(stateChirho) {
        if (stateChirho.value != ArtworkStateChirho.LoadingChirho || imagesChirho == null) return@LaunchedEffect
        stateChirho.value = try {
            ArtworkStateChirho.ReadyChirho(imagesChirho.loadChirho(assetPathChirho, sha256Chirho, maxEdgeChirho).asImageBitmap())
        } catch (cancelledChirho: CancellationException) {
            throw cancelledChirho
        } catch (refusedChirho: Exception) {
            ArtworkStateChirho.FailedChirho
        }
    }
    return stateChirho.value
}

/** The word sticker: outline color and shape carry the word's category, as on the website. */
@Composable
fun StickerChirho(
    imagesChirho: ImageLoaderChirho?,
    assetPathChirho: String?,
    sha256Chirho: String?,
    outlineColorChirho: Color,
    outlineChirho: OutlineChirho,
    doubleChirho: Boolean,
    descriptionChirho: String,
    sizeChirho: Dp = 46.dp,
) {
    val roundChirho = outlineChirho == OutlineChirho.ROUND_CHIRHO || outlineChirho == OutlineChirho.DASHED_ROUND_CHIRHO
    val dashedChirho = outlineChirho == OutlineChirho.DASHED_CHIRHO || outlineChirho == OutlineChirho.DASHED_ROUND_CHIRHO
    val shapeChirho = if (roundChirho) CircleShape else RoundedCornerShape(5.dp)
    val artworkChirho = if (assetPathChirho != null && sha256Chirho != null) {
        rememberArtworkChirho(imagesChirho, assetPathChirho, sha256Chirho, 128)
    } else {
        ArtworkStateChirho.FailedChirho
    }
    Box(
        modifier = Modifier
            .size(sizeChirho)
            .semantics { contentDescription = descriptionChirho }
            .drawBehind {
                val strokeChirho = if (doubleChirho) 1.5.dp.toPx() else 2.dp.toPx()
                val effectChirho = if (dashedChirho) PathEffect.dashPathEffect(floatArrayOf(6f, 5f)) else null
                fun outlineAtChirho(insetChirho: Float) {
                    val cornerChirho = if (roundChirho) size.minDimension / 2 else 5.dp.toPx()
                    drawRoundRect(
                        color = outlineColorChirho,
                        topLeft = androidx.compose.ui.geometry.Offset(insetChirho, insetChirho),
                        size = androidx.compose.ui.geometry.Size(size.width - insetChirho * 2, size.height - insetChirho * 2),
                        cornerRadius = CornerRadius(cornerChirho - insetChirho),
                        style = Stroke(width = strokeChirho, pathEffect = effectChirho),
                    )
                }
                outlineAtChirho(strokeChirho / 2)
                // A double border marks other distinct reviewed meanings for this word.
                if (doubleChirho) outlineAtChirho(strokeChirho * 2.5f)
            },
        contentAlignment = Alignment.Center,
    ) {
        if (artworkChirho is ArtworkStateChirho.ReadyChirho) {
            Image(
                bitmap = artworkChirho.bitmapChirho,
                contentDescription = null,
                modifier = Modifier.size(sizeChirho * 38 / 46).clip(shapeChirho),
                contentScale = ContentScale.Fit,
            )
        } else {
            Text("◇", fontSize = 17.sp, color = Color(0xFF9EA69E))
        }
    }
}

/** The verse scene with its alt text. That pictures are AI study aids awaiting review is said once, in About. */
@Composable
fun SceneViewChirho(imagesChirho: ImageLoaderChirho?, sceneChirho: ScenePresentationChirho) {
    var reducedChirho by remember(sceneChirho) { mutableStateOf(false) }
    val shownChirho: SceneRecordChirho = if (reducedChirho) sceneChirho.reducedChirho ?: sceneChirho.standardChirho else sceneChirho.standardChirho
    val artworkChirho = rememberArtworkChirho(imagesChirho, shownChirho.assetPathChirho, shownChirho.sha256Chirho, 1600)
    Column(Modifier.fillMaxWidth().padding(vertical = 8.dp)) {
        Box(
            Modifier
                .fillMaxWidth()
                .aspectRatio(shownChirho.widthChirho.toFloat() / shownChirho.heightChirho.toFloat())
                .clip(RoundedCornerShape(8.dp))
                .border(1.dp, InkChirho.LINE_CHIRHO, RoundedCornerShape(8.dp))
                .semantics { contentDescription = shownChirho.altChirho },
            contentAlignment = Alignment.Center,
        ) {
            when (artworkChirho) {
                is ArtworkStateChirho.ReadyChirho ->
                    Image(bitmap = artworkChirho.bitmapChirho, contentDescription = null, modifier = Modifier.fillMaxWidth(), contentScale = ContentScale.Fit)
                ArtworkStateChirho.LoadingChirho -> CircularProgressIndicator(Modifier.size(28.dp), strokeWidth = 2.dp)
                ArtworkStateChirho.FailedChirho -> Text(
                    stringResource(R.string.scene_missing_chirho),
                    style = MaterialTheme.typography.bodySmall,
                    modifier = Modifier.padding(16.dp),
                )
            }
        }
        if (sceneChirho.reducedChirho != null) {
            Row(Modifier.padding(top = 6.dp)) {
                FilterChip(selected = !reducedChirho, onClick = { reducedChirho = false }, label = { Text(stringResource(R.string.scene_standard_chirho)) })
                FilterChip(
                    selected = reducedChirho,
                    onClick = { reducedChirho = true },
                    label = { Text(stringResource(R.string.scene_reduced_chirho)) },
                    modifier = Modifier.padding(start = 8.dp),
                )
            }
        }
    }
}
