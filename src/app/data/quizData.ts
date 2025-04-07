// src/app/data/quizData.ts

export interface QuizQuestion {
    id: string; // Unique ID for the question within its quiz
    questionText: string;
    options: string[];
    correctAnswer: string;
  }
  
  export interface QuizData {
    [key: string]: QuizQuestion[]; // Map lesson titles to arrays of questions
  }
  
  export const quizData: QuizData = {
    'Human Brain': [
      {
        id: 'hb1',
        questionText: 'Which part of the brain is primarily responsible for higher cognitive functions like thinking and language?',
        options: ['Cerebellum', 'Brainstem', 'Cerebrum', 'Hypothalamus'],
        correctAnswer: 'Cerebrum',
      },
      {
        id: 'hb2',
        questionText: 'What are the basic signaling units of the nervous system?',
        options: ['Glial cells', 'Neurons', 'Axons', 'Synapses'],
        correctAnswer: 'Neurons',
      },
       {
        id: 'hb3',
        questionText: 'Which lobe is mainly involved in processing visual information?',
        options: ['Frontal Lobe', 'Temporal Lobe', 'Parietal Lobe', 'Occipital Lobe'],
        correctAnswer: 'Occipital Lobe',
      },
    ],
    'Lungs': [
      {
        id: 'lu1',
        questionText: 'What is the primary function of the lungs?',
        options: ['Pumping blood', 'Digesting food', 'Gas exchange (Oxygen/CO2)', 'Filtering waste'],
        correctAnswer: 'Gas exchange (Oxygen/CO2)',
      },
      {
        id: 'lu2',
        questionText: 'What are the tiny air sacs in the lungs where gas exchange happens?',
        options: ['Bronchi', 'Trachea', 'Alveoli', 'Diaphragm'],
        correctAnswer: 'Alveoli',
      },
      {
         id: 'lu3',
         questionText: 'Which large muscle below the lungs helps with breathing?',
         options: ['Pectoralis Major', 'Intercostal Muscles', 'Diaphragm', 'Trachea'],
         correctAnswer: 'Diaphragm',
       },
    ],
    'Amoeba': [
      {
        id: 'am1',
        questionText: 'How does an amoeba primarily move?',
        options: ['Flagella', 'Cilia', 'Pseudopods (false feet)', 'Contractile vacuoles'],
        correctAnswer: 'Pseudopods (false feet)',
      },
      {
        id: 'am2',
        questionText: 'Amoeba belong to which kingdom?',
        options: ['Animalia', 'Fungi', 'Plantae', 'Protista'],
        correctAnswer: 'Protista',
      },
       {
        id: 'am3',
        questionText: 'What is the process by which an amoeba engulfs food particles?',
        options: ['Photosynthesis', 'Phagocytosis', 'Osmosis', 'Diffusion'],
        correctAnswer: 'Phagocytosis',
      },
    ],
  };