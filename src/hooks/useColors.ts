import { DarkColors, LightColors } from '../constants/themes';
import { useThemeStore } from '../store/theme';

export function useColors() {
  const isDark = useThemeStore((s) => s.isDark);
  return isDark ? DarkColors : LightColors;
}
