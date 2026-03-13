import { useThemeStore } from '@/store/theme';
import type { ThemeId } from '@/types';
import { cn } from '@/lib/utils';

const themeColors: { id: ThemeId; label: string; color: string }[] = [
  { id: 'dark-red', label: 'Vermelho Escuro', color: '#DC2626' },
  { id: 'dark-orange', label: 'Laranja Escuro', color: '#EA580C' },
  { id: 'dark-gold', label: 'Dourado Escuro', color: '#CA8A04' },
  { id: 'light-red', label: 'Vermelho Claro', color: '#DC2626' },
  { id: 'light-orange', label: 'Laranja Claro', color: '#EA580C' },
  { id: 'light-gold', label: 'Dourado Claro', color: '#CA8A04' },
];

export function ThemeSwitcher() {
  const { theme, setTheme } = useThemeStore();
  const isDark = theme.startsWith('dark');

  const toggleMode = () => {
    const color = theme.split('-').slice(1).join('-');
    setTheme(`${isDark ? 'light' : 'dark'}-${color}` as ThemeId);
  };

  const setColor = (color: 'red' | 'orange' | 'gold') => {
    setTheme(`${isDark ? 'dark' : 'light'}-${color}` as ThemeId);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Cor:</span>
        {(['red', 'orange', 'gold'] as const).map((color) => {
          const active = theme.endsWith(color);
          const hex = color === 'red' ? '#DC2626' : color === 'orange' ? '#EA580C' : '#CA8A04';
          return (
            <button
              key={color}
              onClick={() => setColor(color)}
              className={cn(
                'h-8 w-8 rounded-full border-2 transition-all',
                active ? 'border-foreground scale-110' : 'border-transparent hover:scale-105'
              )}
              style={{ backgroundColor: hex }}
            />
          );
        })}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Modo:</span>
        <button
          onClick={toggleMode}
          className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-secondary transition-colors"
        >
          {isDark ? '☀️ Claro' : '🌙 Escuro'}
        </button>
      </div>
    </div>
  );
}
