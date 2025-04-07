// src/app/components/DefinitionAndInsight.jsx
'use client';

import React, { useState, useEffect } from 'react'; // Added useEffect

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function DefinitionAndInsight({ definition, onGetInsight, isLoading }) { // Added isLoading prop
  const [insight, setInsight] = useState('');
  const [internalLoading, setInternalLoading] = useState(false); // Manage local loading state

  // Clear insight when definition changes
  useEffect(() => {
    setInsight('');
  }, [definition]);

  const handleInsightClick = async () => {
    if (onGetInsight && !isLoading && !internalLoading) { // Check both external and internal loading
      setInternalLoading(true); // Start internal loading
      setInsight(''); // Clear previous insight
      try {
        const result = await onGetInsight(); // Call the passed function
        setInsight(result);
      } catch (error) {
        // Error is likely handled in the parent, but could set local error state here
        console.error("Error during insight fetch:", error);
        setInsight("Failed to load insight.");
      } finally {
        setInternalLoading(false); // Stop internal loading
      }
    }
  };

  return (
    <div style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#fff' }}> {/* Added bg color */}
      <h2 style={{ color: '#555' }}>Definition</h2>
      <p style={{ color: '#555' }}>{definition}</p> {/* Slightly darker text */}
      <button
        onClick={handleInsightClick}
        disabled={isLoading || internalLoading} // Disable if either loading state is true
        style={{
          border: '1px solid #ddd', 
          backgroundColor: '#333',
          borderRadius: '8px',
          color: '#fff',
          marginTop: '1rem',
          padding: '0.6rem 1.2rem', // Adjusted padding
          cursor: (isLoading || internalLoading) ? 'wait' : 'pointer', // Indicate loading
          borderRadius: '6px'
        }}
      >
        {(isLoading || internalLoading) ? 'Getting Insight...' : 'Get AI Insight'}
      </button>
      {(insight || internalLoading) && ( // Show if loading or has insight
        <div style={{ marginTop: '1rem', padding: '1rem', background: '#f0f0f0', borderRadius: '8px' }}> {/* Lighter insight bg */}
          <h3 style={{ color: '#333', marginBottom: '0.5rem' }}>AI Insight</h3> {/* Adjusted styles */}
          {internalLoading && !insight && <p style={{ color: '#777' }}>Loading...</p>}
          {insight && (
            // --- Render Insight as Markdown ---
            <div style={{ color: '#333' }}> {/* Apply base text color to the container */}
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {insight}
              </ReactMarkdown>
            </div>
            // --- End Markdown Rendering ---
          )}
        </div>
      )}
    </div>
  );
}