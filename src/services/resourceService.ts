// Resource service for handling resource operations

export interface Resource {
  id: number;
  title: string;
  description: string;
  subject: string;
  gradeLevel: string;
  type: string;
  imageUrl: string;
  saved: boolean;
  fileType: string;
  downloadCount: number;
  dateAdded: string;
  author: string;
  tags?: string[];
  previewUrl?: string;
  rating?: number;
  url?: string;
}

export interface Collection {
  id: number;
  name: string;
  description: string;
  resourceCount: number;
  resources?: number[]; // Array of resource IDs
  coverImage?: string;
  dateCreated?: string;
}

// Enhanced resource data with more variety and details
const resourcesData: Resource[] = [
  {
    id: 1,
    title: "Fractions Fundamentals Worksheet",
    description: "A comprehensive worksheet covering fraction basics, addition, subtraction, and word problems.",
    subject: "Mathematics",
    gradeLevel: "5th Grade",
    type: "Worksheet",
    imageUrl: "https://via.placeholder.com/300x200?text=Fractions+Worksheet",
    saved: false,
    fileType: "PDF",
    downloadCount: 1245,
    dateAdded: "2023-05-15",
    author: "Math Teachers Association",
    tags: ["fractions", "arithmetic", "elementary math"],
    rating: 4.7,
    previewUrl: "https://via.placeholder.com/800x1100?text=Fractions+Worksheet+Preview",
    url: "/resources/downloads/fractions-worksheet.pdf"
  },
  {
    id: 2,
    title: "Solar System Interactive Model",
    description: "An interactive 3D model of the solar system with animations and guided exploration activities.",
    subject: "Science",
    gradeLevel: "6th Grade",
    type: "Interactive",
    imageUrl: "https://via.placeholder.com/300x200?text=Solar+System+Model",
    saved: true,
    fileType: "HTML",
    downloadCount: 978,
    dateAdded: "2023-04-22",
    author: "NASA Education",
    tags: ["astronomy", "solar system", "interactive", "space"],
    rating: 4.9,
    previewUrl: "https://via.placeholder.com/800x500?text=Interactive+Solar+System+Preview",
    url: "/resources/downloads/solar-system-model.zip"
  },
  {
    id: 3,
    title: "To Kill a Mockingbird Discussion Guide",
    description: "Chapter-by-chapter discussion questions and literary analysis activities.",
    subject: "English",
    gradeLevel: "9th Grade",
    type: "Activity",
    imageUrl: "https://via.placeholder.com/300x200?text=Discussion+Guide",
    saved: false,
    fileType: "DOCX",
    downloadCount: 2105,
    dateAdded: "2023-06-01",
    author: "Literary Resource Center",
    tags: ["literature", "novel study", "discussion questions"],
    rating: 4.5,
    previewUrl: "https://via.placeholder.com/800x1100?text=Mockingbird+Discussion+Guide+Preview",
    url: "/resources/downloads/mockingbird-guide.docx"
  },
  {
    id: 4,
    title: "American Revolution Timeline Project",
    description: "A collaborative project where students create an interactive timeline of the American Revolution.",
    subject: "History",
    gradeLevel: "8th Grade",
    type: "Project",
    imageUrl: "https://via.placeholder.com/300x200?text=Revolution+Timeline",
    saved: true,
    fileType: "PPTX",
    downloadCount: 1653,
    dateAdded: "2023-03-19",
    author: "History Teachers Collaborative",
    tags: ["American Revolution", "timeline", "collaboration"],
    rating: 4.3,
    previewUrl: "https://via.placeholder.com/800x450?text=Revolution+Timeline+Preview",
    url: "/resources/downloads/revolution-timeline.pptx"
  },
  {
    id: 5,
    title: "Introduction to Coding with Scratch",
    description: "Beginner-friendly lesson plans for teaching block-based programming with Scratch.",
    subject: "Technology",
    gradeLevel: "4th Grade",
    type: "Lesson Plan",
    imageUrl: "https://via.placeholder.com/300x200?text=Coding+Intro",
    saved: false,
    fileType: "ZIP",
    downloadCount: 3210,
    dateAdded: "2023-05-30",
    author: "Code.org Educational Team",
    tags: ["coding", "programming", "Scratch", "computer science"],
    rating: 4.8,
    previewUrl: "https://via.placeholder.com/800x600?text=Scratch+Lesson+Preview",
    url: "/resources/downloads/scratch-lessons.zip"
  },
  {
    id: 6,
    title: "Ecosystems Unit Assessment",
    description: "Comprehensive assessment including multiple choice, short answer and project options.",
    subject: "Science",
    gradeLevel: "7th Grade",
    type: "Assessment",
    imageUrl: "https://via.placeholder.com/300x200?text=Ecosystems+Assessment",
    saved: false,
    fileType: "PDF",
    downloadCount: 842,
    dateAdded: "2023-06-10",
    author: "NextGen Science Resources",
    tags: ["ecosystems", "biology", "assessment"],
    rating: 4.2,
    previewUrl: "https://via.placeholder.com/800x1100?text=Ecosystems+Assessment+Preview",
    url: "/resources/downloads/ecosystems-assessment.pdf"
  },
  {
    id: 7,
    title: "Geometry Proofs Interactive Workbook",
    description: "Digital workbook with step-by-step guides to geometric proofs with interactive exercises.",
    subject: "Mathematics",
    gradeLevel: "10th Grade",
    type: "Interactive",
    imageUrl: "https://via.placeholder.com/300x200?text=Geometry+Proofs",
    saved: false,
    fileType: "HTML",
    downloadCount: 1876,
    dateAdded: "2023-02-15",
    author: "Geometric Thinking Institute",
    tags: ["geometry", "proofs", "interactive", "high school math"],
    rating: 4.6,
    previewUrl: "https://via.placeholder.com/800x600?text=Geometry+Proofs+Preview",
    url: "/resources/downloads/geometry-proofs.html"
  },
  {
    id: 8,
    title: "Creative Writing Prompts Collection",
    description: "Over 100 writing prompts organized by genre, theme, and grade level appropriateness.",
    subject: "English",
    gradeLevel: "All Grades",
    type: "Resource",
    imageUrl: "https://via.placeholder.com/300x200?text=Writing+Prompts",
    saved: true,
    fileType: "PDF",
    downloadCount: 5432,
    dateAdded: "2023-01-05",
    author: "Creative Educators Alliance",
    tags: ["writing", "prompts", "creative writing"],
    rating: 4.9,
    previewUrl: "https://via.placeholder.com/800x1100?text=Writing+Prompts+Preview",
    url: "/resources/downloads/writing-prompts.pdf"
  },
  {
    id: 9,
    title: "Chemical Reactions Virtual Lab",
    description: "Simulate various chemical reactions safely with this interactive virtual laboratory.",
    subject: "Science",
    gradeLevel: "11th Grade",
    type: "Interactive",
    imageUrl: "https://via.placeholder.com/300x200?text=Chemistry+Lab",
    saved: false,
    fileType: "HTML",
    downloadCount: 2189,
    dateAdded: "2023-04-11",
    author: "Chemistry Education Foundation",
    tags: ["chemistry", "virtual lab", "chemical reactions"],
    rating: 4.7,
    previewUrl: "https://via.placeholder.com/800x500?text=Virtual+Chemistry+Lab+Preview",
    url: "/resources/downloads/chem-reactions-lab.zip"
  },
  {
    id: 10,
    title: "World Geography Interactive Maps Bundle",
    description: "Set of interactive digital maps covering continents, countries, physical features, and resources.",
    subject: "Geography",
    gradeLevel: "6th Grade",
    type: "Interactive",
    imageUrl: "https://via.placeholder.com/300x200?text=Geography+Maps",
    saved: false,
    fileType: "HTML",
    downloadCount: 3077,
    dateAdded: "2023-03-02",
    author: "Global Education Consortium",
    tags: ["geography", "maps", "interactive", "continents"],
    rating: 4.8,
    previewUrl: "https://via.placeholder.com/800x450?text=Interactive+Maps+Preview",
    url: "/resources/downloads/geography-maps.zip"
  },
  {
    id: 11,
    title: "Shakespeare's Plays Character Analysis Activities",
    description: "In-depth character analysis worksheets and activities for major Shakespearean plays.",
    subject: "English",
    gradeLevel: "10th Grade",
    type: "Activity",
    imageUrl: "https://via.placeholder.com/300x200?text=Shakespeare+Activities",
    saved: false,
    fileType: "PDF",
    downloadCount: 1532,
    dateAdded: "2023-05-22",
    author: "English Literature Resource Center",
    tags: ["Shakespeare", "literature", "character analysis"],
    rating: 4.4,
    previewUrl: "https://via.placeholder.com/800x1100?text=Shakespeare+Activities+Preview",
    url: "/resources/downloads/shakespeare-characters.pdf"
  },
  {
    id: 12,
    title: "Financial Literacy Project for Teens",
    description: "Comprehensive financial literacy curriculum with real-world budgeting and investing simulations.",
    subject: "Economics",
    gradeLevel: "9th Grade",
    type: "Project",
    imageUrl: "https://via.placeholder.com/300x200?text=Financial+Literacy",
    saved: false,
    fileType: "ZIP",
    downloadCount: 2850,
    dateAdded: "2023-02-28",
    author: "Financial Education Network",
    tags: ["economics", "financial literacy", "budgeting", "life skills"],
    rating: 4.9,
    previewUrl: "https://via.placeholder.com/800x600?text=Financial+Literacy+Preview",
    url: "/resources/downloads/financial-literacy.zip"
  }
];

