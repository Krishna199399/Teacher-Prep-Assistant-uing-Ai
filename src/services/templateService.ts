// Template service for managing lesson plan templates

export interface LessonTemplate {
  id: string;
  title: string;
  description: string;
  subject: string;
  gradeLevel: string;
  objectives: string[];
  activities: {
    title: string;
    duration: string;
    description: string;
  }[];
  materials: string[];
  assessment: string;
  differentiation: string;
  thumbnailUrl?: string;
  category: string;
}

// Sample template data
const templates: LessonTemplate[] = [
  {
    id: 'template1',
    title: '5E Science Lesson',
    description: 'A science lesson following the 5E instructional model: Engage, Explore, Explain, Elaborate, Evaluate.',
    subject: 'Science',
    gradeLevel: '5',
    category: 'Instructional Models',
    objectives: [
      'Students will be able to formulate a hypothesis based on observations.',
      'Students will be able to design and conduct a simple experiment.',
      'Students will be able to analyze data and draw conclusions.',
      'Students will be able to communicate findings using scientific vocabulary.'
    ],
    activities: [
      {
        title: 'Engage',
        duration: '10 mins',
        description: 'Begin with a demonstration or question that captures students\' interest and accesses prior knowledge.'
      },
      {
        title: 'Explore',
        duration: '20 mins',
        description: 'Students investigate a phenomenon, collect data, and develop concepts through hands-on activities.'
      },
      {
        title: 'Explain',
        duration: '15 mins',
        description: 'Students share observations and explanations while the teacher introduces relevant scientific concepts and vocabulary.'
      },
      {
        title: 'Elaborate',
        duration: '15 mins',
        description: 'Students apply their understanding to new situations or problems, extending their learning.'
      },
      {
        title: 'Evaluate',
        duration: '10 mins',
        description: 'Assess student understanding through formative assessments, observations, or written responses.'
      }
    ],
    materials: [
      'Science notebooks',
      'Investigation materials',
      'Data collection sheets',
      'Visual aids',
      'Assessment tools'
    ],
    assessment: 'Use a combination of formative assessments throughout the lesson and a summative assessment at the end. Include observation checklists, exit tickets, and student self-reflections.',
    differentiation: 'For struggling learners: Provide visual supports, structured data collection templates, and modified expectations. For advanced learners: Offer extension activities, encourage deeper investigations, and provide additional research opportunities.'
  },
  {
    id: 'template2',
    title: 'Math Problem-Based Learning',
    description: 'A math lesson structured around problem-solving, critical thinking, and collaborative learning.',
    subject: 'Math',
    gradeLevel: '4',
    category: 'Problem-Based Learning',
    objectives: [
      'Students will be able to apply mathematical concepts to solve real-world problems.',
      'Students will be able to explain their mathematical reasoning.',
      'Students will be able to evaluate different approaches to solving a problem.',
      'Students will be able to use appropriate mathematical tools strategically.'
    ],
    activities: [
      {
        title: 'Problem Introduction',
        duration: '10 mins',
        description: 'Present a real-world problem scenario that requires mathematical thinking to solve.'
      },
      {
        title: 'Think-Pair-Share',
        duration: '5 mins',
        description: 'Students individually think about possible approaches, then share with a partner.'
      },
      {
        title: 'Small Group Problem-Solving',
        duration: '20 mins',
        description: 'In groups, students work together to solve the problem, documenting their process.'
      },
      {
        title: 'Gallery Walk',
        duration: '15 mins',
        description: 'Groups post their solutions and rotate to review and provide feedback on other groups\' work.'
      },
      {
        title: 'Class Discussion',
        duration: '10 mins',
        description: 'Discuss different approaches, solutions, and connections to mathematical concepts.'
      },
      {
        title: 'Individual Reflection',
        duration: '10 mins',
        description: 'Students individually reflect on their learning and complete a similar problem independently.'
      }
    ],
    materials: [
      'Problem scenario cards',
      'Chart paper and markers',
      'Math manipulatives',
      'Calculators',
      'Student reflection sheets'
    ],
    assessment: 'Assess students based on their problem-solving process, mathematical reasoning, collaboration skills, and individual understanding demonstrated in the final reflection and independent work.',
    differentiation: 'For struggling learners: Provide simpler versions of the problem, visual supports, and more structured guidance. For advanced learners: Add complexity to the problem, encourage multiple solution methods, and pose extension challenges.'
  },
  {
    id: 'template3',
    title: 'ELA Reading Workshop',
    description: 'A structured reading workshop lesson with mini-lesson, independent reading, conferencing, and sharing.',
    subject: 'English',
    gradeLevel: '3',
    category: 'Literacy',
    objectives: [
      'Students will be able to apply the focus reading strategy to appropriate texts.',
      'Students will be able to make meaningful connections to the text.',
      'Students will be able to respond to reading through written reflection.',
      'Students will be able to participate in productive discussions about texts.'
    ],
    activities: [
      {
        title: 'Mini-Lesson',
        duration: '10 mins',
        description: 'Introduce the reading strategy or skill focus for the day with direct instruction and modeling.'
      },
      {
        title: 'Independent Reading',
        duration: '20 mins',
        description: 'Students read self-selected texts at their level, applying the focus strategy.'
      },
      {
        title: 'Reading Conferences',
        duration: '15 mins',
        description: 'Teacher conducts 3-5 individual conferences while other students continue reading.'
      },
      {
        title: 'Reader\'s Response',
        duration: '10 mins',
        description: 'Students write a brief response to their reading, focusing on the day\'s strategy.'
      },
      {
        title: 'Partner/Group Share',
        duration: '10 mins',
        description: 'Students share their responses and discuss their application of the reading strategy.'
      },
      {
        title: 'Closure',
        duration: '5 mins',
        description: 'Summarize the day\'s learning and preview upcoming reading work.'
      }
    ],
    materials: [
      'Classroom library books',
      'Reading strategy anchor charts',
      'Reading response journals',
      'Conference tracking form',
      'Sticky notes for marking text'
    ],
    assessment: 'Assess students through reading conference notes, response journal entries, and participation in discussions. Use a simple rubric aligned with the day\'s focus strategy.',
    differentiation: 'Students read texts at their individual reading levels. Provide scaffolded response templates for struggling readers and more complex prompts for advanced readers.'
  }
];

// Get all templates
export const getAllTemplates = (): LessonTemplate[] => {
  return templates;
};

// Get templates by subject
export const getTemplatesBySubject = (subject: string): LessonTemplate[] => {
  return templates.filter(template => template.subject === subject);
};

// Get templates by grade level
export const getTemplatesByGradeLevel = (gradeLevel: string): LessonTemplate[] => {
  return templates.filter(template => template.gradeLevel === gradeLevel);
};

// Get template by ID
export const getTemplateById = (id: string): LessonTemplate | undefined => {
  return templates.find(template => template.id === id);
};

// Get template categories
export const getTemplateCategories = (): string[] => {
  const categories = new Set<string>();
  templates.forEach(template => categories.add(template.category));
  return Array.from(categories);
};

// Get templates by category
export const getTemplatesByCategory = (category: string): LessonTemplate[] => {
  return templates.filter(template => template.category === category);
}; 