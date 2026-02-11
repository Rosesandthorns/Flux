import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Providers } from '@/components/layout/providers';
import { THEMES } from '@/lib/themes';

export const metadata: Metadata = {
  title: 'Flux',
  description: 'A responsive chat application UI inspired by Discord.',
};

const ThemeScript = () => {
    const script = `
    (function() {
      const THEMES = ${JSON.stringify(THEMES)};
      const getInitialTheme = () => {
        try {
          const storedTheme = window.localStorage.getItem('theme');
          if (storedTheme) {
            return storedTheme;
          }
        } catch (e) {
          // Local storage is not available
        }
        return 'default';
      };

      const themeId = getInitialTheme();
      const themeInfo = THEMES.find(t => t.id === themeId) || THEMES.find(t => t.id === 'default');
      const root = document.documentElement;
      
      const allThemeClasses = THEMES.map(t => 'theme-' + t.id);
      root.classList.remove('dark', ...allThemeClasses);

      if (themeInfo) {
        if (themeInfo.isDark) {
          root.classList.add('dark');
        }
        root.classList.add('theme-' + themeInfo.id);
      } else {
         root.classList.add('dark');
      }
    })();
  `;
  // Using a script tag in the head is crucial to prevent FOUC.
  // The \`suppressHydrationWarning\` on the <html> tag is also necessary.
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased bg-background">
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
