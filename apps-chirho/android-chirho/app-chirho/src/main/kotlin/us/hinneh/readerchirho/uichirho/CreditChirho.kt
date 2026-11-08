// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: spec-chirho/workflows-chirho/native-chirho/verse-video-chirho.md
package us.hinneh.readerchirho.uichirho

import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalUriHandler
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import us.hinneh.readerchirho.R

/** A published reading's or video's credit, kept exactly as published. */
data class MediaCreditChirho(val attributionChirho: String, val licenseChirho: String, val licenseUrlChirho: String)

/**
 * The credit of what this verse's Play plays, with a link to its license. It sits in the verse's Sources
 * fold, not under Play: L.J., 2026-11-07, "credits etc can just show in like an info screen" (GPT, DM #3486).
 */
@Composable
fun CreditChirho(creditChirho: MediaCreditChirho) {
    val uriChirho = LocalUriHandler.current
    Text(stringResource(R.string.recording_credit_chirho), style = MaterialTheme.typography.labelLarge)
    Text(creditChirho.attributionChirho, style = MaterialTheme.typography.bodySmall, modifier = Modifier.padding(top = 2.dp))
    TextButton(onClick = { uriChirho.openUri(creditChirho.licenseUrlChirho) }) {
        Text("${stringResource(R.string.license_link_chirho)}: ${creditChirho.licenseChirho} ↗", style = MaterialTheme.typography.bodySmall)
    }
}
