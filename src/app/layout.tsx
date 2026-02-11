import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Providers } from '@/components/layout/providers';

export const metadata: Metadata = {
  title: 'Flux',
  description: 'A responsive chat application UI inspired by Discord.',
};

const ThemeScript = () => {
    const script = `
    (function() {
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

      const theme = getInitialTheme();
      const root = document.documentElement;
      const themeClasses = ['dark', 'theme-void', 'theme-bright', 'theme-crimson', 'theme-jade'];
      root.classList.remove(...themeClasses);

      switch (theme) {
        case 'void':
          root.classList.add('dark', 'theme-void');
          break;
        case 'bright':
          root.classList.add('theme-bright');
          break;
        case 'crimson':
          root.classList.add('dark', 'theme-crimson');
          break;
        case 'jade':
          root.classList.add('theme-jade');
          break;
        case 'default':
        default:
          root.classList.add('dark');
          break;
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
