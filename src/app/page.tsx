// src/app/page.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react'; // Import signOut
import styles from './LandingPage.module.css';

export default function LandingPage() {
  const { data: session, status } = useSession();

  const handleLogout = () => {
    signOut({ callbackUrl: '/' }); // Redirect to landing page after logout
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Welcome to the AI Biology Teacher Trainer!</h1>
        <p>Interactive 3D models and AI chat to enhance your teaching skills.</p>
      </header>

      <main className={styles.main}>
        {status === 'loading' && (
          <p style={{ textAlign: 'center', color: '#0a0a0a' }}>Loading session...</p>
        )}

        {status === 'authenticated' && session?.user && (
          <div className={styles.loggedInActions}>
            <h2>Hello, {session.user.name || session.user.email}!</h2>
            <p style={{ textAlign: 'center', color: '#0a0a0a' }}>Ready to dive back into learning?</p>
            <Link href="/learn" className={styles.ctaButton}>
              Learn
            </Link>
            {/* --- Add Logout Button --- */}
            <button style={{ marginLeft: 30 }} onClick={handleLogout} className={styles.secondaryButton}>
              Sign Out
            </button>
            {/* --- End Logout Button --- */}
          </div>
        )}

        {status === 'unauthenticated' && (
          <div className={styles.loggedOutActions}>
             {/* ... (Login/Register buttons remain the same) ... */}
             <h2>Get Started</h2>
             <p style={{ textAlign: 'center', color: '#0a0a0a' }}>Sign in or create an account to access the learning modules.</p>
             <div className={styles.buttonGroup}>
               <Link href="/login" className={styles.ctaButton}>
                 Login
               </Link>
               <Link href="/register" className={styles.ctaButtonSecondary}>
                 Register
               </Link>
             </div>
          </div>
        )}
      </main>

      <footer className={styles.footer}>
        <p>© {new Date().getFullYear()} AI Bio Teacher Trainer</p>
      </footer>
    </div>
  );
}