// Define collection data
const collectionsData: Collection[] = [
  { 
    id: 1, 
    name: "Math Units - Fall Semester", 
    description: "All resources for 1st semester math curriculum", 
    resourceCount: 12,
    resources: [1, 7],
    coverImage: "https://via.placeholder.com/300x200?text=Math+Collection",
    dateCreated: "2023-04-15"
  },
  { 
    id: 2, 
    name: "Science Labs", 
    description: "Virtual and in-person lab activities", 
    resourceCount: 8,
    resources: [2, 6, 9],
    coverImage: "https://via.placeholder.com/300x200?text=Science+Labs",
    dateCreated: "2023-03-22"
  },
  { 
    id: 3, 
    name: "Reading Comprehension", 
    description: "Assessment materials and activities", 
    resourceCount: 15,
    resources: [3, 8, 11],
    coverImage: "https://via.placeholder.com/300x200?text=Reading+Materials",
    dateCreated: "2023-05-10"
  },
  {
    id: 4,
    name: "Project-Based Learning",
    description: "Collection of engaging, multi-disciplinary projects",
    resourceCount: 7,
    resources: [4, 12],
    coverImage: "https://via.placeholder.com/300x200?text=PBL+Projects",
    dateCreated: "2023-02-18"
  },
  {
    id: 5,
    name: "Digital Learning Tools",
    description: "Interactive resources for virtual and hybrid learning",
    resourceCount: 10,
    resources: [2, 5, 7, 9, 10],
    coverImage: "https://via.placeholder.com/300x200?text=Digital+Tools",
    dateCreated: "2023-01-30"
  }
];

