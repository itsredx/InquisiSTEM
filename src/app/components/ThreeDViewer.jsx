// src/app/components/ThreeDViewer.jsx
'use client';

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Html } from '@react-three/drei'; // Import useGLTF and Html

// Helper component to load and display the model
function Model({ modelUrl }) {
  // useGLTF hook simplifies loading GLB/GLTF models and caches them
  const { scene } = useGLTF(modelUrl);

  // You might need to adjust scale and position based on your models
  // You can inspect your models in viewers like https://gltf-viewer.donmccurdy.com/
  // to find appropriate values.
  let scale = 1;
  let position = [0, 0, 0];

  // Example adjustments (replace with actual values for your models)
  if (modelUrl.includes('human-brain')) {
    scale = 0.5; // Example: Brain model might be large
    position = [0, -0.5, 0]; // Example: Center it vertically
  } else if (modelUrl.includes('lungs')) {
    scale = 0.8;
    position = [0, -0.8, 0];
  } else if (modelUrl.includes('amoeba')) {
     scale = 2; // Example: Amoeba might be small
     position = [0, 0, 0];
  }

  // Clone the scene to avoid modifying the cached version directly if needed
  // For simple display, direct use is often fine.
  return <primitive object={scene} scale={scale} position={position} />;
}

// Loading fallback component
function Loader() {
  return <Html center>Loading model...</Html>; // Shows text while loading
}

export default function ThreeDViewer({ modelFile }) {
  if (!modelFile) {
    return <div style={{ width: '100%', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #ccc' }}>Select a system to view the model.</div>;
  }

  const modelUrl = `/models/${modelFile}`; // Construct the path relative to the public folder

  return (
    <div style={{ width: '100%', height: '400px', border: '1px solid #eee', borderRadius: '8px', overflow: 'hidden' }}> {/* Added border/styling */}
      <Canvas camera={{ position: [2, 2, 5], fov: 50 }}> {/* Adjust camera position/fov as needed */}
        <ambientLight intensity={0.6} /> {/* Adjusted intensity */}
        <directionalLight position={[10, 10, 5]} intensity={1} /> {/* Added directional light */}
        <pointLight position={[-10, -10, -10]} intensity={0.5} />

        <Suspense fallback={<Loader />}>
          {/* Use the key prop to force re-render on model change */}
          <Model key={modelUrl} modelUrl={modelUrl} />
        </Suspense>

        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
      </Canvas>
    </div>
  );
}

// Make sure to pre-load models for better performance with useGLTF
// This line should ideally be outside the component if you want true preloading,
// but placing it here ensures the hook is used correctly.
// You might manage preloading state higher up in your app if needed.
useGLTF.preload('/models/human-brain.glb');
useGLTF.preload('/models/lungs.glb');
useGLTF.preload('/models/amoeba.glb');