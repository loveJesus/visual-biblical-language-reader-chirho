// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
package us.hinneh.readerchirho.uichirho

import android.content.ActivityNotFoundException
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalUriHandler
import androidx.compose.ui.platform.UriHandler
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import us.hinneh.readerchirho.R
import us.hinneh.readerchirho.remotechirho.TrustedOriginChirho

/** The public source code of this reader and the website. */
const val SOURCE_CODE_URL_CHIRHO = "https://github.com/loveJesus/visual-biblical-language-reader-chirho"

/**
 * About Hinneh: one plain statement of what the pictures and recordings are, in place of a note
 * under each one, then fixed links to the website's privacy, about and contact pages in the
 * interface language and to the public source. Google Play asks for the privacy link in the app.
 * Every address is a constant HTTPS address; nothing is built from remote data.
 */
@Composable
fun AboutSectionChirho(spanishChirho: Boolean) {
    val uriHandlerChirho = LocalUriHandler.current
    Text(
        stringResource(R.string.about_heading_chirho),
        style = MaterialTheme.typography.titleMedium,
        modifier = Modifier.padding(top = 18.dp, bottom = 4.dp).semantics { heading() },
    )
    Text(stringResource(R.string.about_aids_chirho), style = MaterialTheme.typography.bodyMedium)
    val linksChirho = listOf(
        R.string.privacy_policy_chirho to TrustedOriginChirho.sitePageChirho("privacy-chirho", spanishChirho),
        R.string.about_support_chirho to TrustedOriginChirho.sitePageChirho("about-chirho", spanishChirho),
        R.string.contact_chirho to TrustedOriginChirho.sitePageChirho("contact-chirho", spanishChirho),
        R.string.source_code_chirho to SOURCE_CODE_URL_CHIRHO,
    )
    for ((labelChirho, urlChirho) in linksChirho) {
        TextButton(onClick = { openLinkChirho(uriHandlerChirho, urlChirho) }) { Text(stringResource(labelChirho) + " ↗") }
    }
}

/** Opens a fixed address in the browser. On a device without one, the reader simply stays open. */
fun openLinkChirho(uriHandlerChirho: UriHandler, urlChirho: String) {
    try {
        uriHandlerChirho.openUri(urlChirho)
    } catch (missingChirho: IllegalArgumentException) {
        // Compose reports a missing browser this way.
    } catch (missingChirho: ActivityNotFoundException) {
        // Older paths surface the platform exception directly.
    }
}
