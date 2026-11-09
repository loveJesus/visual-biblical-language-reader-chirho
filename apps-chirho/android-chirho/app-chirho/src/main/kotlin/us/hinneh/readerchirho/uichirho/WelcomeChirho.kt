// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
package us.hinneh.readerchirho.uichirho

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalUriHandler
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import us.hinneh.readerchirho.R

/**
 * The first-run and new-version welcome (GPT, DM #3642 and #3645): one short screen, not a setup wizard. It says
 * what Hinneh is, that it reads Hebrew and Greek now with more languages planned, that its code and study
 * materials are openly licensed, and that the quick tour opens any time from Help. Start reading comes first; the
 * tour and Info open only when the reader chooses them. Nothing is fetched or played here, and the verse behind it
 * never starts a sound because of it. Back starts reading too.
 */
@Composable
fun WelcomeChirho(spanishChirho: Boolean, onStartChirho: () -> Unit) {
    val uriHandlerChirho = LocalUriHandler.current
    var infoOpenChirho by rememberSaveable { mutableStateOf(false) }
    BackHandler(onBack = onStartChirho)
    Scaffold(containerColor = InkChirho.PAPER_CHIRHO) { paddingChirho ->
        Box(Modifier.fillMaxSize().padding(paddingChirho), contentAlignment = Alignment.TopCenter) {
            Column(
                Modifier.widthIn(max = 640.dp).fillMaxWidth().verticalScroll(rememberScrollState()).padding(horizontal = 24.dp, vertical = 32.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp),
            ) {
                Text(
                    stringResource(R.string.welcome_title_chirho),
                    style = MaterialTheme.typography.headlineSmall,
                    modifier = Modifier.semantics { heading() },
                )
                Text(stringResource(R.string.tagline_chirho), style = MaterialTheme.typography.titleMedium)
                for (lineChirho in listOf(R.string.welcome_what_chirho, R.string.welcome_open_chirho, R.string.welcome_tour_chirho)) {
                    Text(stringResource(lineChirho), style = MaterialTheme.typography.bodyLarge)
                }
                // The colorless label style lets the button's white show (4.5:1 on teal); the theme's body text carries
                // the ink color, which would otherwise draw ink on teal (2.6:1), as StepButtonChirho notes.
                Button(onClick = onStartChirho, modifier = Modifier.fillMaxWidth().padding(top = 8.dp)) {
                    Text(stringResource(R.string.welcome_start_chirho), style = MaterialTheme.typography.labelLarge)
                }
                OutlinedButton(onClick = { openLinkChirho(uriHandlerChirho, tourUrlChirho(spanishChirho)) }, modifier = Modifier.fillMaxWidth()) {
                    Text(stringResource(R.string.tour_chirho) + " ↗")
                }
                TextButton(onClick = { infoOpenChirho = true }) { Text(stringResource(R.string.info_link_chirho)) }
            }
        }
    }
    if (infoOpenChirho) InfoSheetChirho(spanishChirho, onDismissChirho = { infoOpenChirho = false })
}
