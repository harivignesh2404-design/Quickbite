package com.example.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val QuickBiteLightColors =
  lightColorScheme(
    primary = BrandOrange,
    onPrimary = PureWhite,
    primaryContainer = BrandOrangeLight,
    onPrimaryContainer = BrandOrangeDark,
    secondary = CharcoalText,
    onSecondary = PureWhite,
    secondaryContainer = CreamSurfaceVariant,
    onSecondaryContainer = CharcoalDeep,
    tertiary = WarmAmber,
    background = CreamBackground,
    onBackground = CharcoalDeep,
    surface = PureWhite,
    onSurface = CharcoalDeep,
    surfaceVariant = CreamSurfaceVariant,
    onSurfaceVariant = MutedSlate,
    outline = OutlineWarm,
    error = NonVegRed,
  )

private val QuickBiteDarkColors =
  darkColorScheme(
    primary = Color(0xFFFB923C),
    onPrimary = CharcoalDeep,
    primaryContainer = BrandOrangeDark,
    onPrimaryContainer = PureWhite,
    secondary = WarmAmber,
    background = DarkBg,
    onBackground = PureWhite,
    surface = DarkSurface,
    onSurface = PureWhite,
    surfaceVariant = DarkSurfaceVariant,
    onSurfaceVariant = Color(0xFFD1D5DB),
    outline = Color(0xFF4B5563),
  )

@Composable
fun QuickBiteTheme(
  darkTheme: Boolean = isSystemInDarkTheme(),
  content: @Composable () -> Unit,
) {
  val colorScheme = if (darkTheme) QuickBiteDarkColors else QuickBiteLightColors
  MaterialTheme(colorScheme = colorScheme, typography = QuickBiteTypography, content = content)
}
