import type { Metadata, Viewport } from 'next';
import { BRANDING } from '@/lib/branding';
import { PANEL_BASE_URL } from '@/lib/panel-routes';
import './globals.css';

const WIDGET_URL = process.env.NEXT_PUBLIC_WIDGET_URL || 'https://cpiq-widget.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(WIDGET_URL),
  title: BRANDING.meta.title,
  description: BRANDING.meta.description,
  keywords: [...BRANDING.meta.keywords],
  applicationName: BRANDING.widget.title,
  authors: [{ name: BRANDING.institution.long }],
  creator: BRANDING.institution.long,
  robots: { index: false, follow: false, nocache: true },
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }]
  },
  openGraph: {
    title: BRANDING.meta.title,
    description: BRANDING.meta.description,
    type: 'website',
    siteName: BRANDING.institution.short,
    locale: 'es_AR'
  },
  twitter: {
    card: 'summary',
    title: BRANDING.meta.title,
    description: BRANDING.meta.description
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#0B5FFF'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href={PANEL_BASE_URL} crossOrigin="anonymous" />
        <link rel="dns-prefetch" href={PANEL_BASE_URL} />
      </head>
      <body className="h-full bg-white text-slate-900 antialiased">{children}</body>
    </html>
  );
}
