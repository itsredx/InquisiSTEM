// src/app/learn/page.tsx
'use client'; // This page uses client-side hooks for state and auth

import React, { useState, useMemo, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react'; // Import hooks for authentication, including signOut

// --- Import Markdown Renderer ---
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
// --- End Markdown Imports ---

// Import your existing components
import SystemCard from '../components/SystemCard';
import ThreeDViewer from '../components/ThreeDViewer';
import FeedbackForm from '../components/FeedbackForm';
import DefinitionAndInsight from '../components/DefinitionAndInsight';
import QuizComponent from '../components/QuizComponent';

// Import context and data
import { useLessonContext } from '../context/LessonContext';
import { quizData } from '../data/quizData';
import type { QuizQuestion } from '../data/quizData';

// --- Data Definitions (Moved outside component) ---
const definitions: { [key: string]: string } = {
    'Human Brain': 'The human brain, the command center of the nervous system, orchestrates thought, memory, emotion, motor skills, vision, breathing, temperature, hunger, and every process that regulates our body. It comprises billions of neurons communicating through synapses.',
    'Lungs': 'The lungs are the central organs of the respiratory system in humans and many other animals. They are located in the chest cavity and are responsible for the vital process of gas exchange, extracting oxygen from inhaled air and releasing carbon dioxide from the bloodstream into exhaled air.',
    'Amoeba': 'An amoeba is a type of single-celled organism belonging to the Protozoa group, characterized by its irregular shape and ability to move and capture food using temporary projections called pseudopods. They lack cell walls and are found in diverse environments like water and soil.',
};
const systems: System[] = [
    { title: 'Human Brain', description: 'Delve into the intricate structures of the human brain, including its major lobes (frontal, parietal, temporal, occipital), the cerebellum, brainstem, and the microscopic world of neurons and synapses that enable complex thought and bodily control.' },
    { title: 'Lungs', description: 'Explore the respiratory pathway from the trachea to the bronchi and bronchioles, culminating in the alveoli where crucial oxygen and carbon dioxide exchange occurs. Understand the mechanics of breathing involving the diaphragm and intercostal muscles.' },
    { title: 'Amoeba', description: 'Discover the fascinating world of this single-celled protist. Learn about its unique mode of locomotion and feeding using pseudopods (phagocytosis), its simple structure including the nucleus and contractile vacuole, and its role in various ecosystems.' },
];
const modelFileMapping: { [key: string]: string } = {
    'Human Brain': 'human-brain.glb',
    'Lungs': 'lungs.glb',
    'Amoeba': 'amoeba.glb',
};
// --- End Data Definitions ---

// Define types
interface System {
    title: string;
    description: string;
}
interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}


