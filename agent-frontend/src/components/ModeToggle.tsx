import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/theme-provider';
import { SunMedium, MoonIcon } from 'lucide-react';

export default function ModeToggle() {
  const { setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() =>
        setTheme(
          document.documentElement.classList.contains('dark')
            ? 'light'
            : 'dark',
        )
      }
      className="flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors cursor-pointer"
    >
      <div className="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0">
        <SunMedium strokeWidth={2} />
      </div>
      <div className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100">
        <MoonIcon strokeWidth={2} />
      </div>
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
