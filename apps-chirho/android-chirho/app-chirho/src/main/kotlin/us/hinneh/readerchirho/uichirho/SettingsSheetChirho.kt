// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
package us.hinneh.readerchirho.uichirho

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.selection.selectable
import androidx.compose.foundation.selection.selectableGroup
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.RadioButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import us.hinneh.readerchirho.R
import us.hinneh.readerchirho.audiochirho.GreekRenditionChirho
import us.hinneh.readerchirho.statechirho.InterfaceLanguageChirho

@Composable
fun SettingsSheetChirho(
    languageChirho: InterfaceLanguageChirho,
    spanishChirho: Boolean,
    textScaleChirho: Float,
    renditionChirho: GreekRenditionChirho,
    speedChirho: Float,
    onLanguageChirho: (InterfaceLanguageChirho) -> Unit,
    onTextScaleChirho: (Float) -> Unit,
    onRenditionChirho: (GreekRenditionChirho) -> Unit,
    onSpeedChirho: (Float) -> Unit,
    onDismissChirho: () -> Unit,
) {
    ClosableSheetChirho(
        onDismissChirho,
        titleChirho = {
            Text(stringResource(R.string.settings_chirho), style = MaterialTheme.typography.headlineSmall, modifier = Modifier.semantics { heading() })
        },
    ) {
        Column(Modifier.fillMaxWidth().verticalScroll(rememberScrollState()).padding(horizontal = 20.dp).padding(bottom = 32.dp)) {
            ChoiceGroupChirho(
                stringResource(R.string.interface_language_chirho),
                listOf(
                    InterfaceLanguageChirho.SYSTEM_CHIRHO to stringResource(R.string.device_language_chirho),
                    InterfaceLanguageChirho.ENGLISH_CHIRHO to stringResource(R.string.english_chirho),
                    InterfaceLanguageChirho.SPANISH_CHIRHO to stringResource(R.string.spanish_chirho),
                ),
                languageChirho, onLanguageChirho,
            )
            ChoiceGroupChirho(
                stringResource(R.string.text_size_chirho),
                listOf(
                    0.8f to stringResource(R.string.text_small_chirho),
                    0.9f to stringResource(R.string.text_medium_chirho),
                    1f to stringResource(R.string.text_large_chirho),
                    1.15f to stringResource(R.string.text_extra_large_chirho),
                ),
                textScaleChirho, onTextScaleChirho,
            )
            ChoiceGroupChirho(
                stringResource(R.string.rendition_chirho),
                listOf(
                    GreekRenditionChirho.MODERN_ASPIRATES_CHIRHO to stringResource(R.string.modern_aspirates_chirho),
                    GreekRenditionChirho.MODERN_CHIRHO to stringResource(R.string.modern_choice_chirho),
                    GreekRenditionChirho.ERASMIAN_CHIRHO to stringResource(R.string.erasmian_chirho),
                ),
                renditionChirho, onRenditionChirho,
            )
            ChoiceGroupChirho(
                stringResource(R.string.speed_chirho),
                listOf(
                    0.65f to stringResource(R.string.slow_chirho),
                    0.85f to stringResource(R.string.gentle_chirho),
                    0.88f to stringResource(R.string.slightly_slower_chirho),
                    1f to stringResource(R.string.normal_chirho),
                ),
                speedChirho, onSpeedChirho,
            )
            AboutSectionChirho(spanishChirho)
        }
    }
}

@Composable
private fun <T> ChoiceGroupChirho(titleChirho: String, optionsChirho: List<Pair<T, String>>, selectedChirho: T, onChooseChirho: (T) -> Unit) {
    Text(titleChirho, style = MaterialTheme.typography.titleMedium, modifier = Modifier.padding(top = 18.dp, bottom = 4.dp).semantics { heading() })
    Column(Modifier.selectableGroup(), verticalArrangement = Arrangement.spacedBy(2.dp)) {
        for ((valueChirho, labelChirho) in optionsChirho) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier
                    .fillMaxWidth()
                    .selectable(selected = valueChirho == selectedChirho, role = Role.RadioButton) { onChooseChirho(valueChirho) }
                    .padding(vertical = 4.dp),
            ) {
                RadioButton(selected = valueChirho == selectedChirho, onClick = null)
                Text(labelChirho, style = MaterialTheme.typography.bodyLarge, modifier = Modifier.padding(start = 8.dp))
            }
        }
    }
}
