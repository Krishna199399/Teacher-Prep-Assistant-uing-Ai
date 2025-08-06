import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Snackbar,
  TextField,
  Typography,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Chip,
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fade,
  Tab,
  Tabs,
  Tooltip,
  useTheme,
  FormHelperText,
  CardMedia,
  CardActionArea,
  InputAdornment
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  EventNote as EventNoteIcon,
  AutoAwesome as AutoAwesomeIcon,
  ArrowForward as NextIcon,
  ArrowBack as BackIcon,
  CheckCircle as CheckIcon,
  Settings as SettingsIcon,
  ContentCopy as DuplicateIcon,
  FileCopy as TemplateIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  LocalLibrary as LocalLibraryIcon
} from '@mui/icons-material';
import { createLessonPlan, getLessonPlans, updateLessonPlan, deleteLessonPlan } from '../services/api';
import { simulateAILessonPlan as aiGenerateLessonPlan } from '../services/aiService';
import { 
  getAllTemplates, 
  getTemplateById, 
  getTemplatesBySubject, 
  getTemplatesByGradeLevel,
  getTemplateCategories,
  getTemplatesByCategory,
  LessonTemplate 
} from '../services/templateService';
import AILessonGenerator from '../components/AILessonGenerator';
import ResourceRecommender from '../components/ResourceRecommender';

interface Objective {
  id: string;
  text: string;
}

interface Activity {
  id: string;
  title: string;
  duration: string;
  description: string;
}

