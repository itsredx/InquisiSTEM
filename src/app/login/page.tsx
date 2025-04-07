// src/app/login/page.tsx
'use client';

import React, { useState, FormEvent } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation'; // Use next/navigation for App Router
import Link from 'next/link';
import styles from './AuthForm.module.css'; // We'll create a shared CSS module

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null); // Clear previous errors
        setIsLoading(true);

        try {
            const result = await signIn('credentials', {
                redirect: false, // Important: handle redirect manually
                email,
                password,
            });

            if (result?.error) {
                // Handle various error types returned by next-auth authorize callback
                console.error("SignIn Error:", result.error);
                setError('Invalid email or password. Please try again.'); // Generic error for security
            } else if (result?.ok) {
                // Sign-in successful
                router.push('/learn'); // Redirect to the learning app
            } else {
                // Other unexpected issue
                setError('An unexpected error occurred during login.');
            }
        } catch (err) {
            console.error("Login submit catch:", err)
            setError('An unexpected error occurred. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.authContainer}>
            <form onSubmit={handleSubmit} className={styles.authForm}>
                <h2>Login</h2>
                {error && <p className={styles.error}>{error}</p>}
                <div className={styles.inputGroup}>
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={isLoading}
                    />
                </div>
                <div className={styles.inputGroup}>
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isLoading}
                    />
                </div>
                <button type="submit" className={styles.submitButton} disabled={isLoading}>
                    {isLoading ? 'Logging in...' : 'Login'}
                </button>
                <p className={styles.switchForm}>
                    Don&apos;t have an account? <Link href="/register">Register here</Link>
                </p>
            </form>
        </div>
    );
}