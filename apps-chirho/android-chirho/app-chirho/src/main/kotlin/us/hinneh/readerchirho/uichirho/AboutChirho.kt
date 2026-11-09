// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
package us.hinneh.readerchirho.uichirho

import android.content.ActivityNotFoundException
import androidx.annotation.StringRes
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
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
import us.hinneh.readerchirho.BuildConfig
import us.hinneh.readerchirho.R
import us.hinneh.readerchirho.remotechirho.TrustedOriginChirho

/** The public source code of this reader and the website. */
const val SOURCE_CODE_URL_CHIRHO = "https://github.com/loveJesus/visual-biblical-language-reader-chirho"

/** unfoldingWord Hebrew Grammar, which the reading key's Hebrew explanations adapt, and its license. */
const val HEBREW_GRAMMAR_URL_CHIRHO = "https://uhg.readthedocs.io/en/stable/"
const val CC_BY_SA_URL_CHIRHO = "https://creativecommons.org/licenses/by-sa/4.0/"

/** The licenses of Hinneh's own code and media, as the website's About links them. */
private val LICENSE_LINKS_CHIRHO = listOf(
    R.string.license_gpl_chirho to "https://www.gnu.org/licenses/gpl-3.0.html",
    R.string.license_cc0_chirho to "https://creativecommons.org/publicdomain/zero/1.0/",
    R.string.license_cc_by_chirho to "https://creativecommons.org/licenses/by/4.0/",
    R.string.license_cc_by_sa_chirho to "https://creativecommons.org/licenses/by-sa/3.0/",
)

/** The website's own pages, opened in the interface language. Google Play asks for the privacy link in the app. */
private val SITE_PAGES_CHIRHO = listOf(
    R.string.privacy_policy_chirho to "privacy-chirho",
    R.string.about_support_chirho to "about-chirho",
    R.string.sources_page_chirho to "sources-chirho",
    R.string.contact_chirho to "contact-chirho",
)

/** The shared quick tour on the website (root row 170), in the interface language. It opens in the browser. */
fun tourUrlChirho(spanishChirho: Boolean): String = TrustedOriginChirho.sitePageChirho("tutorial-chirho", spanishChirho)

/**
 * Info, opened from the welcome and from Settings (GPT, DM #3642). It holds:
 * - one plain statement of what the pictures and recordings are, in place of a note under each one;
 * - the quick tour, and fixed links to the website's pages and the public source;
 * - the licenses of Hinneh's code and media, mirroring the website's "Free software and shared media";
 * - the credits of the texts, grammar and readings, as in the reading key, and the version.
 * Every address is a constant HTTPS address; nothing is built from remote data.
 */
@Composable
fun InfoSheetChirho(spanishChirho: Boolean, onDismissChirho: () -> Unit) {
    val uriHandlerChirho = LocalUriHandler.current
    val openChirho: (String) -> Unit = { openLinkChirho(uriHandlerChirho, it) }
    ClosableSheetChirho(
        onDismissChirho,
        fullHeightChirho = true,
        titleChirho = {
            Text(stringResource(R.string.info_chirho), style = MaterialTheme.typography.headlineSmall, modifier = Modifier.semantics { heading() })
        },
    ) {
        Column(Modifier.fillMaxWidth().verticalScroll(rememberScrollState()).padding(horizontal = 20.dp).padding(bottom = 32.dp)) {
            InfoHeadingChirho(R.string.about_heading_chirho)
            Text(stringResource(R.string.about_aids_chirho), style = MaterialTheme.typography.bodyMedium)
            LinkChirho(R.string.tour_chirho) { openChirho(tourUrlChirho(spanishChirho)) }
            for ((labelChirho, slugChirho) in SITE_PAGES_CHIRHO) {
                LinkChirho(labelChirho) { openChirho(TrustedOriginChirho.sitePageChirho(slugChirho, spanishChirho)) }
            }
            LinkChirho(R.string.source_code_chirho) { openChirho(SOURCE_CODE_URL_CHIRHO) }

            InfoHeadingChirho(R.string.licenses_heading_chirho)
            for (paragraphChirho in listOf(
                R.string.license_code_chirho,
                R.string.license_art_chirho,
                R.string.license_recordings_chirho,
                R.string.license_beeri_chirho,
                R.string.license_sources_chirho,
            )) {
                Text(stringResource(paragraphChirho), style = MaterialTheme.typography.bodyMedium, modifier = Modifier.padding(top = 6.dp))
            }
            for ((labelChirho, urlChirho) in LICENSE_LINKS_CHIRHO) LinkChirho(labelChirho) { openChirho(urlChirho) }

            InfoHeadingChirho(R.string.credits_heading_chirho)
            // The CC BY attribution sentence stays verbatim in English; the explanation follows the locale, as in the reading key.
            CreditTextChirho(stringResource(R.string.credit_hebrew_attribution_chirho) + " " + stringResource(R.string.credit_hebrew_rest_chirho))
            CreditTextChirho(stringResource(R.string.grammar_credit_chirho, "CC BY-SA 4.0"))
            TextButton(onClick = { openChirho(HEBREW_GRAMMAR_URL_CHIRHO) }) { Text("unfoldingWord Hebrew Grammar ↗") }
            TextButton(onClick = { openChirho(CC_BY_SA_URL_CHIRHO) }) { Text("CC BY-SA 4.0 ↗") }
            CreditTextChirho(stringResource(R.string.credit_hebrew_readings_chirho))
            CreditTextChirho(stringResource(R.string.credit_greek_chirho))
            Text(
                stringResource(R.string.version_chirho, BuildConfig.VERSION_NAME),
                style = MaterialTheme.typography.bodySmall,
                modifier = Modifier.padding(top = 18.dp),
            )
        }
    }
}

@Composable
private fun InfoHeadingChirho(@StringRes textChirho: Int) {
    Text(
        stringResource(textChirho),
        style = MaterialTheme.typography.titleMedium,
        modifier = Modifier.padding(top = 18.dp, bottom = 4.dp).semantics { heading() },
    )
}

/** A link that leaves the app, marked with an arrow. */
@Composable
fun LinkChirho(@StringRes labelChirho: Int, onClickChirho: () -> Unit) {
    TextButton(onClick = onClickChirho) { Text(stringResource(labelChirho) + " ↗") }
}

@Composable
private fun CreditTextChirho(textChirho: String) {
    Text(textChirho, style = MaterialTheme.typography.bodySmall, modifier = Modifier.padding(top = 6.dp))
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
