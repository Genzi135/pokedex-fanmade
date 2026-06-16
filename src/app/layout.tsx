import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/ui/ThemeProvider';

// Use Outfit font for a premium, friendly, and modern look
const outfit = Outfit({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'Interactive Fandex | Fanmade Fanimon Database',
  description:
    'Explore the world of Fanimon with an interactive 3D Fandex. Discover stats, abilities, move dictionaries, branching evolution chains, and play creature cries in a beautiful glassmorphic theme.',
  keywords: 'fanimon, fandex, database, nextjs, react, tailwindcss, creature cries, official artwork, 3d tilt fandex',
  authors: [{ name: 'Fandex Creator' }],
  openGraph: {
    title: 'Interactive Fandex | Fanmade Fanimon Database',
    description: 'Explore the world of Fanimon with an interactive 3D Fandex.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${outfit.variable} antialiased min-h-screen transition-colors duration-300`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
