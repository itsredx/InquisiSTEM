// src/app/layout.tsx
import './globals.css';
import { ReactNode } from 'react';
import AuthProvider from './components/AuthProvider'; // Import
import { LessonProvider } from './context/LessonContext'; // Import the provider

export const metadata = {
  title: 'AI Bio Teacher',
  description: 'An AI-powered biology teacher training platform',
};


export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head />
      <body>
        <AuthProvider> {/* Wrap with AuthProvider */}
          <LessonProvider>
            {children}
          </LessonProvider>
        </AuthProvider>
      </body>
    </html>
  );
}