// Get all resources
export const getAllResources = async (): Promise<Resource[]> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return resourcesData;
};

// Get resource by ID
export const getResourceById = async (id: number): Promise<Resource | undefined> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 300));
  return resourcesData.find(resource => resource.id === id);
};

// Get filtered resources
export const getFilteredResources = async (
  searchTerm?: string,
  subject?: string,
  gradeLevel?: string,
  type?: string
): Promise<Resource[]> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 400));
  
  return resourcesData.filter(resource => {
    const matchesSearch = !searchTerm || 
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSubject = !subject || resource.subject === subject;
    const matchesGradeLevel = !gradeLevel || resource.gradeLevel === gradeLevel;
    const matchesType = !type || resource.type === type;
    
    return matchesSearch && matchesSubject && matchesGradeLevel && matchesType;
  });
};

// Toggle resource saved status
export const toggleResourceSaved = async (id: number): Promise<Resource> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const resourceIndex = resourcesData.findIndex(resource => resource.id === id);
  if (resourceIndex === -1) throw new Error("Resource not found");
  
  resourcesData[resourceIndex].saved = !resourcesData[resourceIndex].saved;
  return resourcesData[resourceIndex];
};

// Get all collections
export const getAllCollections = async (): Promise<Collection[]> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 400));
  return collectionsData;
};

// Create a new collection
export const createCollection = async (collection: Omit<Collection, 'id' | 'dateCreated'>): Promise<Collection> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 600));
  
  const newCollection: Collection = {
    ...collection,
    id: Math.max(...collectionsData.map(c => c.id)) + 1,
    dateCreated: new Date().toISOString().split('T')[0]
  };
  
  collectionsData.push(newCollection);
  return newCollection;
};

