package id.web.sipesand.ananda.ui.theme

import android.app.Activity
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val LightScheme = lightColorScheme(
    primary = SolidRoyalBlue, onPrimary = SurfaceCard, primaryContainer = RoyalBlueDark, onPrimaryContainer = SurfaceCard,
    secondary = PastelSkyIcon, background = SurfaceBackground, surface = SurfaceCard, onBackground = TextPrimary, onSurface = TextPrimary,
    outline = BorderColor, outlineVariant = BorderSoft
)
@Composable fun AnandaTheme(content: @Composable ()->Unit){
    val view = LocalView.current
    if(!view.isInEditMode){
        SideEffect{
            val win = (view.context as Activity).window
            win.statusBarColor = SolidRoyalBlue.toArgb()
            WindowCompat.getInsetsController(win, view).isAppearanceLightStatusBars = false
            win.navigationBarColor = android.graphics.Color.WHITE
        }
    }
    MaterialTheme(colorScheme = LightScheme, typography = Typography, content = content)
}
