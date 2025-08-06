import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Divider,
  Container,
  Card,
  CardContent,
  CardHeader,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Snackbar,
  Alert,
  CircularProgress,
  IconButton,
  Chip,
  Tooltip,
  Avatar,
  Tabs,
  Tab,
  Fade,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slider,
  Rating,
  Stack,
  Autocomplete,
  InputAdornment,
  LinearProgress,
  useTheme,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Switch,
  Badge
} from '@mui/material';
import { 
  Assignment, 
  Grade, 
  Save, 
  Person, 
  Add, 
  Edit, 
  Delete, 
  Star, 
  StarBorder, 
  Info, 
  Check, 
  Close, 
  Refresh, 
  Search, 
  School, 
  FilterList, 
  Download, 
  Print, 
  ChatBubble,
  AutoGraph,
  Notifications,
  Settings,
  Done,
  Warning,
  Upload
} from '@mui/icons-material';
import { getAssignments, createAssignment, updateAssignment, deleteAssignment } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { logActivity } from '../services/dashboardService';

// Types
interface Student {
  id: string;
  name: string;
  grade: string;
  feedback: string;
  status: 'graded' | 'pending' | 'in-progress';
  avatar?: string;
  email?: string;
  submissionDate?: string;
  submissionFile?: string;
  notes?: string;
}

interface AssignmentData {
  _id?: string;
  name: string;
  type: string;
  subject?: string;
  description?: string;
  dueDate?: string;
  totalPoints?: number;
  createdAt?: string;
  updatedAt?: string;
  students: {
    studentName: string;
    grade: string;
    feedback: string;
    status?: string;
    submissionDate?: string;
    submissionFile?: string;
    notes?: string;
  }[];
}

