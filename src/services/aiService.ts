// AI-powered services for teacher assistance

import api from './api';

interface LessonPlanRequest {
  subject: string;
  gradeLevel: string;
  topic?: string;
  duration?: number;
  standardsAlignment?: string[];
}

interface LessonObjective {
  text: string;
}

interface LessonActivity {
  title: string;
  duration: string;
  description: string;
}

export interface AIGeneratedLessonPlan {
  title: string;
  objectives: LessonObjective[];
  activities: LessonActivity[];
  materials: string[];
  assessment: string;
  differentiation: string;
}

// Simulates an AI-generated lesson plan (renamed to avoid duplication)
export const simulateAILessonPlan = async (params: LessonPlanRequest): Promise<AIGeneratedLessonPlan> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // In a real app, this would call an external AI service
  const subject = params.subject;
  const gradeLevel = params.gradeLevel;
  const topic = params.topic || getDefaultTopic(subject, gradeLevel);
  
  return {
    title: `${topic} - ${subject} Lesson for Grade ${gradeLevel}`,
    objectives: generateObjectives(subject, gradeLevel, topic),
    activities: generateActivities(subject, gradeLevel, topic),
    materials: generateMaterials(subject, topic),
    assessment: generateAssessmentDescription(subject, gradeLevel, topic),
    differentiation: generateDifferentiation(gradeLevel)
  };
};

// Generate a topic if not provided
const getDefaultTopic = (subject: string, gradeLevel: string): string => {
  const topics: {[key: string]: {[key: string]: string}} = {
    'Math': {
      '1': 'Addition and Subtraction within 20',
      '2': 'Place Value to 100',
      '3': 'Multiplication Concepts',
      '4': 'Fractions and Decimals',
      '5': 'Volume and Area',
      '6': 'Ratios and Proportions',
      '7': 'Algebraic Expressions',
      '8': 'Linear Equations',
      '9': 'Quadratic Functions',
      '10': 'Trigonometric Ratios',
      '11': 'Logarithmic Functions',
      '12': 'Calculus Concepts'
    },
    'Science': {
      '1': 'Living and Nonliving Things',
      '2': 'States of Matter',
      '3': 'Plant Life Cycles',
      '4': 'Energy and Motion',
      '5': 'Ecosystems',
      '6': 'Earth and Space',
      '7': 'Cell Structure and Function',
      '8': 'Force and Motion',
      '9': 'Chemical Reactions',
      '10': 'Genetics and Heredity',
      '11': 'Atomic Structure',
      '12': 'Organic Chemistry'
    },
    'English': {
      '1': 'Beginning Reading and Phonics',
      '2': 'Reading Comprehension Strategies',
      '3': 'Parts of Speech',
      '4': 'Story Elements',
      '5': 'Author\'s Purpose',
      '6': 'Literary Analysis',
      '7': 'Essay Writing',
      '8': 'Textual Evidence',
      '9': 'Rhetorical Strategies',
      '10': 'Shakespeare\'s Works',
      '11': 'American Literature',
      '12': 'World Literature'
    },
    'Social Studies': {
      '1': 'Communities and Maps',
      '2': 'Historical Figures',
      '3': 'Local Community History',
      '4': 'State History',
      '5': 'U.S. History: Early Exploration',
      '6': 'Ancient Civilizations',
      '7': 'World Geography',
      '8': 'U.S. Constitution',
      '9': 'World History: Industrial Revolution',
      '10': 'U.S. Government',
      '11': 'World History: 20th Century',
      '12': 'Economics and Financial Literacy'
    }
  };
  
  return topics[subject]?.[gradeLevel] || `${subject} Fundamentals`;
};

// Generate learning objectives
const generateObjectives = (subject: string, gradeLevel: string, topic: string): LessonObjective[] => {
  // This would be AI-generated in a real application
  const objectives = [
    { text: `Students will be able to identify key concepts related to ${topic}.` },
    { text: `Students will be able to explain the importance of ${topic} in ${subject}.` },
    { text: `Students will be able to apply ${topic} concepts to solve grade-appropriate problems.` }
  ];
  
  // Add grade-specific objectives
  if (parseInt(gradeLevel) <= 5) {
    objectives.push({ text: `Students will be able to create visual representations of ${topic}.` });
  } else {
    objectives.push({ text: `Students will be able to analyze and evaluate information related to ${topic}.` });
    objectives.push({ text: `Students will be able to make connections between ${topic} and real-world applications.` });
  }
  
  return objectives;
};