// Add resource to collection
export const addResourceToCollection = async (collectionId: number, resourceId: number): Promise<Collection> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 400));
  
  const collectionIndex = collectionsData.findIndex(collection => collection.id === collectionId);
  if (collectionIndex === -1) throw new Error("Collection not found");
  
  if (!collectionsData[collectionIndex].resources) {
    collectionsData[collectionIndex].resources = [];
  }
  
  if (!collectionsData[collectionIndex].resources!.includes(resourceId)) {
    collectionsData[collectionIndex].resources!.push(resourceId);
    collectionsData[collectionIndex].resourceCount = collectionsData[collectionIndex].resources!.length;
  }
  
  return collectionsData[collectionIndex];
};

// Get saved resources
export const getSavedResources = async (): Promise<Resource[]> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 300));
  return resourcesData.filter(resource => resource.saved);
};

// Get collection resources
export const getCollectionResources = async (collectionId: number): Promise<Resource[]> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const collection = collectionsData.find(c => c.id === collectionId);
  if (!collection || !collection.resources) return [];
  
  return resourcesData.filter(resource => collection.resources!.includes(resource.id));
};

// Get subjects list
export const getSubjects = async (): Promise<string[]> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const subjects = new Set(resourcesData.map(resource => resource.subject));
  return Array.from(subjects);
};

// Get grade levels list
export const getGradeLevels = async (): Promise<string[]> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const gradeLevels = new Set(resourcesData.map(resource => resource.gradeLevel));
  return Array.from(gradeLevels);
};

// Get resource types list
export const getResourceTypes = async (): Promise<string[]> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const types = new Set(resourcesData.map(resource => resource.type));
  return Array.from(types);
};

/**
 * Get resource recommendations based on lesson content
 * @param {string} lessonContent - The lesson content to base recommendations on
 * @param {string} gradeLevel - The target grade level
 * @param {string} subject - The subject area
 * @param {string[]} resourceTypes - Types of resources to recommend (videos, worksheets, activities, etc.)
 * @returns {Promise<any[]>} - List of recommended resources
 */
