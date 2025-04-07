// src/app/context/LessonContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useSession } from 'next-auth/react'; // Import useSession

interface LessonContextType {
  completedLessons: Set<string>;
  markAsCompleted: (title: string) => void; // Keep the same signature
  isCompleted: (title: string) => boolean;
  isLoadingProgress: boolean; // Add loading state
}

const LessonContext = createContext<LessonContextType | undefined>(undefined);

// Removed LOCAL_STORAGE_KEY

export const LessonProvider = ({ children }: { children: ReactNode }) => {
  const { data: session, status } = useSession(); // Get session status
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [isLoadingProgress, setIsLoadingProgress] = useState(true); // Start loading initially

  // --- Fetch progress when user is authenticated ---
  useEffect(() => {
    const fetchProgress = async () => {
      if (status === 'authenticated' && session?.user?.id) {
        setIsLoadingProgress(true);
        setCompletedLessons(new Set()); // Clear previous state before fetching
        try {
          const response = await fetch('/api/lessons/progress'); // Call the GET endpoint
          if (!response.ok) {
            throw new Error(`Failed to fetch progress: ${response.statusText}`);
          }
          const data = await response.json();
          if (data.completedLessonTitles && Array.isArray(data.completedLessonTitles)) {
            setCompletedLessons(new Set(data.completedLessonTitles));
          } else {
             console.warn("Received unexpected data format for completed lessons:", data);
             setCompletedLessons(new Set()); // Reset to empty on bad data
          }
        } catch (error) {
          console.error("Failed to load lesson progress from API:", error);
          setCompletedLessons(new Set()); // Reset to empty on error
        } finally {
          setIsLoadingProgress(false);
        }
      } else if (status === 'unauthenticated') {
        // Clear progress if user logs out
        setCompletedLessons(new Set());
        setIsLoadingProgress(false);
      } else {
          // Still loading session, keep loading progress true
          setIsLoadingProgress(true);
      }
    };

    fetchProgress();
  }, [status, session?.user?.id]); // Re-run when auth status or user ID changes

  // --- markAsCompleted now calls the API ---
  const markAsCompleted = useCallback(async (title: string) => {
    // Prevent marking if not logged in
    if (status !== 'authenticated') {
        console.warn("User not authenticated. Cannot save progress.");
        // Optionally show a message to the user to log in
        return;
    }

    // Optimistic Update: Update local state immediately for better UX
    setCompletedLessons(prev => {
      if (prev.has(title)) return prev; // Avoid triggering API call if already completed locally
      const newSet = new Set(prev);
      newSet.add(title);
      return newSet;
    });

    // Call the API to save persistently
    try {
      const response = await fetch('/api/lessons/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lessonTitle: title }),
      });

      if (!response.ok) {
         // If API fails, potentially revert the optimistic update (more complex UX)
         // For simplicity now, just log the error
         console.error(`Failed to save lesson progress for "${title}": ${response.statusText}`);
         // Example revert (uncomment if needed, consider UX implications):
         /*
         setCompletedLessons(prev => {
             const newSet = new Set(prev);
             newSet.delete(title);
             return newSet;
         });
         // Show error message to user
         */
      } else {
          console.log(`Lesson "${title}" marked as complete successfully.`);
      }
    } catch (error) {
      console.error(`Error saving lesson progress for "${title}":`, error);
       // Example revert (uncomment if needed):
       /*
       setCompletedLessons(prev => {
           const newSet = new Set(prev);
           newSet.delete(title);
           return newSet;
       });
       // Show error message to user
       */
    }
  }, [status]); // Depend on auth status

  const isCompleted = useCallback((title: string) => {
    return completedLessons.has(title);
  }, [completedLessons]);

  // Provide loading state along with other values
  const value = { completedLessons, markAsCompleted, isCompleted, isLoadingProgress };

  return (
    <LessonContext.Provider value={value}>
      {children}
    </LessonContext.Provider>
  );
};

// Keep useLessonContext hook the same
export const useLessonContext = () => {
  const context = useContext(LessonContext);
  if (context === undefined) {
    throw new Error('useLessonContext must be used within a LessonProvider');
  }
  return context;
};