// Generate activities
const generateActivities = (subject: string, gradeLevel: string, topic: string): LessonActivity[] => {
  const isElementary = parseInt(gradeLevel) <= 5;
  
  const activities = [
    {
      title: 'Introduction',
      duration: '10 mins',
      description: `Introduce the topic of ${topic} through a brief discussion and activation of prior knowledge.`
    }
  ];
  
  if (isElementary) {
    activities.push(
      {
        title: 'Read Aloud',
        duration: '15 mins',
        description: `Read a grade-appropriate text related to ${topic} and discuss key concepts as a class.`
      },
      {
        title: 'Hands-On Activity',
        duration: '20 mins',
        description: `Students work in pairs to complete a hands-on activity exploring ${topic}.`
      },
      {
        title: 'Guided Practice',
        duration: '15 mins',
        description: 'Guide students through practice problems or activities, providing feedback and support.'
      },
      {
        title: 'Wrap-Up',
        duration: '10 mins',
        description: 'Review key concepts and preview the next lesson.'
      }
    );
  } else {
    activities.push(
      {
        title: 'Direct Instruction',
        duration: '15 mins',
        description: `Present key concepts related to ${topic} using multimedia resources and examples.`
      },
      {
        title: 'Small Group Investigation',
        duration: '25 mins',
        description: `Students work in small groups to investigate aspects of ${topic} through guided research or problem-solving.`
      },
      {
        title: 'Discussion and Synthesis',
        duration: '15 mins',
        description: 'Facilitate a class discussion where groups share findings and synthesize information.'
      },
      {
        title: 'Independent Application',
        duration: '15 mins',
        description: 'Students independently apply what they have learned to a new context or problem.'
      },
      {
        title: 'Closure and Assessment',
        duration: '10 mins',
        description: 'Summarize learning, address questions, and conduct a brief formative assessment.'
      }
    );
  }
  
  return activities;
};

// Generate materials list
const generateMaterials = (subject: string, topic: string): string[] => {
  const commonMaterials = [
    'Whiteboard/Smartboard',
    'Markers/Pens',
    'Student notebooks',
    'Handouts (digital or print)'
  ];
  
  const subjectSpecificMaterials: {[key: string]: string[]} = {
    'Math': ['Rulers', 'Graph paper', 'Calculators', 'Manipulatives'],
    'Science': ['Science notebooks', 'Safety goggles', 'Experiment materials', 'Digital microscopes'],
    'English': ['Reading materials', 'Vocabulary lists', 'Writing prompts', 'Graphic organizers'],
    'Social Studies': ['Maps', 'Primary source documents', 'Timeline materials', 'Historical images']
  };
  
  return [
    ...commonMaterials,
    ...(subjectSpecificMaterials[subject] || []),
    `${topic} reference materials`
  ];
};

// Generate assessment description
const generateAssessmentDescription = (subject: string, gradeLevel: string, topic: string): string => {
  const isElementary = parseInt(gradeLevel) <= 5;
  
  if (isElementary) {
    return `Students will be assessed through observation during activities, completion of a simple worksheet demonstrating understanding of ${topic}, and participation in class discussions. A brief exit ticket will be used to check for individual understanding.`;
  } else {
    return `Students will be assessed through their contributions to group work, quality of discussion participation, and completion of an individual written reflection demonstrating critical thinking about ${topic}. A formative assessment aligned with learning objectives will be administered at the end of the lesson.`;
  }
};

// Generate differentiation strategies
const generateDifferentiation = (gradeLevel: string): string => {
  const isElementary = parseInt(gradeLevel) <= 5;
  
  if (isElementary) {
    return `For struggling learners: Provide visual supports, simplified vocabulary, and one-on-one assistance during independent work. For advanced learners: Offer extended challenges that deepen understanding through more complex problems or independent exploration.`;
  } else {
    return `For struggling learners: Provide guided notes, additional supporting resources, and structured group roles. For advanced learners: Encourage deeper analysis through additional questions, leadership roles in groups, and extension activities that connect to higher-level thinking skills.`;
  }
};

