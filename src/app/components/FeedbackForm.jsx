// src/app/components/FeedbackForm.jsx
'use client';

import React, { useState } from 'react';

export default function FeedbackForm() {
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you can send the feedback to an API endpoint if desired
    console.log('Feedback submitted:', feedback);
    setSubmitted(true);
  };

  return (
    <div style={{ marginTop: '2rem', borderTop: '1px solid #ccc', paddingTop: '1rem' }}>
      <h3>Was this helpful?</h3>
      <form onSubmit={handleSubmit}>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="What would make this better?"
          rows={4}
          style={{ width: '100%', padding: '0.5rem' }}
        />
        <button type="submit" style={{ marginTop: '0.5rem', padding: '0.5rem 1rem' }}>
          Submit Feedback
        </button>
      </form>
      {submitted && <p>Thank you for your feedback!</p>}
    </div>
  );
}
