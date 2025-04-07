// src/app/learn/page.tsx
'use client'; // This page uses client-side hooks for state and auth

import React, { useState, useMemo, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react'; // Import hooks for authentication, including signOut

// Import your existing components
import SystemCard from '../components/SystemCard'; // Adjusted path assuming components are in src/app/components
import ThreeDViewer from '../components/ThreeDViewer';
import FeedbackForm from '../components/FeedbackForm';
import DefinitionAndInsight from '../components/DefinitionAndInsight';
import QuizComponent from '../components/QuizComponent';

// Import context and data
import { useLessonContext } from '../context/LessonContext';
import { quizData } from '../data/quizData';
import type { QuizQuestion } from '../data/quizData';

// Define types (keeping them here for encapsulation)
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
    // ALL HOOKS MUST BE CALLED AT THE TOP LEVEL, UNCONDITIONALLY
    // ========================================================

    const { data: session, status } = useSession(); // Authentication hook
    const { markAsCompleted, isCompleted, isLoadingProgress } = useLessonContext(); // Lesson context hook

    // State for lesson selection and interaction
    const [selectedSystem, setSelectedSystem] = useState<System | null>(null);
    const [input, setInput] = useState('');
    const [responseText, setResponseText] = useState('');
    const [isLoadingInsight, setIsLoadingInsight] = useState(false);
    const [isLoadingResponse, setIsLoadingResponse] = useState(false);

    // State for the quiz
    const [showQuiz, setShowQuiz] = useState(false);
    const [currentQuizQuestions, setCurrentQuizQuestions] = useState<QuizQuestion[]>([]);
    const [userAnswers, setUserAnswers] = useState<{ [key: string]: string }>({});
    const [quizAttempted, setQuizAttempted] = useState(false);
    const [quizPassed, setQuizPassed] = useState<boolean | null>(null);

    // --- Data Definitions (Consider moving outside component if static) ---
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


    // Memos for navigation and derived state
    const currentLessonIndex = useMemo(() => {
        if (!selectedSystem) return -1;
        return systems.findIndex(system => system.title === selectedSystem.title);
    }, [selectedSystem, systems]); // Added `systems` dependency as it's defined inside

    const nextLessonIndex = useMemo(() => {
        if (currentLessonIndex === -1 || currentLessonIndex >= systems.length - 1) return -1;
        return currentLessonIndex + 1;
    }, [currentLessonIndex, systems.length]); // Added `systems.length` dependency

    const nextLesson = useMemo(() => {
        if (nextLessonIndex === -1) return null;
        return systems[nextLessonIndex];
    }, [nextLessonIndex, systems]); // Added `systems` dependency

    const canCompleteLesson = useMemo(() => {
        if (!selectedSystem) return false;
        return isCompleted(selectedSystem.title) || quizPassed === true;
    }, [selectedSystem, isCompleted, quizPassed]);

    const modelFileName = useMemo(() => selectedSystem ? modelFileMapping[selectedSystem.title] : null, [selectedSystem, modelFileMapping]); // Added `modelFileMapping` dependency
    const currentDefinition = useMemo(() => selectedSystem ? definitions[selectedSystem.title] : '', [selectedSystem, definitions]); // Added `definitions` dependency

    // Effect for handling redirection
    useEffect(() => {
        if (status === 'unauthenticated') {
            signIn(); // Redirects to login
        }
    }, [status]);

    // ========================================================
    // END OF HOOK CALLS
    // ========================================================


    // --- Conditional Returns ---
    if (status === 'loading') {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading Session...</div>;
    }

    if (status === 'unauthenticated') {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Redirecting to login...</div>;
    }

    if (isLoadingProgress && status === 'authenticated') {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading Lesson Progress...</div>;
    }

    if (!session) {
         return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading session data...</div>;
    }
    // --- End Conditional Returns ---


    // --- Functions ---
    const resetLessonState = () => {
        setInput(''); setResponseText(''); setIsLoadingInsight(false); setIsLoadingResponse(false);
        setShowQuiz(false); setCurrentQuizQuestions([]); setUserAnswers({}); setQuizAttempted(false); setQuizPassed(null);
    }
    const handleSystemClick = (system: System) => {
      setSelectedSystem(system); resetLessonState();
      // Ensure quizData is available
      const questions = quizData[system.title] || []; setCurrentQuizQuestions(questions);
      if (isCompleted(system.title)) { setQuizPassed(true); setShowQuiz(false); }
    };
    const handleBackClick = () => { setSelectedSystem(null); resetLessonState(); }
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault(); if (!input.trim() || isLoadingResponse || !selectedSystem) return;
      setIsLoadingResponse(true); setResponseText('');
      const userMessage: ChatMessage = { role: 'user', content: input }; setInput('');
      try {
        const messages: ChatMessage[] = [{ role: 'system', content: `You are a helpful biology tutor explaining the ${selectedSystem.title}. Keep responses concise and relevant.`}, userMessage];
        const response = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages }) });
        if (!response.ok) throw new Error(`API Error: ${response.statusText}`); if (!response.body) throw new Error("Response body is null");
        const reader = response.body.getReader(); const decoder = new TextDecoder();
        while (true) { const { done, value } = await reader.read(); if (done) break; const chunk = decoder.decode(value, { stream: true }); setResponseText(prev => prev + chunk); }
      } catch (error) { console.error('Error fetching chat response:', error); setResponseText('Error: Unable to get a response from the tutor.');
      } finally { setIsLoadingResponse(false); }
    };
    const handleGetInsight = async () => {
      if (!selectedSystem || isLoadingInsight) return "Cannot fetch insight now.";
      setIsLoadingInsight(true); let insightText = "";
      try {
        // Ensure definitions are available
        const promptMessage: ChatMessage = { role: 'system', content: `Provide a concise, curiosity-sparking insight (1-2 sentences) for a biology teacher training module on this topic: "${selectedSystem.title}". Definition for context: "${definitions[selectedSystem.title]}".` };
        const messages = [promptMessage];
        const response = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages }) });
        if (!response.ok) throw new Error(`API Error: ${response.statusText}`); if (!response.body) throw new Error("Response body is null");
        const reader = response.body.getReader(); const decoder = new TextDecoder();
        while (true) { const { done, value } = await reader.read(); if (done) break; insightText += decoder.decode(value, { stream: true }); }
        return insightText;
      } catch (error) { console.error('Error fetching AI insight:', error); return "Error: Unable to get insight at this time.";
      } finally { setIsLoadingInsight(false); }
    };
    const handleStartQuiz = () => { if (currentQuizQuestions.length > 0 && selectedSystem && !isCompleted(selectedSystem.title)) { setShowQuiz(true); setUserAnswers({}); setQuizAttempted(false); setQuizPassed(null); } }
    const handleAnswerChange = (questionId: string, answer: string) => { setUserAnswers(prev => ({ ...prev, [questionId]: answer })); if (quizAttempted) { setQuizPassed(null); } };
    const handleSubmitQuiz = () => {
      if (!selectedSystem) return; let correctCount = 0; let allAnswered = true;
      currentQuizQuestions.forEach(q => { if (!userAnswers[q.id]) { allAnswered = false; } if (userAnswers[q.id] === q.correctAnswer) { correctCount++; } });
      if (!allAnswered) { alert("Please answer all questions before submitting."); return; }
      const passed = correctCount === currentQuizQuestions.length; setQuizAttempted(true); setQuizPassed(passed);
      console.log(`Quiz submitted. Score: ${correctCount}/${currentQuizQuestions.length}. Passed: ${passed}`);
    };
    const handleMarkAsComplete = () => { if (selectedSystem && canCompleteLesson) { markAsCompleted(selectedSystem.title); } else if (selectedSystem && !showQuiz && !isCompleted(selectedSystem.title)) { handleStartQuiz(); } }
    const handleCompleteAndNext = () => {
      if (selectedSystem && canCompleteLesson) { markAsCompleted(selectedSystem.title); if (nextLesson) { handleSystemClick(nextLesson); } else { console.log("All lessons completed!"); handleBackClick(); } }
      else if (selectedSystem && !showQuiz && !isCompleted(selectedSystem.title)) { handleStartQuiz(); }
    };
    const handleLogout = () => {
        signOut({ callbackUrl: '/' }); // Redirect to landing page after sign out
    };
    // --- End Functions ---

    // --- Render Logic ---
    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Title & Welcome/Logout Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                {/* Empty div for spacing */}
                <div style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#0a0a0a',
                        color: '#0a0a0a',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '0.9rem'
                    }}>Sign Out</div>
                <h1 style={{ textAlign: 'left', margin: 0 }}>AI-Powered Biology Teacher Chat</h1>
                {/* Logout button */}
                <button
                    onClick={handleLogout}
                    style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '0.9rem'
                    }}
                >
                    Sign Out
                </button>
            </div>
             {/* Welcome message */}
             <p style={{ textAlign: 'center', marginBottom: '2rem', color: '#555' }}>Welcome, {session.user?.name || session.user?.email}!</p>


            {!selectedSystem ? (
                // --- System Selection View ---
                <div>
                    <p style={{ textAlign: 'center', fontSize: '1.1rem', marginBottom: '1.5rem' }}>Select a topic to start:</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', justifyContent: 'center' }}>
                        {systems.map((system) => (
                            <SystemCard
                                key={system.title}
                                title={system.title}
                                description={system.description}
                                onClick={() => handleSystemClick(system)}
                            />
                        ))}
                    </div>
                </div>
            ) : (
                // --- Lesson View ---
                <div>
                     {/* Back Button and Title */}
                     <button onClick={handleBackClick} style={{ marginBottom: '1rem', padding: '0.5rem 1rem' }}> ← Back to Topics </button>
                     <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>{selectedSystem.title}</h2>

                     {/* Main Content Grid */}
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
                                  {(responseText || isLoadingResponse) && (
                                  <div style={{ padding: '1rem', border: '1px solid #eee', borderRadius: '8px', backgroundColor: '#f9f9f9', minHeight: '100px', whiteSpace: 'pre-wrap', color: isLoadingResponse && !responseText ? '#999' : '#333' }}>
                                      {isLoadingResponse && !responseText && <p>AI Tutor is thinking...</p>}
                                      {responseText && <p><strong>AI Tutor:</strong> {responseText}</p>}
                                  </div>
                                  )}
                              </div>
                         </div>
                         {/* Right Column */}
                         <div>
                              <h3>3D Model</h3>
                              {modelFileName ? ( <ThreeDViewer modelFile={modelFileName} /> ) : ( <p>No model available for this selection.</p> )}
                         </div>
                     </div>

                     {/* Quiz Section */}
                     {!isCompleted(selectedSystem.title) && !showQuiz && currentQuizQuestions.length > 0 && (
                         <div style={{ textAlign: 'center', marginBottom: '2rem', padding: '1rem', border: '1px dashed #007bff', borderRadius: '8px' }}>
                         <p>Ready to test your knowledge?</p>
                         <button onClick={handleStartQuiz} style={{ padding: '0.8rem 2rem', fontSize: '1.1rem', cursor: 'pointer', marginTop: '0.5rem' }}> Start Knowledge Check </button>
                         </div>
                     )}
                     {showQuiz && currentQuizQuestions.length > 0 && (
                         <QuizComponent questions={currentQuizQuestions} userAnswers={userAnswers} onAnswerChange={handleAnswerChange} onSubmitQuiz={handleSubmitQuiz} quizAttempted={quizAttempted} quizPassed={quizPassed} />
                     )}

                     {/* Action Buttons */}
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem', borderTop: '1px solid #eee', paddingTop: '1.5rem' }}>
                         <button onClick={handleMarkAsComplete} disabled={!canCompleteLesson && !showQuiz} title={!canCompleteLesson && !showQuiz ? "Complete the knowledge check first" : (isCompleted(selectedSystem.title) ? "Lesson already completed" : "Mark this lesson as finished")} style={{ padding: '0.75rem 1.5rem', borderRadius: '6px', cursor: !canCompleteLesson && !showQuiz ? 'not-allowed' : (isCompleted(selectedSystem.title) ? 'default' : 'pointer'), backgroundColor: isCompleted(selectedSystem.title) ? '#6c757d' : (canCompleteLesson ? '#28a745' : '#007bff'), color: 'white', border: 'none', opacity: !canCompleteLesson && !showQuiz ? 0.6 : 1 }}>
                         {isCompleted(selectedSystem.title) ? 'Lesson Completed ✓' : (canCompleteLesson ? 'Mark as Complete' : 'Complete Knowledge Check')}
                         </button>
                         <button onClick={handleCompleteAndNext} disabled={!canCompleteLesson && !showQuiz} title={!canCompleteLesson && !showQuiz ? "Complete the knowledge check first" : (nextLesson ? "Finish this lesson and go to the next" : "Finish the final lesson")} style={{ padding: '0.75rem 1.5rem', borderRadius: '6px', cursor: !canCompleteLesson && !showQuiz ? 'not-allowed' : 'pointer', opacity: !canCompleteLesson && !showQuiz ? 0.6 : 1 }}>
                         {nextLesson ? (canCompleteLesson ? 'Complete & Next Lesson →' : 'Knowledge Check Required →') : (canCompleteLesson ? 'Complete & Finish' : 'Knowledge Check Required')}
                         </button>
                     </div>

                     {/* Feedback Form */}
                     <FeedbackForm />
                 </div>
            )}
        </div>
    );
}