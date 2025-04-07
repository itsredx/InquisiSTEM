// src/app/components/SystemCard.jsx
'use client';

import React from 'react';
import { useLessonContext } from '../context/LessonContext';
import styles from './SystemCard.module.css'; // Import the CSS module

export default function SystemCard({ title, description, onClick }) {
  const { isCompleted } = useLessonContext();
  const completed = isCompleted(title);

  // Combine base class with conditional 'completed' class
  const cardClasses = `${styles.card} ${completed ? styles.completed : ''}`;

  return (
    <div
      onClick={onClick}
      className={cardClasses} // Use className from the imported styles
      // Remove the inline style object for the main div
    >
      {completed && (
        <span className={styles.checkmark}>
          ✓
        </span>
      )}
      {/* Use classes for title and description */}
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.description}>{description}</p>
    </div>
  );
}