// Generate feedback on student assignments
export const generateAssignmentFeedback = async (
  assignmentType: string, 
  gradeLevel: string, 
  studentResponse: string
): Promise<string> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // In a real app, this would call an external AI service
  const feedbackTemplates = [
    "Great job on explaining the key concepts! To improve, consider adding more specific examples to support your points.",
    "Your work demonstrates good understanding of the topic. Next time, try to organize your ideas more clearly with stronger transitions.",
    "You've made some strong arguments. To strengthen your response, include more evidence from the source materials.",
    "Your response includes important information. Consider developing your analysis further by explaining the significance of what you observed.",
    "You've done well identifying main ideas. To reach the next level, work on developing deeper connections between concepts."
  ];
  
  // Randomly select a feedback template (would be AI-generated in reality)
  const randomIndex = Math.floor(Math.random() * feedbackTemplates.length);
  return feedbackTemplates[randomIndex];
};

/**
 * Generate a complete lesson plan using AI
 * @param {string} subject - Subject area (e.g., "Math", "Science")
 * @param {string} gradeLevel - Grade level (e.g., "3rd Grade", "High School")
 * @param {string} duration - Lesson duration (e.g., "45 minutes", "1 hour")
 * @param {string} objectives - Learning objectives
 * @param {string} standards - Educational standards to cover
 * @returns {Promise<object>} The generated lesson plan
 */
