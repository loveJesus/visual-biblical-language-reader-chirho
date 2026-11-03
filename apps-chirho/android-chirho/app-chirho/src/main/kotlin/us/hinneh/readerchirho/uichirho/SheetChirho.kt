// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
package us.hinneh.readerchirho.uichirho

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.launch
import us.hinneh.readerchirho.R

/**
 * A modal sheet that never depends on a drag gesture: a visible Close control (and Back) hides it
 * with its animation before [onDismissChirho] runs. The content receives the same close action.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ClosableSheetChirho(
    onDismissChirho: () -> Unit,
    fullHeightChirho: Boolean = false,
    contentChirho: @Composable ColumnScope.(closeChirho: () -> Unit) -> Unit,
) {
    val sheetChirho = rememberModalBottomSheetState(skipPartiallyExpanded = fullHeightChirho)
    val scopeChirho = rememberCoroutineScope()
    val closeChirho: () -> Unit = {
        scopeChirho.launch { sheetChirho.hide() }.invokeOnCompletion { if (!sheetChirho.isVisible) onDismissChirho() }
    }
    ModalBottomSheet(onDismissRequest = onDismissChirho, sheetState = sheetChirho) {
        Row(Modifier.fillMaxWidth().padding(horizontal = 8.dp), horizontalArrangement = Arrangement.End) {
            TextButton(onClick = closeChirho) { Text(stringResource(R.string.close_chirho)) }
        }
        contentChirho(closeChirho)
    }
}