interface LessonPlan {
  _id?: string;
  title: string;
  subject: string;
  gradeLevel: string;
  objectives: string[];
  materials: string[] | string;
  procedures: string[];
  assessment: string;
  differentiation: string;
  notes?: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// Helper component for tabs
function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`lesson-tabpanel-${index}`}
      aria-labelledby={`lesson-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const LessonPlanner: React.FC = () => {
  const theme = useTheme();
  
  // Stepper state
  const [activeStep, setActiveStep] = useState(0);
  const steps = ['Basic Information', 'Objectives', 'Activities & Materials', 'Assessment & Differentiation', 'Review & Save'];
  
  // Tab state
  const [tabValue, setTabValue] = useState(0);
  
  // Basic lesson information
  const [lessonTitle, setLessonTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [lessonDate, setLessonDate] = useState('');
  const [duration, setDuration] = useState('60');
  const [topic, setTopic] = useState('');
  
  // Standards alignment
  const [standards, setStandards] = useState<string[]>([]);
  const [newStandard, setNewStandard] = useState('');
  
  // Learning objectives
  const [objectives, setObjectives] = useState<Objective[]>([
    { id: '1', text: 'Students will be able to...' }
  ]);
  const [newObjective, setNewObjective] = useState('');
  
  // Activities
  const [activities, setActivities] = useState<Activity[]>([
    { id: '1', title: 'Introduction', duration: '10 mins', description: 'Introduce the lesson topic and learning objectives.' }
  ]);
  
  // Materials
  const [materials, setMaterials] = useState('');
  const [materialsList, setMaterialsList] = useState<string[]>([]);
  
  // Assessment and differentiation
  const [assessment, setAssessment] = useState('');
  const [differentiation, setDifferentiation] = useState('');
  const [notes, setNotes] = useState('');
  
  // UI state
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success');
  const [loading, setLoading] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Saved lesson plans
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([]);
  const [currentLessonPlanId, setCurrentLessonPlanId] = useState<string | null>(null);
  
  // Template selection dialog
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<LessonTemplate | null>(null);
  
  // Template state
  const [templates, setTemplates] = useState<LessonTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<LessonTemplate[]>([]);
  const [templateSearch, setTemplateSearch] = useState('');
  const [templateCategories, setTemplateCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  
  // AI generator dialog
  const [aiGeneratorOpen, setAiGeneratorOpen] = useState(false);
  
  // Resource Recommender dialog
  const [resourceRecommenderOpen, setResourceRecommenderOpen] = useState(false);
  
  // Common subjects and grade levels
  const subjectOptions = ['Math', 'Science', 'English', 'Social Studies', 'Art', 'Music', 'Physical Education', 'Computer Science'];
  const gradeLevelOptions = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
  
  // Fetch lesson plans on component mount
  useEffect(() => {
    const fetchLessonPlans = async () => {
      try {
        setLoading(true);
        const response = await getLessonPlans();
        setLessonPlans(response.data.data);
        
        // Initialize with a blank lesson plan instead of loading the most recent one
        handleNewLessonPlan();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to fetch lesson plans');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLessonPlans();
  }, []);
  
  // Fetch templates on component mount
  useEffect(() => {
    // Fetch all templates
    const allTemplates = getAllTemplates();
    setTemplates(allTemplates);
    setFilteredTemplates(allTemplates);
    
    // Get template categories
    const categories = getTemplateCategories();
    setTemplateCategories(categories);
  }, []);
  
  // Filter templates based on search and category
  useEffect(() => {
    let filtered = templates;
    
    // Filter by search term
    if (templateSearch) {
      const searchLower = templateSearch.toLowerCase();
      filtered = filtered.filter(template => 
        template.title.toLowerCase().includes(searchLower) || 
        template.description.toLowerCase().includes(searchLower) ||
        template.subject.toLowerCase().includes(searchLower)
      );
    }
    
    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }
    
    setFilteredTemplates(filtered);
  }, [templateSearch, selectedCategory, templates]);
  
  // Helper function to load a lesson plan into state
  const loadLessonPlan = (plan: LessonPlan) => {
    setCurrentLessonPlanId(plan._id || null);
    setLessonTitle(plan.title);
    setSubject(plan.subject);
    setGradeLevel(plan.gradeLevel);
    
    // Convert API objectives format to component state format
    const formattedObjectives: Objective[] = plan.objectives.map((text: string, index: number) => ({
      id: (index + 1).toString(),
      text
    }));
    
    setObjectives(formattedObjectives);
    
    // Convert API procedures to activities
    const formattedActivities: Activity[] = plan.procedures.map((text: string, index: number) => {
      // Try to extract title and duration if the text has a format like "Title (Duration): Description"
      const match = text.match(/^(.+?)\s*\((.+?)\):\s*(.+)$/);
      if (match) {
        return {
          id: (index + 1).toString(),
          title: match[1].trim(),
          duration: match[2].trim(),
          description: match[3].trim()
        };
      } else {
        return {
          id: (index + 1).toString(),
          title: `Activity ${index + 1}`,
          duration: '15 mins',
          description: text
        };
      }
    });
    
    if (formattedActivities.length > 0) {
      setActivities(formattedActivities);
    }
    
    if (typeof plan.materials === 'string') {
      setMaterials(plan.materials);
      setMaterialsList(plan.materials.split(',').map(item => item.trim()).filter(Boolean));
    } else if (Array.isArray(plan.materials)) {
      setMaterials(plan.materials.join(', '));
      setMaterialsList(plan.materials);
    }
    
    setAssessment(plan.assessment);
    setDifferentiation(plan.differentiation);
    setNotes(plan.notes || '');
  };
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Navigation for stepper
  const handleNext = () => {
    // Validate current step
    if (activeStep === 0 && (!lessonTitle || !subject || !gradeLevel)) {
      setSnackbarMessage('Please fill in all required fields in this step');
      setSnackbarSeverity('warning');
      setShowSnackbar(true);
      return;
    }
    
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  
  // Form field handlers
  const handleSubjectChange = (event: SelectChangeEvent) => {
    setSubject(event.target.value);
  };
  
  const handleGradeLevelChange = (event: SelectChangeEvent) => {
    setGradeLevel(event.target.value);
  };
  
  // Objectives handlers
  const addObjective = () => {
    if (newObjective.trim() === '') return;
    
    const newId = (objectives.length + 1).toString();
    setObjectives([...objectives, { id: newId, text: newObjective }]);
    setNewObjective('');
  };
  
  const updateObjective = (id: string, text: string) => {
    setObjectives(objectives.map(obj => 
      obj.id === id ? { ...obj, text } : obj
    ));
  };
  
  const removeObjective = (id: string) => {
    setObjectives(objectives.filter(obj => obj.id !== id));
  };
  
  // Standards handlers
  const addStandard = () => {
    if (newStandard.trim() === '') return;
    
    setStandards([...standards, newStandard]);
    setNewStandard('');
  };
  
  const removeStandard = (index: number) => {
    setStandards(standards.filter((_, i) => i !== index));
  };
  
  // Activity handlers
  const addActivity = () => {
    const newId = (activities.length + 1).toString();
    setActivities([
      ...activities, 
      { id: newId, title: 'New Activity', duration: '15 mins', description: 'Describe the activity here.' }
    ]);
  };
  
  const updateActivity = (id: string, field: keyof Activity, value: string) => {
    setActivities(activities.map(activity => 
      activity.id === id ? { ...activity, [field]: value } : activity
    ));
  };
  
  const removeActivity = (id: string) => {
    setActivities(activities.filter(activity => activity.id !== id));
  };
  
  // Materials handlers
  const updateMaterials = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMaterials(event.target.value);
    setMaterialsList(event.target.value.split(',').map(item => item.trim()).filter(Boolean));
  };
  
  const handleAddMaterial = (material: string) => {
    setMaterialsList([...materialsList, material]);
    setMaterials([...materialsList, material].join(', '));
  };
  
  const handleRemoveMaterial = (index: number) => {
    const newList = [...materialsList];
    newList.splice(index, 1);
    setMaterialsList(newList);
    setMaterials(newList.join(', '));
  };
  
  // AI generation handler
  const handleAIGeneration = async () => {
    if (!subject || !gradeLevel) {
      setSnackbarMessage('Please select a subject and grade level first');
      setSnackbarSeverity('warning');
      setShowSnackbar(true);
      return;
    }
    
    try {
      setGeneratingAI(true);
      setError(null);
      
      // Call AI service to generate lesson plan
      const aiLessonPlan = await aiGenerateLessonPlan({
        subject,
        gradeLevel,
        topic: topic || undefined
      });
      
      // Update state with AI-generated content
      setLessonTitle(aiLessonPlan.title);
      setObjectives(aiLessonPlan.objectives.map((obj, index) => ({
        id: (index + 1).toString(),
        text: obj.text
      })));
      
      setActivities(aiLessonPlan.activities.map((act, index) => ({
        id: (index + 1).toString(),
        title: act.title,
        duration: act.duration,
        description: act.description
      })));
      
      setMaterialsList(aiLessonPlan.materials);
      setMaterials(aiLessonPlan.materials.join(', '));
      setAssessment(aiLessonPlan.assessment);
      setDifferentiation(aiLessonPlan.differentiation);
      
      setSnackbarMessage('Lesson plan generated successfully!');
      setSnackbarSeverity('success');
      setShowSnackbar(true);
      
      // Move to the next step
      setActiveStep(1);
    } catch (err: any) {
      setError(err.message || 'Failed to generate lesson plan');
      setSnackbarMessage('Error: ' + (err.message || 'Failed to generate lesson plan'));
      setSnackbarSeverity('error');
      setShowSnackbar(true);
      console.error(err);
    } finally {
      setGeneratingAI(false);
    }
  };
  
  // Template dialog handlers
  const handleOpenTemplateDialog = () => {
    setTemplateDialogOpen(true);
  };
  
  const handleCloseTemplateDialog = () => {
    setTemplateDialogOpen(false);
  };
  
  // Handle template selection
  const handleSelectTemplate = (template: LessonTemplate) => {
    setSelectedTemplate(template);
  };
  
  // Apply selected template to lesson plan
  const handleApplyTemplate = () => {
    if (!selectedTemplate) return;
    
    // Apply template data to the lesson plan
    setLessonTitle(`${selectedTemplate.title} - My Lesson`);
    setSubject(selectedTemplate.subject);
    setGradeLevel(selectedTemplate.gradeLevel);
    
    // Convert template objectives to component state format
    const formattedObjectives: Objective[] = selectedTemplate.objectives.map((text, index) => ({
      id: (index + 1).toString(),
      text
    }));
    setObjectives(formattedObjectives);
    
    // Convert template activities to component state format
    const formattedActivities: Activity[] = selectedTemplate.activities.map((act, index) => ({
      id: (index + 1).toString(),
      title: act.title,
      duration: act.duration,
      description: act.description
    }));
    setActivities(formattedActivities);
    
    // Apply materials
    setMaterialsList(selectedTemplate.materials);
    setMaterials(selectedTemplate.materials.join(', '));
    
    // Apply assessment and differentiation
    setAssessment(selectedTemplate.assessment);
    setDifferentiation(selectedTemplate.differentiation);
    
    // Show success message
    setSnackbarMessage('Template applied successfully!');
    setSnackbarSeverity('success');
    setShowSnackbar(true);
    
    // Close dialog and go to step 1
    setTemplateDialogOpen(false);
    setActiveStep(0);
  };
  
  // Handle category filter change
  const handleCategoryChange = (event: SelectChangeEvent) => {
    setSelectedCategory(event.target.value);
  };
  
  // Save lesson plan
  const handleSaveLessonPlan = async (lessonPlanParam?: any) => {
    if (!lessonPlanParam && (!lessonTitle || !subject || !gradeLevel)) {
      setSnackbarMessage('Please fill in all required fields');
      setSnackbarSeverity('error');
      setShowSnackbar(true);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      let lessonPlanData;
      
      if (lessonPlanParam) {
        // Use the provided lesson plan data
        lessonPlanData = lessonPlanParam;
      } else {
        // Format data from form fields
        const objectiveTexts = objectives.map(obj => obj.text);
        
        // Format activities into procedures
        const procedures = activities.map(activity => 
          `${activity.title} (${activity.duration}): ${activity.description}`
        );
        
        // Get materials from list
        const materialsArray = materialsList.length > 0 
          ? materialsList 
          : materials.split(',').map(item => item.trim()).filter(Boolean);
        
        lessonPlanData = {
          title: lessonTitle,
          subject,
          gradeLevel,
          objectives: objectiveTexts,
          materials: materialsArray,
          procedures,
          assessment,
          differentiation,
          notes
        };
      }
      
      let response;
      
      // If we're updating an existing lesson plan
      if (currentLessonPlanId) {
        response = await updateLessonPlan(currentLessonPlanId, lessonPlanData);
      } else {
        // Creating a new lesson plan
        response = await createLessonPlan(lessonPlanData);
        setCurrentLessonPlanId(response.data.data._id);
      }
      
      // Refresh the lesson plans list
      const lessonPlansResponse = await getLessonPlans();
      setLessonPlans(lessonPlansResponse.data.data);
      
      setSnackbarMessage('Lesson plan saved successfully!');
      setSnackbarSeverity('success');
      setShowSnackbar(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save lesson plan');
      setSnackbarMessage('Error: ' + (err.response?.data?.message || 'Failed to save lesson plan'));
      setSnackbarSeverity('error');
      setShowSnackbar(true);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Create new lesson plan
  const handleNewLessonPlan = () => {
    setCurrentLessonPlanId(null);
    setLessonTitle('');
    setSubject('');
    setGradeLevel('');
    setTopic('');
    setLessonDate('');
    setDuration('60');
    setObjectives([{ id: '1', text: 'Students will be able to...' }]);
    setActivities([{ id: '1', title: 'Introduction', duration: '10 mins', description: 'Introduce the lesson topic and learning objectives.' }]);
    setMaterials('');
    setMaterialsList([]);
    setAssessment('');
    setDifferentiation('');
    setNotes('');
    setStandards([]);
    setActiveStep(0);
  };
  
  const handleCloseSnackbar = () => {
    setShowSnackbar(false);
  };
  
  // Duplicate an existing lesson plan
  const handleDuplicateLessonPlan = (plan: LessonPlan) => {
    // Load the plan data but reset the ID to create a new one when saving
    loadLessonPlan(plan);
    setCurrentLessonPlanId(null); // Clear the ID so it creates a new plan on save
    setLessonTitle(`${plan.title} (Copy)`); // Add (Copy) to the title
    setTabValue(0); // Switch to editor tab
    
    setSnackbarMessage('Lesson plan duplicated. Save to create a new copy.');
    setSnackbarSeverity('info');
    setShowSnackbar(true);
  };
  
  // View a lesson plan without editing it
  const handleViewLessonPlan = (plan: LessonPlan) => {
    loadLessonPlan(plan);
    setCurrentLessonPlanId(null); // Clear the ID so it creates a new plan if user decides to save
    setTabValue(0); // Switch to editor tab
  };
  
  // Delete a lesson plan
  const handleDeleteLessonPlan = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this lesson plan? This action cannot be undone.')) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      await deleteLessonPlan(id);
      
      // Refresh the lesson plans list
      const lessonPlansResponse = await getLessonPlans();
      setLessonPlans(lessonPlansResponse.data.data);
      
      setSnackbarMessage('Lesson plan deleted successfully');
      setSnackbarSeverity('success');
      setShowSnackbar(true);
      
      // If the deleted plan was the current one, reset to a new plan
      if (currentLessonPlanId === id) {
        handleNewLessonPlan();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete lesson plan');
      setSnackbarMessage('Error: ' + (err.response?.data?.message || 'Failed to delete lesson plan'));
      setSnackbarSeverity('error');
      setShowSnackbar(true);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // AI generator handler
  const handleSaveAILessonPlan = (aiLessonPlan: any) => {
    // Convert the AI-generated plan to the format expected by the API
    const formattedPlan = {
      title: aiLessonPlan.title,
      subject: aiLessonPlan.subject,
      gradeLevel: aiLessonPlan.gradeLevel,
      duration: aiLessonPlan.duration,
      objectives: aiLessonPlan.objectives,
      materials: aiLessonPlan.materials,
      procedure: [
        { 
          title: "Warm-up", 
          description: aiLessonPlan.warmUp.description,
          duration: aiLessonPlan.warmUp.duration
        },
        ...aiLessonPlan.mainActivities.map((activity: any) => ({
          title: activity.title,
          description: activity.description,
          duration: activity.duration
        })),
        {
          title: "Closure",
          description: aiLessonPlan.closure.description,
          duration: aiLessonPlan.closure.duration
        }
      ],
      assessment: aiLessonPlan.assessment.description,
      standards: aiLessonPlan.standards,
      notes: aiLessonPlan.notes
    };
    
    // Call the API to create the lesson plan
    handleSaveLessonPlan(formattedPlan);
    
    // Close the dialog
    setAiGeneratorOpen(false);
  };
  
  if (loading && lessonPlans.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="60vh">
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <EventNoteIcon sx={{ mr: 2, fontSize: 32 }} />
          Lesson Planner
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" paragraph>
          Create comprehensive lesson plans with ease
        </Typography>
      </Box>
      
      {/* Tabs for different views */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="lesson planner tabs">
          <Tab label="Create Lesson Plan" />
          <Tab label="Saved Lesson Plans" />
          <Tab label="Templates" />
        </Tabs>
      </Box>
      
      {/* Create Lesson Plan Tab */}
      <TabPanel value={tabValue} index={0}>
        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {/* Action buttons at top */}
        <Box mb={3} display="flex" justifyContent="space-between">
          <Box>
            <Button 
              variant="outlined" 
              startIcon={<AutoAwesomeIcon />} 
              color="primary"
              onClick={() => setAiGeneratorOpen(true)}
              sx={{ mr: 2 }}
            >
              AI Generate
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<TemplateIcon />}
              onClick={handleOpenTemplateDialog}
              sx={{ mr: 2 }}
            >
              Use Template
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<LocalLibraryIcon />}
              onClick={() => setResourceRecommenderOpen(true)}
              sx={{ mr: 2 }}
            >
              Find Resources
            </Button>
          </Box>
          <Box>
            <Button 
              variant="outlined" 
              color="secondary" 
              onClick={handleNewLessonPlan}
              sx={{ mr: 2 }}
            >
              New Plan
            </Button>
            <Button 
              variant="contained" 
              startIcon={<SaveIcon />} 
              color="primary"
              onClick={handleSaveLessonPlan}
              disabled={loading}
            >
              Save Plan
            </Button>
          </Box>
        </Box>
        
        {/* Main content based on active step */}
        <Paper sx={{ p: 3, mb: 4 }}>
          {/* Step 1: Basic Information */}
          {activeStep === 0 && (
            <Fade in={activeStep === 0}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>Basic Information</Typography>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Lesson Title"
                    variant="outlined"
                    value={lessonTitle}
                    onChange={(e) => setLessonTitle(e.target.value)}
                    required
                    error={!lessonTitle}
                    helperText={!lessonTitle ? "Lesson title is required" : ""}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth required error={!subject}>
                    <InputLabel id="subject-label">Subject</InputLabel>
                    <Select
                      labelId="subject-label"
                      value={subject}
                      label="Subject"
                      onChange={handleSubjectChange}
                    >
                      {subjectOptions.map((subj) => (
                        <MenuItem key={subj} value={subj}>{subj}</MenuItem>
                      ))}
                    </Select>
                    {!subject && <FormHelperText>Subject is required</FormHelperText>}
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth required error={!gradeLevel}>
                    <InputLabel id="grade-level-label">Grade Level</InputLabel>
                    <Select
                      labelId="grade-level-label"
                      value={gradeLevel}
                      label="Grade Level"
                      onChange={handleGradeLevelChange}
                    >
                      {gradeLevelOptions.map((grade) => (
                        <MenuItem key={grade} value={grade}>Grade {grade}</MenuItem>
                      ))}
                    </Select>
                    {!gradeLevel && <FormHelperText>Grade level is required</FormHelperText>}
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Lesson Duration (minutes)"
                    variant="outlined"
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Topic"
                    variant="outlined"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Main topic or focus of the lesson"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Lesson Date"
                    variant="outlined"
                    type="date"
                    value={lessonDate}
                    onChange={(e) => setLessonDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                
                {/* Standards Alignment */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>Standards Alignment</Typography>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs>
                      <TextField
                        fullWidth
                        label="Add Standard"
                        variant="outlined"
                        value={newStandard}
                        onChange={(e) => setNewStandard(e.target.value)}
                        placeholder="e.g., CCSS.ELA-LITERACY.RL.4.1"
                      />
                    </Grid>
                    <Grid item>
                      <Button 
                        variant="contained" 
                        onClick={addStandard}
                        disabled={!newStandard.trim()}
                      >
                        Add
                      </Button>
                    </Grid>
                  </Grid>
                </Grid>
                
                {standards.length > 0 && (
                  <Grid item xs={12}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>Applied Standards:</Typography>
                      <Box display="flex" flexWrap="wrap" gap={1}>
                        {standards.map((standard, index) => (
                          <Chip 
                            key={index}
                            label={standard}
                            onDelete={() => removeStandard(index)}
                            color="primary"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </Fade>
          )}
          
          {/* Step 2: Learning Objectives */}
          {activeStep === 1 && (
            <Fade in={activeStep === 1}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>Learning Objectives</Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Define what students will be able to do by the end of the lesson
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <List dense>
                    {objectives.map((obj, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <CheckIcon color="success" />
                        </ListItemIcon>
                        <ListItemText primary={obj.text} />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
                
                <Grid item xs={12}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs>
                      <TextField
                        fullWidth
                        label="New Objective"
                        variant="outlined"
                        value={newObjective}
                        onChange={(e) => setNewObjective(e.target.value)}
                        placeholder="Students will be able to..."
                      />
                    </Grid>
                    <Grid item>
                      <Button 
                        variant="contained" 
                        startIcon={<AddIcon />}
                        onClick={addObjective}
                        disabled={!newObjective.trim()}
                      >
                        Add
                      </Button>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Fade>
          )}
          
          {/* Step 3: Activities & Materials */}
          {activeStep === 2 && (
            <Fade in={activeStep === 2}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>Lesson Activities</Typography>
                </Grid>
                
                {activities.map((activity) => (
                  <Grid item xs={12} key={activity.id}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} md={4}>
                          <TextField
                            fullWidth
                            label="Activity Title"
                            value={activity.title}
                            onChange={(e) => updateActivity(activity.id, 'title', e.target.value)}
                            variant="outlined"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6} md={2}>
                          <TextField
                            fullWidth
                            label="Duration"
                            value={activity.duration}
                            onChange={(e) => updateActivity(activity.id, 'duration', e.target.value)}
                            variant="outlined"
                            placeholder="e.g., 15 mins"
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Box display="flex" alignItems="center" height="100%">
                            <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                              Total: {activity.duration}
                            </Typography>
                            <IconButton 
                              color="error" 
                              onClick={() => removeActivity(activity.id)}
                              sx={{ ml: 'auto' }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="Description"
                            value={activity.description}
                            onChange={(e) => updateActivity(activity.id, 'description', e.target.value)}
                            variant="outlined"
                          />
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                ))}
                
                <Grid item xs={12}>
                  <Button 
                    variant="outlined" 
                    startIcon={<AddIcon />}
                    onClick={addActivity}
                    fullWidth
                    sx={{ mt: 1 }}
                  >
                    Add Activity
                  </Button>
                </Grid>
                
                {/* Materials section */}
                <Grid item xs={12} sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>Materials Needed</Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Materials (comma separated)"
                    value={materials}
                    onChange={updateMaterials}
                    variant="outlined"
                    placeholder="Textbooks, whiteboard, markers, handouts, etc."
                  />
                </Grid>
                
                {materialsList.length > 0 && (
                  <Grid item xs={12}>
                    <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>Materials List:</Typography>
                      <Box display="flex" flexWrap="wrap" gap={1}>
                        {materialsList.map((material, index) => (
                          <Chip 
                            key={index}
                            label={material}
                            onDelete={() => handleRemoveMaterial(index)}
                            color="primary"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </Fade>
          )}
          
          {/* Step 4: Assessment & Differentiation */}
          {activeStep === 3 && (
            <Fade in={activeStep === 3}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>Assessment Methods</Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="How will you assess student learning?"
                    value={assessment}
                    onChange={(e) => setAssessment(e.target.value)}
                    variant="outlined"
                    placeholder="Describe formative and summative assessments..."
                  />
                </Grid>
                
                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Typography variant="h6" gutterBottom>Differentiation Strategies</Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="How will you address diverse learning needs?"
                    value={differentiation}
                    onChange={(e) => setDifferentiation(e.target.value)}
                    variant="outlined"
                    placeholder="Strategies for supporting struggling learners and challenging advanced students..."
                  />
                </Grid>
                
                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Typography variant="h6" gutterBottom>Additional Notes</Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    variant="outlined"
                    placeholder="Any additional information or reminders..."
                  />
                </Grid>
              </Grid>
            </Fade>
          )}
          
          {/* Step 5: Review & Save */}
          {activeStep === 4 && (
            <Fade in={activeStep === 4}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>Review Lesson Plan</Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Review your lesson plan before saving. You can go back to previous steps to make changes if needed.
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Paper variant="outlined" sx={{ p: 3 }}>
                    <Box mb={2}>
                      <Typography variant="h5" gutterBottom>{lessonTitle}</Typography>
                      <Typography variant="subtitle1" color="text.secondary">
                        {subject} - Grade {gradeLevel} - {duration} minutes
                      </Typography>
                      {topic && (
                        <Typography variant="subtitle2" color="primary">
                          Topic: {topic}
                        </Typography>
                      )}
                    </Box>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Typography variant="h6" gutterBottom>Learning Objectives</Typography>
                    <List dense>
                      {objectives.map((obj, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <CheckIcon color="success" />
                          </ListItemIcon>
                          <ListItemText primary={obj.text} />
                        </ListItem>
                      ))}
                    </List>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Typography variant="h6" gutterBottom>Activities</Typography>
                    {activities.map((activity, index) => (
                      <Box key={index} mb={2}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {activity.title} ({activity.duration})
                        </Typography>
                        <Typography variant="body2" paragraph>
                          {activity.description}
                        </Typography>
                      </Box>
                    ))}
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="h6" gutterBottom>Materials</Typography>
                        <Box display="flex" flexWrap="wrap" gap={1}>
                          {materialsList.map((material, index) => (
                            <Chip key={index} label={material} size="small" />
                          ))}
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <Typography variant="h6" gutterBottom>Standards</Typography>
                        {standards.length > 0 ? (
                          <Box display="flex" flexWrap="wrap" gap={1}>
                            {standards.map((standard, index) => (
                              <Chip key={index} label={standard} size="small" color="primary" />
                            ))}
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No standards specified
                          </Typography>
                        )}
                      </Grid>
                    </Grid>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Typography variant="h6" gutterBottom>Assessment</Typography>
                    <Typography variant="body2" paragraph>
                      {assessment || "No assessment methods specified"}
                    </Typography>
                    
                    <Typography variant="h6" gutterBottom>Differentiation</Typography>
                    <Typography variant="body2" paragraph>
                      {differentiation || "No differentiation strategies specified"}
                    </Typography>
                    
                    {notes && (
                      <>
                        <Typography variant="h6" gutterBottom>Notes</Typography>
                        <Typography variant="body2" paragraph>
                          {notes}
                        </Typography>
                      </>
                    )}
                  </Paper>
                </Grid>
                
                <Grid item xs={12}>
                  <Box display="flex" justifyContent="space-between">
                    <Box>
                      <Button 
                        variant="outlined" 
                        startIcon={<PrintIcon />}
                        sx={{ mr: 2 }}
                        onClick={() => window.print()}
                      >
                        Print
                      </Button>
                      <Button 
                        variant="outlined" 
                        startIcon={<ShareIcon />}
                      >
                        Share
                      </Button>
                    </Box>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      startIcon={<SaveIcon />}
                      onClick={handleSaveLessonPlan}
                      disabled={loading}
                    >
                      Save Lesson Plan
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Fade>
          )}
        </Paper>
        
        {/* Navigation buttons */}
        <Box display="flex" justifyContent="space-between">
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            startIcon={<BackIcon />}
          >
            Back
          </Button>
          <Button
            variant="contained"
            onClick={activeStep === steps.length - 1 ? handleSaveLessonPlan : handleNext}
            endIcon={activeStep === steps.length - 1 ? <SaveIcon /> : <NextIcon />}
            color={activeStep === steps.length - 1 ? "success" : "primary"}
          >
            {activeStep === steps.length - 1 ? 'Save' : 'Next'}
          </Button>
        </Box>
      </TabPanel>
      
      {/* Saved Lesson Plans Tab */}
      <TabPanel value={tabValue} index={1}>
        <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Saved Lesson Plans</Typography>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={() => {
              handleNewLessonPlan();
              setTabValue(0);
            }}
          >
            Create New Plan
          </Button>
        </Box>
        
        {lessonPlans.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">No saved lesson plans found</Typography>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => setTabValue(0)}
              sx={{ mt: 2 }}
            >
              Create Your First Lesson Plan
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {lessonPlans.map((plan) => (
              <Grid item xs={12} md={6} key={plan._id}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4
                    }
                  }}
                >
                  <CardHeader 
                    title={
                      <Typography variant="h6" noWrap sx={{ maxWidth: '90%' }} title={plan.title}>
                        {plan.title}
                      </Typography>
                    }
                    subheader={`${plan.subject} - Grade ${plan.gradeLevel}`}
                    action={
                      <IconButton aria-label="settings">
                        <SettingsIcon />
                      </IconButton>
                    }
                  />
                  <CardContent>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {plan.objectives.length} objectives · {plan.procedures.length} activities
                    </Typography>
                    <Box mt={2} display="flex" justifyContent="space-between">
                      <Box display="flex" gap={1}>
                        <Button 
                          size="small"
                          onClick={() => handleViewLessonPlan(plan)}
                        >
                          View
                        </Button>
                        <Button 
                          size="small"
                          color="primary"
                          onClick={() => {
                            loadLessonPlan(plan);
                            setTabValue(0);
                          }}
                        >
                          Edit
                        </Button>
                        <Button 
                          size="small" 
                          startIcon={<DuplicateIcon />}
                          onClick={() => handleDuplicateLessonPlan(plan)}
                        >
                          Duplicate
                        </Button>
                      </Box>
                      <Button 
                        size="small" 
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDeleteLessonPlan(plan._id || '')}
                      >
                        Delete
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>
      
      {/* Templates Tab */}
      <TabPanel value={tabValue} index={2}>
        <Typography variant="h6" gutterBottom>Lesson Plan Templates</Typography>
        
        {/* Template filters */}
        <Box mb={3}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search templates..."
                value={templateSearch}
                onChange={(e) => setTemplateSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="template-category-label">Filter by Category</InputLabel>
                <Select
                  labelId="template-category-label"
                  value={selectedCategory}
                  label="Filter by Category"
                  onChange={handleCategoryChange}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {templateCategories.map((category) => (
                    <MenuItem key={category} value={category}>{category}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>
        
        {/* Template cards */}
        {filteredTemplates.length > 0 ? (
          <Grid container spacing={3}>
            {filteredTemplates.map((template) => (
              <Grid item xs={12} sm={6} md={4} key={template.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardMedia
                    component="div"
                    sx={{
                      height: 140,
                      bgcolor: 
                        template.subject === 'Math' ? 'info.light' : 
                        template.subject === 'Science' ? 'success.light' : 
                        template.subject === 'English' ? 'secondary.light' : 
                        'primary.light',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Typography variant="h6" color="white" align="center" sx={{ padding: 2 }}>
                      {template.title}
                    </Typography>
                  </CardMedia>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {template.description}
                    </Typography>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Chip size="small" label={template.subject} />
                      <Chip size="small" label={`Grade ${template.gradeLevel}`} />
                    </Box>
                    <Typography variant="caption" display="block" color="text.secondary" gutterBottom>
                      Category: {template.category}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {template.objectives.length} objectives • {template.activities.length} activities
                    </Typography>
                  </CardContent>
                  <Box p={2} pt={0}>
                    <Button 
                      fullWidth 
                      variant="contained" 
                      color="primary"
                      onClick={() => {
                        handleSelectTemplate(template);
                        handleApplyTemplate();
                      }}
                    >
                      Use Template
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">
              No templates match your search criteria.
            </Typography>
          </Paper>
        )}
      </TabPanel>
      
      {/* Template selection dialog */}
      <Dialog
        open={templateDialogOpen}
        onClose={handleCloseTemplateDialog}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h5" component="div">Choose a Template</Typography>
        </DialogTitle>
        <DialogContent>
          <Box mb={3}>
            <Typography variant="body2" color="text.secondary" paragraph>
              Select a template to start your lesson plan
            </Typography>
            
            {/* Search and filters */}
            <Grid container spacing={2} alignItems="center" mb={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Search templates..."
                  value={templateSearch}
                  onChange={(e) => setTemplateSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="category-filter-label">Filter by Category</InputLabel>
                  <Select
                    labelId="category-filter-label"
                    value={selectedCategory}
                    label="Filter by Category"
                    onChange={handleCategoryChange}
                  >
                    <MenuItem value="">All Categories</MenuItem>
                    {templateCategories.map((category) => (
                      <MenuItem key={category} value={category}>{category}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            
            {/* Templates grid */}
            {filteredTemplates.length > 0 ? (
              <Grid container spacing={3}>
                {filteredTemplates.map((template) => (
                  <Grid item xs={12} sm={6} md={4} key={template.id}>
                    <Card 
                      sx={{ 
                        height: '100%', 
                        display: 'flex', 
                        flexDirection: 'column',
                        borderColor: selectedTemplate?.id === template.id ? 'primary.main' : 'transparent',
                        borderWidth: 2,
                        borderStyle: 'solid',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: 4
                        }
                      }}
                    >
                      <CardActionArea 
                        onClick={() => handleSelectTemplate(template)}
                        sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
                      >
                        <CardMedia
                          component="div"
                          sx={{
                            height: 140,
                            bgcolor: 
                              template.subject === 'Math' ? 'info.light' : 
                              template.subject === 'Science' ? 'success.light' : 
                              template.subject === 'English' ? 'secondary.light' : 
                              'primary.light',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Typography variant="h6" color="white" align="center" sx={{ padding: 2 }}>
                            {template.title}
                          </Typography>
                        </CardMedia>
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Typography variant="body2" color="text.secondary" paragraph>
                            {template.description}
                          </Typography>
                          <Box display="flex" justifyContent="space-between" mb={1}>
                            <Chip size="small" label={template.subject} />
                            <Chip size="small" label={`Grade ${template.gradeLevel}`} />
                          </Box>
                          <Typography variant="caption" color="text.secondary">
                            {template.objectives.length} objectives • {template.activities.length} activities
                          </Typography>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="text.secondary">
                  No templates match your search criteria.
                </Typography>
              </Paper>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTemplateDialog}>Cancel</Button>
          <Button 
            variant="contained" 
            color="primary" 
            disabled={!selectedTemplate}
            onClick={handleApplyTemplate}
          >
            Use Template
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* AI generator dialog */}
      <Dialog 
        open={aiGeneratorOpen} 
        onClose={() => setAiGeneratorOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogContent>
          <AILessonGenerator onSave={handleSaveAILessonPlan} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAiGeneratorOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      
      {/* Resource Recommender Dialog */}
      {resourceRecommenderOpen && (
        <ResourceRecommender
          isDialog={true}
          lessonContent={lessonTitle + ' ' + objectives.map(obj => obj.text).join(' ')}
          subject={subject}
          gradeLevel={gradeLevel}
          onClose={() => setResourceRecommenderOpen(false)}
        />
      )}
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={showSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbarSeverity} 
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default LessonPlanner; 