export const generateLessonPlan = async (
  subject: string,
  gradeLevel: string,
  duration: string,
  objectives: string,
  standards: string
): Promise<any> => {
  try {
    console.log('Generating AI lesson plan...');
    
    const response = await api.post('/ai/generate-lesson', {
      subject,
      gradeLevel,
      duration,
      objectives,
      standards
    });
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to generate lesson plan');
    }
    
    const lessonPlan = response.data.data;
    console.log('AI lesson plan generated successfully');
    
    return {
      title: lessonPlan.title || `${subject} Lesson: ${objectives.split(' ').slice(0, 5).join(' ')}...`,
      subject,
      gradeLevel,
      duration,
      objectives: lessonPlan.objectives || objectives,
      standards,
      materials: lessonPlan.materials || [],
      warmUp: lessonPlan.warmUp || { 
        title: "Warm-up Activity", 
        description: "Brief activity to engage students", 
        duration: "5-10 minutes" 
      },
      mainActivities: lessonPlan.mainActivities || [
        { 
          title: "Main Activity", 
          description: "Primary learning activity", 
          duration: "20-30 minutes" 
        }
      ],
      assessment: lessonPlan.assessment || { 
        method: "Formative Assessment", 
        description: "How student understanding will be assessed" 
      },
      closure: lessonPlan.closure || { 
        description: "Summary of key learning points", 
        duration: "5 minutes" 
      },
      differentiation: lessonPlan.differentiation || {
        advanced: "Extension for advanced students",
        struggling: "Support for struggling students",
        ell: "Modifications for English language learners"
      },
      notes: lessonPlan.notes || "",
      createdBy: "AI Assistant"
    };
  } catch (error) {
    console.error('Error generating lesson plan:', error);
    throw new Error(`Failed to generate lesson plan: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Generate an assessment based on lesson content
 * @param {string} lessonContent - The lesson content or objectives
 * @param {string} assessmentType - Type of assessment (quiz, test, rubric)
 * @param {string} gradeLevel - Target grade level
 * @param {number} questionCount - Number of questions to generate
 * @param {string[]} questionTypes - Types of questions (multiple-choice, short-answer, essay, etc.)
 * @returns {Promise<object>} The generated assessment
 */
export const generateAssessment = async (
  lessonContent: string,
  assessmentType: 'quiz' | 'test' | 'rubric',
  gradeLevel: string,
  questionCount: number = 10,
  questionTypes: string[] = ['multiple-choice']
): Promise<any> => {
  try {
    console.log('Generating AI assessment...');
    
    const response = await api.post('/ai/generate-assessment', {
      lessonContent,
      assessmentType,
      gradeLevel,
      questionCount,
      questionTypes
    });
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to generate assessment');
    }
    
    const assessment = response.data.data;
    console.log('AI assessment generated successfully');
    
    return {
      title: assessment.title || `${assessmentType.charAt(0).toUpperCase() + assessmentType.slice(1)} on ${lessonContent.split(' ').slice(0, 3).join(' ')}...`,
      description: assessment.description || "Assessment based on lesson content",
      assessmentType,
      gradeLevel,
      totalPoints: assessment.totalPoints || questionCount * 10,
      timeLimit: assessment.timeLimit || 30,
      instructions: assessment.instructions || `Complete all ${questionCount} questions in the allotted time.`,
      questions: assessment.questions || generateDefaultQuestions(lessonContent, questionCount, questionTypes),
      rubric: assessmentType === 'rubric' ? assessment.rubric || generateDefaultRubric() : undefined,
      createdBy: "AI Assistant",
      createdAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error generating assessment:', error);
    throw new Error(`Failed to generate assessment: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Helper function to generate default questions if the API fails
const generateDefaultQuestions = (
  lessonContent: string,
  count: number,
  types: string[]
): any[] => {
  const questions = [];
  
  for (let i = 0; i < count; i++) {
    const typeIndex = i % types.length;
    const type = types[typeIndex];
    
    if (type === 'multiple-choice') {
      questions.push({
        id: `q${i+1}`,
        type: 'multiple-choice',
        text: `Question ${i+1} about ${lessonContent.split(' ').slice(0, 3).join(' ')}...`,
        options: [
          { id: `q${i+1}_a`, text: 'Answer option A' },
          { id: `q${i+1}_b`, text: 'Answer option B' },
          { id: `q${i+1}_c`, text: 'Answer option C' },
          { id: `q${i+1}_d`, text: 'Answer option D' }
        ],
        correctAnswerId: `q${i+1}_a`,
        points: 10
      });
    } else if (type === 'short-answer') {
      questions.push({
        id: `q${i+1}`,
        type: 'short-answer',
        text: `Short answer question ${i+1} about ${lessonContent.split(' ').slice(0, 3).join(' ')}...`,
        expectedAnswer: 'Key points expected in the answer',
        points: 10
      });
    } else if (type === 'essay') {
      questions.push({
        id: `q${i+1}`,
        type: 'essay',
        text: `Essay question ${i+1}: Analyze and discuss ${lessonContent.split(' ').slice(0, 3).join(' ')}...`,
        rubricPoints: [
          { criteria: 'Understanding of concept', maxPoints: 5 },
          { criteria: 'Evidence and examples', maxPoints: 5 },
          { criteria: 'Organization and clarity', maxPoints: 5 },
          { criteria: 'Grammar and mechanics', maxPoints: 5 }
        ],
        points: 20
      });
    } else {
      questions.push({
        id: `q${i+1}`,
        type: 'true-false',
        text: `True/False: Statement ${i+1} about ${lessonContent.split(' ').slice(0, 3).join(' ')}...`,
        correctAnswer: Math.random() > 0.5,
        points: 5
      });
    }
  }
  
  return questions;
};

// Helper function to generate a default rubric
const generateDefaultRubric = (): any => {
  return {
    criteria: [
      {
        name: 'Content Understanding',
        levels: [
          { score: 4, description: 'Demonstrates excellent understanding of the topic' },
          { score: 3, description: 'Shows good understanding of most concepts' },
          { score: 2, description: 'Shows basic understanding of some concepts' },
          { score: 1, description: 'Shows minimal understanding of the topic' }
        ]
      },
      {
        name: 'Organization',
        levels: [
          { score: 4, description: 'Very well organized with clear structure' },
          { score: 3, description: 'Well organized with logical flow' },
          { score: 2, description: 'Some organization but flow needs improvement' },
          { score: 1, description: 'Disorganized and difficult to follow' }
        ]
      },
      {
        name: 'Evidence & Examples',
        levels: [
          { score: 4, description: 'Strong evidence and relevant examples throughout' },
          { score: 3, description: 'Good evidence and examples in most areas' },
          { score: 2, description: 'Limited evidence or examples' },
          { score: 1, description: 'Minimal or no supporting evidence' }
        ]
      },
      {
        name: 'Mechanics',
        levels: [
          { score: 4, description: 'No errors in grammar, spelling, or mechanics' },
          { score: 3, description: 'Few minor errors that don\'t interfere with clarity' },
          { score: 2, description: 'Several errors that occasionally interfere with clarity' },
          { score: 1, description: 'Numerous errors that significantly impact clarity' }
        ]
      }
    ],
    totalPoints: 16
  };
}; 