export const getResourceRecommendations = async (
  lessonContent: string,
  gradeLevel: string,
  subject: string,
  resourceTypes: string[] = []
): Promise<any[]> => {
  try {
    console.log(`Getting resource recommendations for ${subject} Grade ${gradeLevel}`);
    
    // In a production app, this would call the API
    // For now, simulate an API call with a delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock resource recommendations based on params
    const recommendedResources = [];
    
    // Helper function to generate a fake rating between 4.0 and 5.0
    const generateRating = () => (4 + Math.random()).toFixed(1);
    
    // Generate video recommendations
    if (resourceTypes.length === 0 || resourceTypes.includes('video')) {
      recommendedResources.push({
        id: `video-${Date.now()}-1`,
        title: `${subject} Concepts: ${lessonContent.split(' ').slice(0, 3).join(' ')}`,
        type: 'video',
        source: 'YouTube',
        duration: '10:25',
        url: 'https://www.youtube.com/watch?v=example1',
        thumbnail: `https://via.placeholder.com/320x180.png?text=${subject}+Video`,
        description: `This video covers key concepts of ${lessonContent.split(' ').slice(0, 5).join(' ')} appropriate for grade ${gradeLevel} students.`,
        rating: generateRating(),
        views: Math.floor(Math.random() * 100000),
        tags: [subject, `Grade ${gradeLevel}`, 'Video', lessonContent.split(' ')[0]],
        dateAdded: new Date().toISOString()
      });
      
      recommendedResources.push({
        id: `video-${Date.now()}-2`,
        title: `Understanding ${lessonContent.split(' ').slice(2, 6).join(' ')}`,
        type: 'video',
        source: 'Khan Academy',
        duration: '8:12',
        url: 'https://www.khanacademy.org/example',
        thumbnail: `https://via.placeholder.com/320x180.png?text=Khan+Academy`,
        description: `A comprehensive explanation of ${lessonContent.split(' ').slice(2, 7).join(' ')} with visual demonstrations and examples.`,
        rating: generateRating(),
        views: Math.floor(Math.random() * 80000),
        tags: [subject, `Grade ${gradeLevel}`, 'Video', 'Tutorial'],
        dateAdded: new Date().toISOString()
      });
    }
    
    // Generate worksheet recommendations
    if (resourceTypes.length === 0 || resourceTypes.includes('worksheet')) {
      recommendedResources.push({
        id: `worksheet-${Date.now()}-1`,
        title: `${subject} Practice: ${lessonContent.split(' ').slice(0, 3).join(' ')}`,
        type: 'worksheet',
        format: 'PDF',
        pages: Math.floor(Math.random() * 5) + 1,
        url: 'https://www.example.com/worksheet1.pdf',
        thumbnail: `https://via.placeholder.com/210x297.png?text=${subject}+Worksheet`,
        description: `Practice worksheet covering ${lessonContent.split(' ').slice(0, 8).join(' ')} with a variety of question types.`,
        rating: generateRating(),
        downloads: Math.floor(Math.random() * 5000),
        tags: [subject, `Grade ${gradeLevel}`, 'Worksheet', 'Practice'],
        dateAdded: new Date().toISOString()
      });
      
      recommendedResources.push({
        id: `worksheet-${Date.now()}-2`,
        title: `${lessonContent.split(' ').slice(1, 4).join(' ')} Activities`,
        type: 'worksheet',
        format: 'Google Doc',
        pages: Math.floor(Math.random() * 3) + 2,
        url: 'https://docs.google.com/example',
        thumbnail: `https://via.placeholder.com/210x297.png?text=Interactive+Worksheet`,
        description: `Interactive worksheet that guides students through understanding ${lessonContent.split(' ').slice(1, 6).join(' ')}.`,
        rating: generateRating(),
        downloads: Math.floor(Math.random() * 3000),
        tags: [subject, `Grade ${gradeLevel}`, 'Worksheet', 'Interactive'],
        dateAdded: new Date().toISOString()
      });
    }
    
    // Generate interactive activity recommendations
    if (resourceTypes.length === 0 || resourceTypes.includes('activity')) {
      recommendedResources.push({
        id: `activity-${Date.now()}-1`,
        title: `Interactive ${subject} Exploration: ${lessonContent.split(' ').slice(0, 2).join(' ')}`,
        type: 'activity',
        format: 'Web App',
        estimatedTime: '20 minutes',
        url: 'https://www.phet.colorado.edu/example',
        thumbnail: `https://via.placeholder.com/300x200.png?text=Interactive+${subject}`,
        description: `Students explore ${lessonContent.split(' ').slice(0, 6).join(' ')} through this interactive simulation with guided questions.`,
        rating: generateRating(),
        usageCount: Math.floor(Math.random() * 8000),
        tags: [subject, `Grade ${gradeLevel}`, 'Interactive', 'Simulation'],
        dateAdded: new Date().toISOString()
      });
    }
    
    // Generate assessment recommendations
    if (resourceTypes.length === 0 || resourceTypes.includes('assessment')) {
      recommendedResources.push({
        id: `assessment-${Date.now()}-1`,
        title: `${subject} Quiz: ${lessonContent.split(' ').slice(0, 3).join(' ')}`,
        type: 'assessment',
        format: 'Google Forms',
        questionCount: Math.floor(Math.random() * 10) + 5,
        url: 'https://forms.google.com/example',
        thumbnail: `https://via.placeholder.com/200x200.png?text=Quiz`,
        description: `Formative assessment to check student understanding of ${lessonContent.split(' ').slice(0, 5).join(' ')}.`,
        rating: generateRating(),
        usageCount: Math.floor(Math.random() * 2000),
        tags: [subject, `Grade ${gradeLevel}`, 'Assessment', 'Quiz'],
        dateAdded: new Date().toISOString()
      });
    }
    
    // Generate reading material recommendations
    if (resourceTypes.length === 0 || resourceTypes.includes('reading')) {
      recommendedResources.push({
        id: `reading-${Date.now()}-1`,
        title: `${subject} Article: ${lessonContent.split(' ').slice(0, 3).join(' ')}`,
        type: 'reading',
        format: 'Article',
        readingLevel: gradeLevel,
        url: 'https://www.readworks.org/example',
        thumbnail: `https://via.placeholder.com/200x260.png?text=Reading+Material`,
        description: `Age-appropriate reading material about ${lessonContent.split(' ').slice(0, 7).join(' ')} with comprehension questions.`,
        rating: generateRating(),
        pageViews: Math.floor(Math.random() * 12000),
        tags: [subject, `Grade ${gradeLevel}`, 'Reading', 'Article'],
        dateAdded: new Date().toISOString()
      });
    }
    
    return recommendedResources;
  } catch (error) {
    console.error('Error getting resource recommendations:', error);
    throw error;
  }
}; 