interface GradeDistribution {
  A: number;
  B: number;
  C: number;
  D: number;
  F: number;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`grading-tabpanel-${index}`}
      aria-labelledby={`grading-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Grade letter calculation
const getGradeLetter = (score: number): string => {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
};

// Main component
const GradingAssistant: React.FC = () => {
  const theme = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Tab state
  const [tabValue, setTabValue] = useState(0);
  
  // Assignment state
  const [assignmentName, setAssignmentName] = useState('');
  const [assignmentType, setAssignmentType] = useState('quiz');
  const [assignmentDescription, setAssignmentDescription] = useState('');
  const [assignmentDueDate, setAssignmentDueDate] = useState('');
  const [assignmentTotalPoints, setAssignmentTotalPoints] = useState(100);
  const [assignmentSubject, setAssignmentSubject] = useState('');
  
  // Students state
  const [students, setStudents] = useState<Student[]>([
    { id: '1', name: 'John Smith', grade: '', feedback: '', status: 'pending', submissionDate: '2023-05-10', email: 'john.smith@example.com' },
    { id: '2', name: 'Emma Johnson', grade: '', feedback: '', status: 'pending', submissionDate: '2023-05-11', email: 'emma.j@example.com' },
    { id: '3', name: 'Michael Williams', grade: '', feedback: '', status: 'pending', submissionDate: '2023-05-09', email: 'mwilliams@example.com' },
    { id: '4', name: 'Sophia Brown', grade: '', feedback: '', status: 'pending', submissionDate: '2023-05-12', email: 'sophia.b@example.com' },
    { id: '5', name: 'James Davis', grade: '', feedback: '', status: 'pending', submissionDate: '2023-05-10', email: 'j.davis@example.com' },
  ]);
  
  // UI state
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('Assignment saved successfully!');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success');
  const [loading, setLoading] = useState(false);
  const [assignments, setAssignments] = useState<AssignmentData[]>([]);
  const [currentAssignmentId, setCurrentAssignmentId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [bulkGradeDialogOpen, setBulkGradeDialogOpen] = useState(false);
  const [bulkGradeValue, setBulkGradeValue] = useState(80);
  const [studentDialogOpen, setStudentDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isNewAssignment, setIsNewAssignment] = useState(true);
  const [showStatistics, setShowStatistics] = useState(false);
  const [gradeDistribution, setGradeDistribution] = useState<GradeDistribution>({ A: 0, B: 0, C: 0, D: 0, F: 0 });
  const [averageGrade, setAverageGrade] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'graded' | 'pending' | 'in-progress'>('all');
  const [chartOptions, setChartOptions] = useState<ApexOptions>({
    chart: {
      type: 'bar',
      height: 350,
      toolbar: {
        show: false
      }
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        borderRadius: 5
      },
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent']
    },
    xaxis: {
      categories: ['A', 'B', 'C', 'D', 'F'],
    },
    yaxis: {
      title: {
        text: 'Number of Students'
      }
    },
    fill: {
      opacity: 1
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return val + " students"
        }
      }
    },
    colors: ['#4CAF50', '#8BC34A', '#FFC107', '#FF9800', '#F44336']
  });
  
  // Custom dropzone for file uploads
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/csv': ['.csv']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      // Handle file processing
      const file = acceptedFiles[0];
      if (file) {
        setSnackbarMessage(`File ${file.name} uploaded. Processing grades...`);
        setSnackbarSeverity('info');
        setShowSnackbar(true);
        
        // Process the file based on type
        if (file.name.endsWith('.csv')) {
          processCSVFile(file);
        } else {
          // For other file types, simulate processing
          simulateProcessing();
        }
      }
    }
  });

  // Process CSV file
  const processCSVFile = (file: File) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        // Get the file content
        const csvData = event.target?.result as string;
        if (!csvData) {
          throw new Error('Failed to read file');
        }
        
        // Parse CSV
        const rows = csvData.split('\n');
        if (rows.length < 2) {
          throw new Error('CSV file must contain at least a header row and one data row');
        }
        
        // Get headers
        const headers = rows[0].split(',').map(header => header.trim().toLowerCase());
        
        // Find columns for name and grade
        const nameIndex = headers.findIndex(h => h.includes('name') || h.includes('student'));
        const gradeIndex = headers.findIndex(h => h.includes('grade') || h.includes('score') || h.includes('mark'));
        const feedbackIndex = headers.findIndex(h => h.includes('feedback') || h.includes('comment'));
        
        if (nameIndex === -1 || gradeIndex === -1) {
          throw new Error('CSV must contain columns for student name and grade');
        }
        
        // Process student data
        const updatedStudents = [...students];
        let importCount = 0;
        let unmatchedCount = 0;
        
        // Process each data row
        for (let i = 1; i < rows.length; i++) {
          if (!rows[i].trim()) continue; // Skip empty rows
          
          const columns = rows[i].split(',').map(col => col.trim());
          if (columns.length <= Math.max(nameIndex, gradeIndex)) continue;
          
          const importedName = columns[nameIndex];
          const importedGrade = columns[gradeIndex];
          const importedFeedback = feedbackIndex !== -1 ? columns[feedbackIndex] : '';
          
          // Try to find matching student
          const studentIndex = updatedStudents.findIndex(
            s => s.name.toLowerCase() === importedName.toLowerCase()
          );
          
          if (studentIndex !== -1) {
            // Update student data
            updatedStudents[studentIndex].grade = importedGrade;
            if (importedFeedback) {
              updatedStudents[studentIndex].feedback = importedFeedback;
            }
            updatedStudents[studentIndex].status = 'graded';
            importCount++;
          } else {
            unmatchedCount++;
          }
        }
        
        // Update state
        setStudents(updatedStudents);
        updateGradeStatistics(updatedStudents);
        
        // Show completion message
        const message = importCount > 0 
          ? `Successfully imported grades for ${importCount} students.` 
          : 'No student grades were imported.';
          
        const warningMessage = unmatchedCount > 0 
          ? ` Note: ${unmatchedCount} entries couldn't be matched to existing students.` 
          : '';
          
        setSnackbarMessage(message + warningMessage);
        setSnackbarSeverity(importCount > 0 ? 'success' : 'warning');
        setShowSnackbar(true);
        
      } catch (error: any) {
        console.error('CSV processing error:', error);
        setSnackbarMessage(`Error processing CSV: ${error.message}`);
        setSnackbarSeverity('error');
        setShowSnackbar(true);
      }
    };
    
    reader.onerror = () => {
      setSnackbarMessage('Failed to read the file');
      setSnackbarSeverity('error');
      setShowSnackbar(true);
    };
    
    reader.readAsText(file);
  };

  // Simulate processing for non-CSV files (for demo purposes)
  const simulateProcessing = () => {
    // Simulate processing delay
    setTimeout(() => {
      const updatedStudents = [...students];
      // Randomly assign grades to simulate processing
      updatedStudents.forEach(student => {
        const randomGrade = Math.floor(Math.random() * 30) + 70;
        student.grade = randomGrade.toString();
        student.status = 'graded';
      });
      setStudents(updatedStudents);
      updateGradeStatistics(updatedStudents);
      
      setSnackbarMessage('Grades imported successfully!');
      setSnackbarSeverity('success');
      setShowSnackbar(true);
    }, 1500);
  };

  // Calculate grade statistics
  const updateGradeStatistics = (studentData: Student[]) => {
    const graded = studentData.filter(s => s.grade !== '');
    if (graded.length === 0) {
      setGradeDistribution({ A: 0, B: 0, C: 0, D: 0, F: 0 });
      setAverageGrade(0);
      return;
    }
    
    // Calculate distribution
    const distribution: GradeDistribution = { A: 0, B: 0, C: 0, D: 0, F: 0 };
    let sum = 0;
    
    graded.forEach(student => {
      const grade = parseFloat(student.grade);
      if (!isNaN(grade)) {
        sum += grade;
        const letter = getGradeLetter(grade);
        distribution[letter as keyof GradeDistribution]++;
      }
    });
    
    setGradeDistribution(distribution);
    setAverageGrade(Math.round((sum / graded.length) * 10) / 10);
  };
  
  // Fetch assignments on component mount
  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true);
        const response = await getAssignments();
        setAssignments(response.data.data);
        
        // If there are assignments, load the most recent one
        if (response.data.data.length > 0) {
          const latestAssignment = response.data.data[0];
          setCurrentAssignmentId(latestAssignment._id);
          setAssignmentName(latestAssignment.name);
          setAssignmentType(latestAssignment.type);
          setAssignmentDescription(latestAssignment.description || '');
          setAssignmentDueDate(latestAssignment.dueDate || '');
          setAssignmentTotalPoints(latestAssignment.totalPoints || 100);
          setAssignmentSubject(latestAssignment.subject || '');
          setIsNewAssignment(false);
          
          // Convert API student format to component state format
          const formattedStudents: Student[] = latestAssignment.students.map((student: any, index: number) => ({
            id: (index + 1).toString(),
            name: student.studentName,
            grade: student.grade,
            feedback: student.feedback,
            status: student.grade ? 'graded' : 'pending',
            submissionDate: student.submissionDate || '',
            submissionFile: student.submissionFile || '',
            notes: student.notes || '',
            email: `${student.studentName.toLowerCase().replace(' ', '.')}@example.com`
          }));
          
          setStudents(formattedStudents);
          updateGradeStatistics(formattedStudents);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch assignments');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAssignments();
  }, []);
  
  // Update chart when grade distribution changes
  useEffect(() => {
    setChartOptions(prev => ({
      ...prev,
      series: [{
        name: 'Students',
        data: [
          gradeDistribution.A,
          gradeDistribution.B,
          gradeDistribution.C,
          gradeDistribution.D,
          gradeDistribution.F
        ]
      }]
    }));
  }, [gradeDistribution]);
  
  // Tab change handler
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Create new assignment handler
  const handleNewAssignment = () => {
    setAssignmentName('');
    setAssignmentType('quiz');
    setAssignmentDescription('');
    setAssignmentDueDate('');
    setAssignmentTotalPoints(100);
    setAssignmentSubject('');
    setCurrentAssignmentId(null);
    setIsNewAssignment(true);
    
    // Reset student grades
    const resetStudents = students.map(student => ({
      ...student,
      grade: '',
      feedback: '',
      status: 'pending' as const
    }));
    setStudents(resetStudents);
    setSelectedStudent(null);
    updateGradeStatistics(resetStudents);
  };
  
  // Assignment type change handler
  const handleAssignmentTypeChange = (event: SelectChangeEvent) => {
    setAssignmentType(event.target.value);
  };
  
  // Student selection handler
  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student);
  };
  
  // Grade change handler
  const handleGradeChange = (id: string, value: string) => {
    // Allow only numbers and validate range
    const numValue = value.replace(/[^0-9]/g, '');
    const validValue = numValue === '' ? '' : 
                    parseInt(numValue) > assignmentTotalPoints ? assignmentTotalPoints.toString() : numValue;
    
    const updatedStudents = students.map(student => 
      student.id === id ? { 
        ...student, 
        grade: validValue,
        status: validValue ? 'graded' as const : 'pending' as const
      } : student
    );
    
    setStudents(updatedStudents);
    updateGradeStatistics(updatedStudents);
    
    if (selectedStudent && selectedStudent.id === id) {
      setSelectedStudent({ ...selectedStudent, grade: validValue, status: validValue ? 'graded' as const : 'pending' as const });
    }
  };
  
  // Feedback change handler
  const handleFeedbackChange = (id: string, value: string) => {
    const updatedStudents = students.map(student => 
      student.id === id ? { ...student, feedback: value } : student
    );
    setStudents(updatedStudents);
    
    if (selectedStudent && selectedStudent.id === id) {
      setSelectedStudent({ ...selectedStudent, feedback: value });
    }
  };
  
  // Generate feedback handler with improved feedback
  const handleGenerateFeedback = (id: string) => {
    const student = students.find(s => s.id === id);
    if (!student) return;
    
    let generatedFeedback = '';
    const gradeNum = parseFloat(student.grade);
    
    if (isNaN(gradeNum)) {
      setSnackbarMessage('Please enter a valid grade first.');
      setSnackbarSeverity('warning');
      setShowSnackbar(true);
      return;
    }
    
    // Get percentage of total
    const percentage = (gradeNum / assignmentTotalPoints) * 100;
    const letterGrade = getGradeLetter(percentage);
    
    // Get more personalized feedback templates
    const feedbackTemplates = {
      excellent: [
        `Excellent work, ${student.name}! Your answers demonstrate a comprehensive understanding of the material and exceptional critical thinking skills. Your command of the subject matter is impressive.`,
        `Outstanding job, ${student.name}! You've shown mastery of the concepts and applied them with great precision and insight. Your work reflects a thorough grasp of the content.`,
        `Impressive performance, ${student.name}! Your work shows depth of understanding and careful attention to detail. Your analysis is thoughtful and well-articulated.`
      ],
      good: [
        `Good job, ${student.name}! You demonstrate strong understanding of most key concepts with only minor areas for improvement. Your work is thoughtful and generally accurate.`,
        `Well done, ${student.name}! Your work shows solid comprehension of the material with a few opportunities to deepen your understanding. You're on the right track with most concepts.`,
        `Strong performance overall, ${student.name}. You've grasped the core concepts well and shown good analytical skills. With a bit more attention to detail, your work would be excellent.`
      ],
      satisfactory: [
        `Satisfactory work, ${student.name}. You've demonstrated basic understanding of the core concepts, but should focus on strengthening your grasp of key principles and their applications.`,
        `You've shown adequate knowledge of the material, ${student.name}. To improve, I recommend reviewing the fundamental concepts and practicing more complex applications of these ideas.`,
        `Your work meets the basic requirements, ${student.name}. To advance further, consider delving deeper into the relationships between concepts and how they connect to broader themes.`
      ],
      needsImprovement: [
        `${student.name}, you've shown some understanding, but need significant improvement in several key areas. Let's focus first on mastering the fundamental concepts before moving to more complex topics.`,
        `Your work indicates gaps in understanding core concepts, ${student.name}. I recommend scheduling time to review the material together to ensure you're building a solid foundation.`,
        `I can see you've put in effort, ${student.name}, but you're struggling with some important concepts. Let's work on building a stronger foundation with the essential ideas in this unit.`
      ],
      poor: [
        `${student.name}, we need to address some fundamental misunderstandings in your work. Let's schedule a meeting to go over the core concepts again and develop a plan to help you succeed.`,
        `Your work shows significant gaps in understanding, ${student.name}. Please come see me during office hours so we can identify the areas causing difficulty and create a strategy for improvement.`,
        `I can see you're struggling with the basic concepts, ${student.name}. Let's work together to address these challenges and build a stronger foundation for your learning.`
      ]
    };
    
    // Select random feedback from appropriate category
    const randomIndex = Math.floor(Math.random() * 3);
    
    if (percentage >= 90) {
      generatedFeedback = feedbackTemplates.excellent[randomIndex];
    } else if (percentage >= 80) {
      generatedFeedback = feedbackTemplates.good[randomIndex];
    } else if (percentage >= 70) {
      generatedFeedback = feedbackTemplates.satisfactory[randomIndex];
    } else if (percentage >= 60) {
      generatedFeedback = feedbackTemplates.needsImprovement[randomIndex];
    } else {
      generatedFeedback = feedbackTemplates.poor[randomIndex];
    }
    
    // Add assignment-specific feedback based on type
    const assignmentSpecificFeedback = {
      quiz: {
        excellent: 'Your responses demonstrate quick recall and deep understanding of the material.',
        good: 'You show solid knowledge of most concepts covered in this quiz.',
        average: 'You have grasped the main ideas, but could benefit from more focused study on specific concepts.',
        below: 'More practice with key terminology and concepts would help strengthen your understanding.'
      },
      exam: {
        excellent: 'You handled complex questions with impressive critical thinking and showed excellent time management.',
        good: 'Your exam performance shows good preparation and understanding, with room to develop in a few areas.',
        average: 'You have demonstrated basic knowledge but struggled with applying concepts to more complex problems.',
        below: 'Let us develop a structured study plan to better prepare for the next assessment.'
      },
      homework: {
        excellent: 'Your homework shows meticulous attention to detail and a commitment to excellence.',
        good: 'Your work is consistently well-organized and shows solid effort.',
        average: 'Your work meets basic requirements but would benefit from more thorough responses.',
        below: 'I notice that some portions were incomplete or contained fundamental errors we should address.'
      },
      project: {
        excellent: 'Your project demonstrates creativity, thorough research, and exceptional execution.',
        good: 'Your project shows good planning and execution with thoughtful application of concepts.',
        average: 'The core elements of your project are present, but the development of ideas could be stronger.',
        below: 'Your project needs more development in key areas including organization and application of concepts.'
      },
      essay: {
        excellent: 'Your writing is eloquent and persuasive, with a strong thesis and well-structured arguments.',
        good: 'Your essay presents a clear argument supported by relevant evidence, with good organization.',
        average: 'Your essay contains important ideas but would benefit from stronger organization and evidence.',
        below: 'Let us work on developing clearer thesis statements and supporting evidence in your writing.'
      }
    };
    
    // Add type-specific feedback
    if (assignmentType in assignmentSpecificFeedback) {
      const typeFeedback = assignmentSpecificFeedback[assignmentType as keyof typeof assignmentSpecificFeedback];
      if (percentage >= 90) {
        generatedFeedback += ` ${typeFeedback.excellent}`;
      } else if (percentage >= 80) {
        generatedFeedback += ` ${typeFeedback.good}`;
      } else if (percentage >= 70) {
        generatedFeedback += ` ${typeFeedback.average}`;
      } else {
        generatedFeedback += ` ${typeFeedback.below}`;
      }
    }
    
    // Add specific strengths and areas for improvement
    const strengths = {
      quiz: ['quick recall', 'concept application', 'attention to detail'],
      exam: ['time management', 'critical thinking', 'comprehensive knowledge'],
      homework: ['thoroughness', 'consistency', 'organization'],
      project: ['creativity', 'research skills', 'execution'],
      essay: ['thesis development', 'evidence use', 'writing clarity']
    };
    
    const improvements = {
      quiz: ['review key terminology', 'practice application questions', 'study concept connections'],
      exam: ['develop test strategies', 'practice time management', 'create comprehensive study guides'],
      homework: ['increase thoroughness', 'improve organization', 'follow instructions carefully'],
      project: ['enhance research depth', 'improve execution quality', 'develop more creative approaches'],
      essay: ['strengthen thesis statements', 'incorporate more evidence', 'improve transitions between ideas']
    };
    
    // Add a personalized strength and improvement area
    if (assignmentType in strengths && percentage >= 70) {
      const typeStrengths = strengths[assignmentType as keyof typeof strengths];
      const randomStrength = typeStrengths[Math.floor(Math.random() * typeStrengths.length)];
      generatedFeedback += ` A particular strength in your work is your ${randomStrength}.`;
    }
    
    if (assignmentType in improvements && percentage < 90) {
      const typeImprovements = improvements[assignmentType as keyof typeof improvements];
      const randomImprovement = typeImprovements[Math.floor(Math.random() * typeImprovements.length)];
      generatedFeedback += ` To continue improving, I recommend focusing on ${randomImprovement}.`;
    }
    
    // End with constructive next steps and encouragement
    if (percentage >= 85) {
      generatedFeedback += ' To challenge yourself further, consider exploring more advanced topics or seeking out enrichment activities related to this subject matter.';
    } else if (percentage >= 70) {
      generatedFeedback += ' Focus on the areas mentioned above, and don\'t hesitate to ask questions during class or office hours if you need clarification.';
    } else {
      generatedFeedback += ' Let\'s schedule a time to review these concepts together. I am confident that with targeted practice and support, you will see improvement in your understanding.';
    }
    
    handleFeedbackChange(id, generatedFeedback);
    
    // Show success notification
    setSnackbarMessage('Feedback generated successfully!');
    setSnackbarSeverity('success');
    setShowSnackbar(true);
  };

  // Bulk grade assignments
  const handleBulkGrade = (grade: number) => {
    const updatedStudents = students.map(student => ({
      ...student,
      grade: grade.toString(),
      status: 'graded' as const
    }));
    
    setStudents(updatedStudents);
    updateGradeStatistics(updatedStudents);
    setBulkGradeDialogOpen(false);
    
    // Show success notification
    setSnackbarMessage(`All students graded with ${grade}%`);
    setSnackbarSeverity('success');
    setShowSnackbar(true);
  };
  
  // Generate feedback for all students
  const handleBulkGenerateFeedback = () => {
    const updatedStudents = [...students];
    let count = 0;
    
    updatedStudents.forEach(student => {
      if (student.grade) {
        // Use the existing feedback generator for each student
        const tempId = student.id;
        handleGenerateFeedback(tempId);
        count++;
      }
    });
    
    // Only show notification if we're not showing individual ones
    if (count === 0) {
      setSnackbarMessage('No students with grades to generate feedback for');
      setSnackbarSeverity('warning');
      setShowSnackbar(true);
    } else {
      setSnackbarMessage(`Generated feedback for ${count} students`);
      setSnackbarSeverity('success');
      setShowSnackbar(true);
    }
  };
  
  // Save grades to server
  const handleSaveGrades = async () => {
    if (!assignmentName) {
      setError('Please enter an assignment name');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Format data for API
      const formattedStudents = students.map(student => ({
        studentName: student.name,
        grade: student.grade,
        feedback: student.feedback,
        status: student.status,
        submissionDate: student.submissionDate,
        submissionFile: student.submissionFile,
        notes: student.notes
      }));
      
      const assignmentData = {
        name: assignmentName,
        type: assignmentType,
        description: assignmentDescription,
        dueDate: assignmentDueDate,
        totalPoints: assignmentTotalPoints,
        subject: assignmentSubject,
        students: formattedStudents
      };
      
      let response;
      
      // If we're updating an existing assignment
      if (currentAssignmentId) {
        response = await updateAssignment(currentAssignmentId, assignmentData);
        setSnackbarMessage('Assignment updated successfully!');
        
        // Log activity for updating
        await logActivity(
          `Updated assignment: ${assignmentName}`,
          'grade',
          `Subject: ${assignmentSubject}, Students: ${formattedStudents.length}`
        );
      } else {
        // Creating a new assignment
        response = await createAssignment(assignmentData);
        setCurrentAssignmentId(response.data.data._id);
        setIsNewAssignment(false);
        setSnackbarMessage('New assignment created successfully!');
        
        // Log activity for creating
        await logActivity(
          `Created assignment: ${assignmentName}`,
          'grade',
          `Subject: ${assignmentSubject}, Students: ${formattedStudents.length}`
        );
      }
      
      // Update assignments list
      const assignmentsResponse = await getAssignments();
      setAssignments(assignmentsResponse.data.data);
      
      setSnackbarSeverity('success');
      setShowSnackbar(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save assignment');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Delete assignment
  const handleDeleteAssignment = async () => {
    if (!currentAssignmentId) return;
    
    if (!window.confirm(`Are you sure you want to delete "${assignmentName}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      setLoading(true);
      await deleteAssignment(currentAssignmentId);
      
      // Update assignments list
      const response = await getAssignments();
      setAssignments(response.data.data);
      
      // If there are still assignments, load the most recent one
      if (response.data.data.length > 0) {
        const latestAssignment = response.data.data[0];
        setCurrentAssignmentId(latestAssignment._id);
        setAssignmentName(latestAssignment.name);
        setAssignmentType(latestAssignment.type);
        setAssignmentDescription(latestAssignment.description || '');
        setAssignmentDueDate(latestAssignment.dueDate || '');
        setAssignmentTotalPoints(latestAssignment.totalPoints || 100);
        setAssignmentSubject(latestAssignment.subject || '');
        setIsNewAssignment(false);
        
        // Convert API student format to component state format
        const formattedStudents: Student[] = latestAssignment.students.map((student: any, index: number) => ({
          id: (index + 1).toString(),
          name: student.studentName,
          grade: student.grade,
          feedback: student.feedback,
          status: student.grade ? 'graded' : 'pending',
          submissionDate: student.submissionDate || '',
          submissionFile: student.submissionFile || '',
          notes: student.notes || '',
          email: `${student.studentName.toLowerCase().replace(' ', '.')}@example.com`
        }));
        
        setStudents(formattedStudents);
        updateGradeStatistics(formattedStudents);
      } else {
        // No assignments left, reset to new assignment state
        handleNewAssignment();
      }
      
      setSnackbarMessage('Assignment deleted successfully');
      setSnackbarSeverity('success');
      setShowSnackbar(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete assignment');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Load a selected assignment
  const handleLoadAssignment = (assignment: AssignmentData) => {
    setCurrentAssignmentId(assignment._id || null);
    setAssignmentName(assignment.name);
    setAssignmentType(assignment.type);
    setAssignmentDescription(assignment.description || '');
    setAssignmentDueDate(assignment.dueDate || '');
    setAssignmentTotalPoints(assignment.totalPoints || 100);
    setAssignmentSubject(assignment.subject || '');
    setIsNewAssignment(false);
    
    // Convert API student format to component state format
    const formattedStudents: Student[] = assignment.students.map((student: any, index: number) => ({
      id: (index + 1).toString(),
      name: student.studentName,
      grade: student.grade,
      feedback: student.feedback,
      status: student.grade ? 'graded' : 'pending',
      submissionDate: student.submissionDate || '',
      submissionFile: student.submissionFile || '',
      notes: student.notes || '',
      email: `${student.studentName.toLowerCase().replace(' ', '.')}@example.com`
    }));
    
    setStudents(formattedStudents);
    setSelectedStudent(null);
    updateGradeStatistics(formattedStudents);
    
    setSnackbarMessage(`Loaded assignment: ${assignment.name}`);
    setSnackbarSeverity('info');
    setShowSnackbar(true);
  };
  
  // Handle snackbar closing
  const handleCloseSnackbar = () => {
    setShowSnackbar(false);
  };
  
  // Handle error closing
  const handleCloseError = () => {
    setError(null);
  };
  
  // Export grades as CSV
  const handleExportGrades = () => {
    // Create CSV content
    let csvContent = 'Student Name,Grade,Feedback\n';
    students.forEach(student => {
      // Properly escape CSV fields
      const escapedFeedback = student.feedback ? `"${student.feedback.replace(/"/g, '""')}"` : '';
      csvContent += `${student.name},${student.grade},${escapedFeedback}\n`;
    });
    
    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${assignmentName.replace(/\s+/g, '_')}_grades.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setSnackbarMessage('Grades exported successfully');
    setSnackbarSeverity('success');
    setShowSnackbar(true);
  };
  
  // Filter students based on search and status
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || student.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Add new student
  const handleAddStudent = () => {
    setEditingStudent({
      id: `new-${Date.now()}`,
      name: '',
      grade: '',
      feedback: '',
      status: 'pending',
      email: '',
      submissionDate: new Date().toISOString().split('T')[0],
    });
    setStudentDialogOpen(true);
  };

  // Edit existing student
  const handleEditStudent = (student: Student) => {
    setEditingStudent({...student});
    setStudentDialogOpen(true);
  };

  // Save student
  const handleSaveStudent = (student: Student) => {
    if (!student.name) {
      setSnackbarMessage('Student name is required');
      setSnackbarSeverity('error');
      setShowSnackbar(true);
      return;
    }
    
    let updatedStudents: Student[];
    
    // Check if this is a new student or edit
    if (student.id.startsWith('new-')) {
      // Generate a proper ID for the new student
      const newStudent = {
        ...student,
        id: (students.length + 1).toString()
      };
      updatedStudents = [...students, newStudent];
    } else {
      // Update existing student
      updatedStudents = students.map(s => 
        s.id === student.id ? student : s
      );
    }
    
    setStudents(updatedStudents);
    updateGradeStatistics(updatedStudents);
    setStudentDialogOpen(false);
    setEditingStudent(null);
    
    setSnackbarMessage(`Student ${student.id.startsWith('new-') ? 'added' : 'updated'} successfully`);
    setSnackbarSeverity('success');
    setShowSnackbar(true);
  };

  // Delete student
  const handleDeleteStudent = (id: string) => {
    if (!window.confirm('Are you sure you want to remove this student from the assignment?')) {
      return;
    }
    
    const updatedStudents = students.filter(student => student.id !== id);
    setStudents(updatedStudents);
    if (selectedStudent?.id === id) {
      setSelectedStudent(null);
    }
    updateGradeStatistics(updatedStudents);
    
    setSnackbarMessage('Student removed from assignment');
    setSnackbarSeverity('success');
    setShowSnackbar(true);
  };

  if (loading && assignments.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <Grade sx={{ mr: 1 }} /> Grading Assistant
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" paragraph>
          Streamline your grading process with automated assessment and feedback generation
        </Typography>

        {/* Assignment controls */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button 
              variant="contained" 
              startIcon={<Add />} 
              onClick={handleNewAssignment}
            >
              New Assignment
            </Button>
            
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Load Assignment</InputLabel>
              <Select
                value=""
                label="Load Assignment"
                displayEmpty
                onChange={(e) => {
                  const selected = assignments.find(a => a._id === e.target.value);
                  if (selected) handleLoadAssignment(selected);
                }}
              >
                <MenuItem value="" disabled>
                  <em>Select an assignment</em>
                </MenuItem>
                {assignments.map((assignment) => (
                  <MenuItem key={assignment._id} value={assignment._id}>
                    {assignment.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            {!isNewAssignment && (
              <Button 
                variant="outlined" 
                color="error" 
                startIcon={<Delete />}
                onClick={handleDeleteAssignment}
              >
                Delete
              </Button>
            )}
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<Save />}
              onClick={handleSaveGrades}
              disabled={!assignmentName || loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Save Assignment'}
            </Button>
          </Box>
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            aria-label="grading assistant tabs"
          >
            <Tab label="Grading" icon={<Assignment />} iconPosition="start" />
            <Tab label="Analytics" icon={<AutoGraph />} iconPosition="start" />
          </Tabs>
        </Box>

        {/* Grading Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Assignment Details
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <TextField
                  fullWidth
                  label="Assignment Name"
                  value={assignmentName}
                  onChange={(e) => setAssignmentName(e.target.value)}
                  margin="normal"
                  required
                  error={!assignmentName}
                  helperText={!assignmentName ? 'Assignment name is required' : ''}
                />
                
                <FormControl fullWidth margin="normal">
                  <InputLabel>Assignment Type</InputLabel>
                  <Select
                    value={assignmentType}
                    label="Assignment Type"
                    onChange={handleAssignmentTypeChange}
                  >
                    <MenuItem value="quiz">Quiz</MenuItem>
                    <MenuItem value="exam">Exam</MenuItem>
                    <MenuItem value="homework">Homework</MenuItem>
                    <MenuItem value="project">Project</MenuItem>
                    <MenuItem value="essay">Essay</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  label="Subject"
                  value={assignmentSubject}
                  onChange={(e) => setAssignmentSubject(e.target.value)}
                  margin="normal"
                />
                
                <TextField
                  fullWidth
                  label="Description"
                  value={assignmentDescription}
                  onChange={(e) => setAssignmentDescription(e.target.value)}
                  margin="normal"
                  multiline
                  rows={3}
                />
                
                <TextField
                  fullWidth
                  label="Due Date"
                  type="date"
                  value={assignmentDueDate}
                  onChange={(e) => setAssignmentDueDate(e.target.value)}
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                />
                
                <TextField
                  fullWidth
                  label="Total Points"
                  type="number"
                  value={assignmentTotalPoints}
                  onChange={(e) => setAssignmentTotalPoints(parseInt(e.target.value) || 100)}
                  margin="normal"
                  InputProps={{
                    endAdornment: <InputAdornment position="end">pts</InputAdornment>,
                  }}
                />
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                  <Typography variant="h6">
                    Student Grades
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      placeholder="Search students..."
                      variant="outlined"
                      size="small"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Search />
                          </InputAdornment>
                        ),
                      }}
                    />
                    <FormControl sx={{ minWidth: 120 }} size="small">
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={filterStatus}
                        label="Status"
                        onChange={(e) => setFilterStatus(e.target.value as any)}
                      >
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="graded">Graded</MenuItem>
                        <MenuItem value="pending">Pending</MenuItem>
                        <MenuItem value="in-progress">In Progress</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Button 
                    startIcon={<Add />}
                    onClick={() => setBulkGradeDialogOpen(true)}
                    variant="outlined"
                    size="small"
                  >
                    Bulk Grade
                  </Button>
                  <Button 
                    startIcon={<ChatBubble />}
                    onClick={handleBulkGenerateFeedback}
                    variant="outlined"
                    size="small"
                  >
                    Generate All Feedback
                  </Button>
                  <Button 
                    startIcon={<Download />}
                    onClick={handleExportGrades}
                    variant="outlined"
                    size="small"
                  >
                    Export CSV
                  </Button>
                  <Box sx={{ flexGrow: 1 }} />
                  <Button 
                    startIcon={<Person />}
                    onClick={handleAddStudent}
                    variant="outlined"
                    size="small"
                    color="secondary"
                  >
                    Add Student
                  </Button>
                  <Box {...getRootProps()} sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    cursor: 'pointer'
                  }}>
                    <input {...getInputProps()} />
                    <Button 
                      variant="outlined" 
                      size="small"
                      startIcon={<Upload />}
                    >
                      Import Grades
                    </Button>
                  </Box>
                </Box>
                
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Student</TableCell>
                        <TableCell>Grade</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredStudents.map((student) => (
                        <TableRow 
                          key={student.id} 
                          sx={{ 
                            cursor: 'pointer',
                            bgcolor: selectedStudent?.id === student.id ? 'rgba(25, 118, 210, 0.08)' : 'inherit'
                          }}
                          onClick={() => handleStudentSelect(student)}
                        >
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar 
                                sx={{ width: 32, height: 32, mr: 1 }}
                                alt={student.name}
                                src={student.avatar}
                              >
                                {student.name.charAt(0)}
                              </Avatar>
                              <Box>
                                <Typography variant="body2">{student.name}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {student.email}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <TextField
                              size="small"
                              value={student.grade}
                              onChange={(e) => handleGradeChange(student.id, e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              placeholder="0-100"
                              sx={{ width: 80 }}
                              InputProps={{
                                endAdornment: student.grade ? (
                                  <InputAdornment position="end">
                                    <Chip 
                                      label={getGradeLetter(parseFloat(student.grade))} 
                                      size="small"
                                      color={
                                        getGradeLetter(parseFloat(student.grade)) === 'A' ? 'success' :
                                        getGradeLetter(parseFloat(student.grade)) === 'B' ? 'primary' :
                                        getGradeLetter(parseFloat(student.grade)) === 'C' ? 'info' :
                                        getGradeLetter(parseFloat(student.grade)) === 'D' ? 'warning' : 'error'
                                      }
                                      sx={{ ml: 1 }}
                                    />
                                  </InputAdornment>
                                ) : null
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip 
                              size="small" 
                              label={student.status.toUpperCase()}
                              color={
                                student.status === 'graded' ? 'success' :
                                student.status === 'in-progress' ? 'warning' : 'default'
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Tooltip title="Generate Feedback">
                              <IconButton 
                                size="small" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleGenerateFeedback(student.id);
                                }}
                                color="primary"
                              >
                                <ChatBubble fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit Student">
                              <IconButton 
                                size="small" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditStudent(student);
                                }}
                                color="secondary"
                              >
                                <Edit fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                
                {filteredStudents.length === 0 && (
                  <Box sx={{ py: 3, textAlign: 'center' }}>
                    <Typography color="text.secondary">
                      No students match your search criteria
                    </Typography>
                  </Box>
                )}
              </Paper>
              
              {selectedStudent && (
                <Card>
                  <CardHeader 
                    title={`Feedback for ${selectedStudent.name}`}
                    action={
                      <Button 
                        size="small" 
                        startIcon={<ChatBubble />}
                        onClick={() => handleGenerateFeedback(selectedStudent.id)}
                      >
                        Generate
                      </Button>
                    }
                  />
                  <CardContent>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      label="Feedback"
                      value={selectedStudent.feedback}
                      onChange={(e) => handleFeedbackChange(selectedStudent.id, e.target.value)}
                    />
                    {selectedStudent.submissionDate && (
                      <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                        Submitted on: {new Date(selectedStudent.submissionDate).toLocaleDateString()}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              )}
            </Grid>
          </Grid>
        </TabPanel>

        {/* Analytics Tab */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Grade Summary
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Class Average
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="h4" sx={{ mr: 1 }}>
                      {averageGrade}%
                    </Typography>
                    <Chip 
                      label={getGradeLetter(averageGrade)} 
                      color={
                        getGradeLetter(averageGrade) === 'A' ? 'success' :
                        getGradeLetter(averageGrade) === 'B' ? 'primary' :
                        getGradeLetter(averageGrade) === 'C' ? 'info' :
                        getGradeLetter(averageGrade) === 'D' ? 'warning' : 'error'
                      }
                    />
                  </Box>
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Grade Distribution
                  </Typography>
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ width: 30 }}>A:</Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={students.length ? (gradeDistribution.A / students.length) * 100 : 0} 
                        color="success"
                        sx={{ flexGrow: 1, mr: 1, height: 10, borderRadius: 5 }}
                      />
                      <Typography variant="body2" sx={{ width: 30 }}>{gradeDistribution.A}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ width: 30 }}>B:</Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={students.length ? (gradeDistribution.B / students.length) * 100 : 0} 
                        color="primary"
                        sx={{ flexGrow: 1, mr: 1, height: 10, borderRadius: 5 }}
                      />
                      <Typography variant="body2" sx={{ width: 30 }}>{gradeDistribution.B}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ width: 30 }}>C:</Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={students.length ? (gradeDistribution.C / students.length) * 100 : 0} 
                        color="info"
                        sx={{ flexGrow: 1, mr: 1, height: 10, borderRadius: 5 }}
                      />
                      <Typography variant="body2" sx={{ width: 30 }}>{gradeDistribution.C}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ width: 30 }}>D:</Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={students.length ? (gradeDistribution.D / students.length) * 100 : 0} 
                        color="warning"
                        sx={{ flexGrow: 1, mr: 1, height: 10, borderRadius: 5 }}
                      />
                      <Typography variant="body2" sx={{ width: 30 }}>{gradeDistribution.D}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ width: 30 }}>F:</Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={students.length ? (gradeDistribution.F / students.length) * 100 : 0} 
                        color="error"
                        sx={{ flexGrow: 1, mr: 1, height: 10, borderRadius: 5 }}
                      />
                      <Typography variant="body2" sx={{ width: 30 }}>{gradeDistribution.F}</Typography>
                    </Box>
                  </Stack>
                </Box>
                
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Completion Status
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 2 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h5">
                        {students.filter(s => s.status === 'graded').length}
                      </Typography>
                      <Typography variant="body2" color="success.main">Graded</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h5">
                        {students.filter(s => s.status === 'pending').length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">Pending</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h5">
                        {students.filter(s => s.status === 'in-progress').length}
                      </Typography>
                      <Typography variant="body2" color="warning.main">In Progress</Typography>
                    </Box>
                  </Box>
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Grade Distribution Chart
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={{ height: 400 }}>
                  <Chart
                    options={chartOptions}
                    series={[{
                      name: 'Students',
                      data: [
                        gradeDistribution.A,
                        gradeDistribution.B,
                        gradeDistribution.C,
                        gradeDistribution.D,
                        gradeDistribution.F
                      ]
                    }]}
                    type="bar"
                    height="100%"
                  />
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Bulk Grade Dialog */}
        <Dialog open={bulkGradeDialogOpen} onClose={() => setBulkGradeDialogOpen(false)}>
          <DialogTitle>Bulk Grade Assignment</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" paragraph>
              This will apply the same grade to all students in this assignment.
            </Typography>
            <Box sx={{ width: 300, mt: 2 }}>
              <Typography id="bulk-grade-slider" gutterBottom>
                Grade: {bulkGradeValue}%
              </Typography>
              <Slider
                value={bulkGradeValue}
                onChange={(_, newValue) => setBulkGradeValue(newValue as number)}
                aria-labelledby="bulk-grade-slider"
                valueLabelDisplay="auto"
                step={5}
                marks
                min={0}
                max={100}
              />
              <Typography variant="body2" sx={{ mt: 1 }}>
                Letter Grade: {getGradeLetter(bulkGradeValue)}
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setBulkGradeDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => handleBulkGrade(bulkGradeValue)} color="primary">
              Apply to All
            </Button>
          </DialogActions>
        </Dialog>
        
        <Snackbar 
          open={showSnackbar} 
          autoHideDuration={6000} 
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
        
        <Snackbar 
          open={!!error} 
          autoHideDuration={6000} 
          onClose={handleCloseError}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseError} severity="error">
            {error}
          </Alert>
        </Snackbar>

        {/* Student Edit/Add Dialog */}
        <Dialog 
          open={studentDialogOpen} 
          onClose={() => setStudentDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {editingStudent?.id.startsWith('new-') ? 'Add New Student' : 'Edit Student'}
          </DialogTitle>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Student Name"
                  value={editingStudent?.name || ''}
                  onChange={(e) => setEditingStudent(prev => prev ? {...prev, name: e.target.value} : null)}
                  required
                  error={!editingStudent?.name}
                  helperText={!editingStudent?.name ? 'Name is required' : ''}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={editingStudent?.email || ''}
                  onChange={(e) => setEditingStudent(prev => prev ? {...prev, email: e.target.value} : null)}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Grade"
                  value={editingStudent?.grade || ''}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    const validValue = value === '' ? '' : 
                                    parseInt(value) > assignmentTotalPoints ? assignmentTotalPoints.toString() : value;
                    setEditingStudent(prev => prev ? {
                      ...prev, 
                      grade: validValue,
                      status: validValue ? 'graded' : 'pending'
                    } : null);
                  }}
                  margin="normal"
                  InputProps={{
                    endAdornment: editingStudent?.grade ? (
                      <InputAdornment position="end">
                        <Chip 
                          label={getGradeLetter(parseFloat(editingStudent.grade))} 
                          size="small"
                          color={
                            getGradeLetter(parseFloat(editingStudent.grade)) === 'A' ? 'success' :
                            getGradeLetter(parseFloat(editingStudent.grade)) === 'B' ? 'primary' :
                            getGradeLetter(parseFloat(editingStudent.grade)) === 'C' ? 'info' :
                            getGradeLetter(parseFloat(editingStudent.grade)) === 'D' ? 'warning' : 'error'
                          }
                        />
                      </InputAdornment>
                    ) : null
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Submission Date"
                  type="date"
                  value={editingStudent?.submissionDate || ''}
                  onChange={(e) => setEditingStudent(prev => prev ? {...prev, submissionDate: e.target.value} : null)}
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={editingStudent?.status || 'pending'}
                    label="Status"
                    onChange={(e) => setEditingStudent(prev => 
                      prev ? {...prev, status: e.target.value as 'graded' | 'pending' | 'in-progress'} : null
                    )}
                  >
                    <MenuItem value="graded">Graded</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="in-progress">In Progress</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Feedback"
                  multiline
                  rows={4}
                  value={editingStudent?.feedback || ''}
                  onChange={(e) => setEditingStudent(prev => prev ? {...prev, feedback: e.target.value} : null)}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  multiline
                  rows={2}
                  value={editingStudent?.notes || ''}
                  onChange={(e) => setEditingStudent(prev => prev ? {...prev, notes: e.target.value} : null)}
                  margin="normal"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setStudentDialogOpen(false)}>Cancel</Button>
            {!editingStudent?.id.startsWith('new-') && (
              <Button 
                color="error" 
                onClick={() => {
                  setStudentDialogOpen(false);
                  if (editingStudent) handleDeleteStudent(editingStudent.id);
                }}
              >
                Delete
              </Button>
            )}
            <Button 
              color="primary" 
              onClick={() => {
                if (editingStudent) handleSaveStudent(editingStudent);
              }}
              disabled={!editingStudent?.name}
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default GradingAssistant; 