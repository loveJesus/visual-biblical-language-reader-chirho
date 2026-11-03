// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
package us.hinneh.readerchirho.uichirho

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.Typography
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

/** The website's paper-and-ink reading palette. */
object InkChirho {
    val PAPER_CHIRHO = Color(0xFFF6F4ED)
    val CARD_CHIRHO = Color(0xFFFCFCF8)
    val INK_CHIRHO = Color(0xFF293C34)
    val QUIET_CHIRHO = Color(0xFF69746B)
    val LINE_CHIRHO = Color(0xFFDADFD3)
    val MARKER_CHIRHO = Color(0xFF5B665F)
    val ACCENT_CHIRHO = Color(0xFF18847D)
    /** The website's word pronunciation chip: thin grey edge and quiet icon on white. */
    val SPEAKER_EDGE_CHIRHO = Color(0xFFBFC3BA)
    val SPEAKER_ICON_CHIRHO = Color(0xFF667063)
    val FOCUS_CHIRHO = Color(0xFF3A5682)
}

/** Source text uses the platform serif faces (Noto Serif Hebrew/Greek), as the website's stack. */
val SourceFontChirho: FontFamily = FontFamily.Serif

private val TypographyChirho = Typography(
    headlineSmall = TextStyle(fontFamily = FontFamily.Serif, fontSize = 26.sp, lineHeight = 32.sp, color = InkChirho.INK_CHIRHO),
    titleMedium = TextStyle(fontFamily = FontFamily.Serif, fontSize = 20.sp, lineHeight = 26.sp, color = InkChirho.INK_CHIRHO),
    bodyLarge = TextStyle(fontSize = 17.sp, lineHeight = 25.sp, color = InkChirho.INK_CHIRHO),
    bodyMedium = TextStyle(fontSize = 15.sp, lineHeight = 22.sp, color = InkChirho.INK_CHIRHO),
    bodySmall = TextStyle(fontSize = 13.sp, lineHeight = 19.sp, color = InkChirho.QUIET_CHIRHO),
    labelLarge = TextStyle(fontSize = 15.sp, lineHeight = 20.sp, fontWeight = FontWeight.Medium),
    labelSmall = TextStyle(fontSize = 12.sp, lineHeight = 16.sp, letterSpacing = 1.2.sp, color = InkChirho.QUIET_CHIRHO),
)

@Composable
fun HinnehThemeChirho(contentChirho: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = lightColorScheme(
            primary = InkChirho.ACCENT_CHIRHO,
            onPrimary = Color.White,
            secondary = InkChirho.QUIET_CHIRHO,
            background = InkChirho.PAPER_CHIRHO,
            onBackground = InkChirho.INK_CHIRHO,
            surface = InkChirho.PAPER_CHIRHO,
            onSurface = InkChirho.INK_CHIRHO,
            surfaceContainerLow = InkChirho.CARD_CHIRHO,
            surfaceContainer = InkChirho.CARD_CHIRHO,
            outline = InkChirho.LINE_CHIRHO,
        ),
        typography = TypographyChirho,
        content = contentChirho,
    )
}

/** A small uppercase eyebrow above a serif section heading, read as one heading. */
@Composable
fun SectionHeadingChirho(eyebrowChirho: String, headingChirho: String, modifier: Modifier = Modifier) {
    Column(modifier.padding(top = 20.dp, bottom = 8.dp).semantics(mergeDescendants = true) { heading() }) {
        Text(eyebrowChirho.uppercase(), style = MaterialTheme.typography.labelSmall)
        Text(headingChirho, style = MaterialTheme.typography.titleMedium)
    }
}