export default function LearnPage() {
    // ========================================================
    // HOOKS AT TOP LEVEL
    // ========================================================
    const { data: session, status } = useSession();
    const { markAsCompleted, isCompleted, isLoadingProgress } = useLessonContext();
    const [selectedSystem, setSelectedSystem] = useState<System | null>(null);
    const [input, setInput] = useState('');
    const [responseText, setResponseText] = useState('');
    const [isLoadingInsight, setIsLoadingInsight] = useState(false);
    const [isLoadingResponse, setIsLoadingResponse] = useState(false);
    const [showQuiz, setShowQuiz] = useState(false);
    const [currentQuizQuestions, setCurrentQuizQuestions] = useState<QuizQuestion[]>([]);
    const [userAnswers, setUserAnswers] = useState<{ [key: string]: string }>({});
    const [quizAttempted, setQuizAttempted] = useState(false);
    const [quizPassed, setQuizPassed] = useState<boolean | null>(null);

    // Memos (using data defined outside)
    const currentLessonIndex = useMemo(() => {
        if (!selectedSystem) return -1;
        return systems.findIndex(system => system.title === selectedSystem.title);
    }, [selectedSystem]);
    const nextLessonIndex = useMemo(() => {
        if (currentLessonIndex === -1 || currentLessonIndex >= systems.length - 1) return -1;
        return currentLessonIndex + 1;
    }, [currentLessonIndex]);
    const nextLesson = useMemo(() => {
        if (nextLessonIndex === -1) return null;
        return systems[nextLessonIndex];
    }, [nextLessonIndex]);
    const canCompleteLesson = useMemo(() => {
        if (!selectedSystem) return false;
        return isCompleted(selectedSystem.title) || quizPassed === true;
    }, [selectedSystem, isCompleted, quizPassed]);
    const modelFileName = useMemo(() => selectedSystem ? modelFileMapping[selectedSystem.title] : null, [selectedSystem]);
    const currentDefinition = useMemo(() => selectedSystem ? definitions[selectedSystem.title] : '', [selectedSystem]);

    // Effect for redirection
    useEffect(() => {
        if (status === 'unauthenticated') { signIn(); }
    }, [status]);
    // ========================================================
    // END OF HOOK CALLS
    // ========================================================


    // --- Conditional Returns ---
    if (status === 'loading') { return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading Session...</div>; }
    if (status === 'unauthenticated') { return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Redirecting to login...</div>; }
    if (isLoadingProgress && status === 'authenticated') { return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading Lesson Progress...</div>; }
    if (!session) { return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading session data...</div>; }
    // --- End Conditional Returns ---


    // --- Functions ---
    const resetLessonState = () => { /* ... */ };
    const handleSystemClick = (system: System) => { /* ... */ };
    const handleBackClick = () => { /* ... */ };
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => { /* ... */ };
    const handleGetInsight = async () => { /* ... */ };
    const handleStartQuiz = () => { /* ... */ };
    const handleAnswerChange = (questionId: string, answer: string) => { /* ... */ };
    const handleSubmitQuiz = () => { /* ... */ };
    const handleMarkAsComplete = () => { /* ... */ };
    const handleCompleteAndNext = () => { /* ... */ };
    const handleLogout = () => { signOut({ callbackUrl: '/' }); };
    // (Include the full implementation of the functions above as they were before)
    // Example for resetLessonState:
    // const resetLessonState = () => {
    //     setInput(''); setResponseText(''); setIsLoadingInsight(false); setIsLoadingResponse(false);
    //     setShowQuiz(false); setCurrentQuizQuestions([]); setUserAnswers({}); setQuizAttempted(false); setQuizPassed(null);
    // }
    // // ... include full implementations for others ...
    // --- End Functions ---

    // --- Render Logic ---
    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Title & Welcome/Logout Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ width: '88px' /* Approximate width of button for balance */, visibility: 'hidden' }}>Sign Out</div> {/* Adjusted placeholder */}
                <h1 style={{ textAlign: 'center', margin: 0, flexGrow: 1 /* Allow title to take space */ }}>AI-Powered Biology Teacher Chat</h1>
                <button onClick={handleLogout} style={{ padding: '0.5rem 1rem', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '0.9rem', flexShrink: 0 /* Prevent button shrinking */ }}>
                    Sign Out
                </button>
            </div>
            <p style={{ textAlign: 'center', marginBottom: '2rem', color: '#555' }}>Welcome, {session.user?.name || session.user?.email}!</p>


            {!selectedSystem ? (
                // --- System Selection View ---
                <div>
                    <p style={{ textAlign: 'center', fontSize: '1.1rem', marginBottom: '1.5rem' }}>Select a topic to start:</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', justifyContent: 'center' }}>
                        {systems.map((system) => (
                            <SystemCard key={system.title} title={system.title} description={system.description} onClick={() => handleSystemClick(system)} />
                        ))}
                    </div>
                </div>
            ) : (
                // --- Lesson View ---
                <div>
                     <button onClick={handleBackClick} style={{ marginBottom: '1rem', padding: '0.5rem 1rem' }}> ← Back to Topics </button>
                     <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>{selectedSystem.title}</h2>
                     <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
                         {/* Left Column */}
                         <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                              <DefinitionAndInsight definition={currentDefinition} onGetInsight={handleGetInsight} isLoading={isLoadingInsight} />
                              {/* Chat Interface */}
                              <div>
                                  <h3>Ask the AI Tutor:</h3>
                                  <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                                      <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type your question here..." style={{ flexGrow: 1, padding: '0.75rem', borderRadius: '6px', border: '1px solid #ccc' }} disabled={isLoadingResponse} />
                                      <button type="submit" style={{ border: '1px solid #fff', backgroundColor: '#333', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '6px', cursor: isLoadingResponse ? 'wait' : 'pointer' }} disabled={isLoadingResponse}>
                                          {isLoadingResponse ? 'Sending...' : 'Send'}
                                      </button>
                                  </form>
                                  {/* --- Render AI Response as Markdown --- */}
                                  {(responseText || isLoadingResponse) && (
                                  <div style={{ padding: '1rem', border: '1px solid #eee', borderRadius: '8px', backgroundColor: '#f9f9f9', minHeight: '100px', whiteSpace: 'pre-wrap', color: isLoadingResponse && !responseText ? '#999' : '#333' }}>
                                      {isLoadingResponse && !responseText && <p>AI Tutor is thinking...</p>}
                                      {responseText && (
                                          // Wrap ReactMarkdown to potentially apply styling later via a class if needed
                                          // The 'prose' class from Tailwind typography is often used here, but sticking to inline styles now
                                          <div>
                                              <strong style={{ display: 'block', marginBottom: '0.5em' }}>AI Tutor:</strong> {/* Make label block for spacing */}
                                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                  {responseText}
                                              </ReactMarkdown>
                                          </div>
                                      )}
                                  </div>
                                  )}
                                  {/* --- End Markdown Rendering --- */}
                              </div>
                         </div>
                         {/* Right Column */}
                         <div>
                              <h3>3D Model</h3>
                              {modelFileName ? ( <ThreeDViewer modelFile={modelFileName} /> ) : ( <p>No model available for this selection.</p> )}
                         </div>
                     </div>

                     {/* --- Quiz Section (remains the same) --- */}
                     {!isCompleted(selectedSystem.title) && !showQuiz && currentQuizQuestions.length > 0 && (
                         <div style={{ textAlign: 'center', marginBottom: '2rem', padding: '1rem', border: '1px dashed #007bff', borderRadius: '8px' }}>
                             <p>Ready to test your knowledge?</p>
                             <button onClick={handleStartQuiz} style={{ padding: '0.8rem 2rem', fontSize: '1.1rem', cursor: 'pointer', marginTop: '0.5rem' }}> Start Knowledge Check </button>
                         </div>
                     )}
                     {showQuiz && currentQuizQuestions.length > 0 && (
                         <QuizComponent questions={currentQuizQuestions} userAnswers={userAnswers} onAnswerChange={handleAnswerChange} onSubmitQuiz={handleSubmitQuiz} quizAttempted={quizAttempted} quizPassed={quizPassed} />
                     )}

                     {/* --- Action Buttons (remains the same) --- */}
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem', borderTop: '1px solid #eee', paddingTop: '1.5rem' }}>
                         <button onClick={handleMarkAsComplete} disabled={!canCompleteLesson && !showQuiz} title={!canCompleteLesson && !showQuiz ? "Complete the knowledge check first" : (isCompleted(selectedSystem.title) ? "Lesson already completed" : "Mark this lesson as finished")} style={{ padding: '0.75rem 1.5rem', borderRadius: '6px', cursor: !canCompleteLesson && !showQuiz ? 'not-allowed' : (isCompleted(selectedSystem.title) ? 'default' : 'pointer'), backgroundColor: isCompleted(selectedSystem.title) ? '#6c757d' : (canCompleteLesson ? '#28a745' : '#007bff'), color: 'white', border: 'none', opacity: !canCompleteLesson && !showQuiz ? 0.6 : 1 }}>
                             {isCompleted(selectedSystem.title) ? 'Lesson Completed ✓' : (canCompleteLesson ? 'Mark as Complete' : 'Complete Knowledge Check')}
                         </button>
                         <button onClick={handleCompleteAndNext} disabled={!canCompleteLesson && !showQuiz} title={!canCompleteLesson && !showQuiz ? "Complete the knowledge check first" : (nextLesson ? "Finish this lesson and go to the next" : "Finish the final lesson")} style={{ padding: '0.75rem 1.5rem', borderRadius: '6px', cursor: !canCompleteLesson && !showQuiz ? 'not-allowed' : 'pointer', opacity: !canCompleteLesson && !showQuiz ? 0.6 : 1 }}>
                             {nextLesson ? (canCompleteLesson ? 'Complete & Next Lesson →' : 'Knowledge Check Required →') : (canCompleteLesson ? 'Complete & Finish' : 'Knowledge Check Required')}
                         </button>
                     </div>

                     {/* --- Feedback Form (remains the same) --- */}
                     <FeedbackForm />
                 </div>
            )}
        </div>
    );
}