import './globals.css';
import { LanguageProvider } from '../components/LanguageProvider';
import AppShell from '../components/AppShell';

export const metadata = {
  title: 'NAWI OIML R-76 Reporter | WeighMaster',
  description: 'SIH26035: Automated Test Report Generation & Compliance System for Non-Automatic Weighing Instruments',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <LanguageProvider>
          <AppShell>{children}</AppShell>
        </LanguageProvider>
      </body>
    </html>
  );
}
