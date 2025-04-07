// src/app/components/QuizComponent.tsx
'use client';

import React from 'react';
import type { QuizQuestion } from '../data/quizData'; // Import the type

interface QuizComponentProps {
  questions: QuizQuestion[];
  userAnswers: { [key: string]: string };
  onAnswerChange: (questionId: string, answer: string) => void;
  onSubmitQuiz: () => void;
  quizAttempted: boolean;
  quizPassed: boolean | null; // null if not attempted, true/false after attempt
}

export default function QuizComponent({
  questions,
  userAnswers,
  onAnswerChange,
  onSubmitQuiz,
  quizAttempted,
  quizPassed,
}: QuizComponentProps) {

  const getFeedbackStyle = (questionId: string, option: string): React.CSSProperties => {
    if (!quizAttempted) return {}; // No feedback before submission

    const question = questions.find(q => q.id === questionId);
    if (!question) return {};

    const isCorrect = option === question.correctAnswer;
    const isSelected = userAnswers[questionId] === option;

    if (isSelected) {
      return {
        fontWeight: 'bold',
        color: isCorrect ? 'green' : 'red',
        border: `2px solid ${isCorrect ? 'green' : 'red'}`, // Highlight selected answer
        padding: '8px', // Add some padding to make border visible
        borderRadius: '4px',
        display: 'inline-block', // Needed for border padding
         margin: '2px 0'
      };
    } else if (isCorrect) {
       // Optionally highlight the correct answer if the user chose wrong
       // return { border: '1px dashed green', padding: '8px', borderRadius: '4px', display: 'inline-block', margin: '2px 0' };
    }
    return { padding: '8px', display: 'inline-block', margin: '2px 0' }; // Default padding for alignment
  };


  return (
    <div style={{ marginTop: '2rem', padding: '1.5rem', border: '1px solid #007bff', borderRadius: '8px', backgroundColor: '#f0f7ff' }}>
      <h3 style={{ marginTop: 0, color: '#0056b3', borderBottom: '1px solid #ccc', paddingBottom: '0.5rem' }}>Knowledge Check</h3>
      <p style={{ color: '#555' }}>Answer all questions correctly to complete the lesson.</p>
      <form onSubmit={(e) => { e.preventDefault(); onSubmitQuiz(); }}>
        {questions.map((q, index) => (
          <div key={q.id} style={{ marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: index < questions.length - 1 ? '1px dashed #ddd' : 'none' }}>
            <p style={{ color: '#555' }}><strong>{index + 1}. {q.questionText}</strong></p>
            <div style={{ color: '#555', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {q.options.map((option) => (
                <label key={option} style={getFeedbackStyle(q.id, option)} >
                  <input
                    type="radio"
                    name={q.id}
                    value={option}
                    checked={userAnswers[q.id] === option}
                    onChange={(e) => onAnswerChange(q.id, e.target.value)}
                    disabled={quizAttempted && quizPassed !== null} // Disable after submission
                    style={{ marginRight: '8px' }}
                  />
                  {option}
                   {/* Show icons after attempt */}
                   {quizAttempted && userAnswers[q.id] === option && (
                      <span> {option === q.correctAnswer ? '✓' : '✗'}</span>
                   )}
                </label>
              ))}
            </div>
             {/* Show correct answer if attempted and wrong */}
             {quizAttempted && userAnswers[q.id] !== q.correctAnswer && (
                <p style={{ color: 'green', fontSize: '0.9em', marginTop: '5px' }}>Correct answer: {q.correctAnswer}</p>
             )}
          </div>
        ))}
        {!quizAttempted || quizPassed === false ? ( // Show Submit only if not passed or not attempted
             <button type="submit" style={{ 
                border: '1px solid #ddd', 
                backgroundColor: '#333',
                color: '#fff', 
                padding: '0.75rem 1.5rem', 
                borderRadius: '6px', 
                cursor: 'pointer' 
                }}>
               Submit Answers
             </button>
        ): null}
      </form>
       {/* Overall Feedback */}
       {quizAttempted && quizPassed === true && (
           <p style={{ color: 'green', fontWeight: 'bold', marginTop: '1rem' }}>Congratulations! You passed the quiz. You can now mark the lesson as complete.</p>
       )}
       {quizAttempted && quizPassed === false && (
           <p style={{ color: 'red', fontWeight: 'bold', marginTop: '1rem' }}>Not quite! Please review your answers and try submitting again.</p>
       )}
    </div>
  );
}