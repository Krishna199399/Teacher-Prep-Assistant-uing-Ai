import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  SelectChangeEvent,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  Snackbar,
  Alert,
  Chip,
  Checkbox,
  ListItem,
  List,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  AssessmentOutlined as AssessmentIcon,
  QuizOutlined as QuizIcon,
  LibraryBooks as TestIcon,
  GradingOutlined as RubricIcon,
  AutoAwesome as AIIcon,
  Save as SaveIcon,
  Print as PrintIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Preview as PreviewIcon,
  PlaylistAdd as AddQuestionIcon,
  Help as HelpIcon,
  CheckCircle as CheckCircleIcon,
  CheckCircle as CorrectIcon
} from '@mui/icons-material';
import { generateAssessment } from '../services/aiService';
import { logActivity } from '../services/dashboardService';

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
      id={`assessment-tabpanel-${index}`}
      aria-labelledby={`assessment-tab-${index}`}
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

const questionTypes = [
  { value: 'multiple-choice', label: 'Multiple Choice', description: 'Four-option multiple choice questions with a single correct answer' },
  { value: 'short-answer', label: 'Short Answer', description: 'Brief constructed responses that test recall and comprehension' },
  { value: 'essay', label: 'Essay', description: 'Extended writing responses that assess deeper understanding and application' },
  { value: 'true-false', label: 'True/False', description: 'Binary choice questions to assess factual knowledge' }
];

const gradeLevels = ['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

const AssessmentGenerator: React.FC = () => {
  // Tab state
  const [tabValue, setTabValue] = useState(0);
  
  // Form state
  const [assessmentTitle, setAssessmentTitle] = useState('');
  const [assessmentType, setAssessmentType] = useState<'quiz' | 'test' | 'rubric'>('quiz');
  const [gradeLevel, setGradeLevel] = useState('');
  const [lessonContent, setLessonContent] = useState('');
  const [questionCount, setQuestionCount] = useState(10);
  const [selectedQuestionTypes, setSelectedQuestionTypes] = useState<string[]>(['multiple-choice']);
  
  // Generated assessment state
  const [generatedAssessment, setGeneratedAssessment] = useState<any>(null);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [savedAssessments, setSavedAssessments] = useState<any[]>([]);
  
  // Sample templates for different subjects
  const sampleTemplates = {
    math: "Mathematics Lesson: Quadratic Equations\n\nObjectives: Students will be able to solve quadratic equations using factoring, completing the square, and the quadratic formula. Students will identify the discriminant and determine the number and type of solutions.\n\nKey Concepts: quadratic equation, factoring, completing the square, quadratic formula, discriminant, parabola, roots, solutions, vertex form, standard form",
    english: "English Literature Lesson: Analyzing Theme in Poetry\n\nObjectives: Students will identify and analyze themes in poetry, examine how literary devices contribute to theme development, and compare themes across multiple poems.\n\nKey Concepts: theme, symbolism, metaphor, imagery, tone, mood, diction, figurative language, stanza, meter, rhyme scheme",
    science: "Science Lesson: Cell Structure and Function\n\nObjectives: Students will identify the major organelles of eukaryotic cells, explain the function of each organelle, and compare plant and animal cells.\n\nKey Concepts: cell, organelle, nucleus, mitochondria, chloroplast, cell membrane, cell wall, endoplasmic reticulum, Golgi apparatus, lysosome, ribosome, cytoplasm, eukaryotic, prokaryotic",
    history: "History Lesson: Causes of World War I\n\nObjectives: Students will analyze the long-term and immediate causes of World War I, evaluate the relative importance of different factors, and explain how these causes led to global conflict.\n\nKey Concepts: militarism, alliances, imperialism, nationalism, assassination of Archduke Franz Ferdinand, arms race, balance of power, diplomatic crisis, mobilization, ultimatum"
  };
  
  // Apply sample template
  const applySampleTemplate = (subject: keyof typeof sampleTemplates) => {
    setLessonContent(sampleTemplates[subject]);
  };
  
  // Enhanced loading state to provide feedback during generation
  const [generationProgress, setGenerationProgress] = useState({
    analyzing: false,
    creating: false,
    refining: false,
    complete: false
  });
  
  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Handle assessment type change
  const handleAssessmentTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAssessmentType(event.target.value as 'quiz' | 'test' | 'rubric');
    
    // Reset question types if switching to rubric
    if (event.target.value === 'rubric') {
      setSelectedQuestionTypes([]);
      setQuestionCount(0);
    } else {
      // Default to multiple choice if coming from rubric
      if (assessmentType === 'rubric') {
        setSelectedQuestionTypes(['multiple-choice']);
        setQuestionCount(10);
      }
    }
  };
  
  // Handle grade level change
  const handleGradeLevelChange = (event: SelectChangeEvent) => {
    setGradeLevel(event.target.value);
  };
  
  // Handle question type change
  const handleQuestionTypeChange = (type: string) => {
    const currentIndex = selectedQuestionTypes.indexOf(type);
    const newSelectedTypes = [...selectedQuestionTypes];

    if (currentIndex === -1) {
      newSelectedTypes.push(type);
    } else {
      newSelectedTypes.splice(currentIndex, 1);
    }

    setSelectedQuestionTypes(newSelectedTypes);
  };
  
  // Generate assessment
  const handleGenerateAssessment = async () => {
    // Validate form
    if (!assessmentType || !gradeLevel || !lessonContent) {
      setError('Please fill in all required fields');
      return;
    }
    
    if (assessmentType !== 'rubric' && selectedQuestionTypes.length === 0) {
      setError('Please select at least one question type');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Show progress steps
      setGenerationProgress({
        analyzing: true,
        creating: false,
        refining: false,
        complete: false
      });
      
      // Simulate the analysis step
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setGenerationProgress({
        analyzing: true,
        creating: true,
        refining: false,
        complete: false
      });
      
      // Simulate the creation step
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Call AI service to generate assessment
      const assessment = await generateAssessment(
        lessonContent,
        assessmentType,
        gradeLevel,
        questionCount,
        selectedQuestionTypes
      );
      
      setGenerationProgress({
        analyzing: true,
        creating: true,
        refining: true,
        complete: false
      });
      
      // Simulate refining step
      await new Promise(resolve => setTimeout(resolve, 700));
      
      // Set title if not provided by user
      if (!assessmentTitle) {
        setAssessmentTitle(assessment.title);
      } else {
        assessment.title = assessmentTitle;
      }
      
      // Set generated assessment
      setGeneratedAssessment(assessment);
      
      // Log activity
      await logActivity(
        `Generated AI ${assessmentType}: ${assessment.title}`,
        'assessment',
        `${assessmentType}, Grade ${gradeLevel}`
      );
      
      setGenerationProgress({
        analyzing: true,
        creating: true,
        refining: true,
        complete: true
      });
      
      setSuccess(`${assessmentType.charAt(0).toUpperCase() + assessmentType.slice(1)} generated successfully!`);
      
      // Switch to preview mode
      setPreviewMode(true);
    } catch (err: any) {
      setError(err.message || `Failed to generate ${assessmentType}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Save assessment
  const handleSaveAssessment = () => {
    if (!generatedAssessment) return;
    
    // In a real app, this would save to database
    // Here we'll just add it to local state
    const assessmentToSave = {
      ...generatedAssessment,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    
    setSavedAssessments([assessmentToSave, ...savedAssessments]);
    setSuccess('Assessment saved successfully!');
  };
  
  // Clear form
  const handleClearForm = () => {
    setAssessmentTitle('');
    setAssessmentType('quiz');
    setGradeLevel('');
    setLessonContent('');
    setQuestionCount(10);
    setSelectedQuestionTypes(['multiple-choice']);
    setGeneratedAssessment(null);
    setPreviewMode(false);
  };
  
  // Toggle preview mode
  const handleTogglePreview = () => {
    setPreviewMode(!previewMode);
  };
  
  // Delete assessment
  const handleDeleteAssessment = (id: string) => {
    setSavedAssessments(savedAssessments.filter(a => a.id !== id));
    setSuccess('Assessment deleted successfully!');
  };
  
  // Print assessment
  const handlePrintAssessment = () => {
    window.print();
  };
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <AssessmentIcon sx={{ mr: 2, fontSize: 32 }} />
          Assessment Generator
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" paragraph>
          Create AI-powered assessments, quizzes, tests, and rubrics
        </Typography>
      </Box>
      
      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="assessment tabs">
          <Tab 
            icon={<AIIcon />} 
            iconPosition="start" 
            label="Generate Assessment" 
          />
          <Tab 
            icon={<AssessmentIcon />} 
            iconPosition="start" 
            label="My Assessments" 
          />
        </Tabs>
      </Box>
      
      {/* Generate Assessment Tab */}
      <TabPanel value={tabValue} index={0}>
        {!previewMode ? (
          // Generation Form
          <Paper sx={{ p: 3, mb: 4 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Assessment Information</Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Assessment Title (Optional)"
                  variant="outlined"
                  value={assessmentTitle}
                  onChange={(e) => setAssessmentTitle(e.target.value)}
                  placeholder="Enter a title or let AI generate one"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="grade-level-label">Grade Level</InputLabel>
                  <Select
                    labelId="grade-level-label"
                    value={gradeLevel}
                    label="Grade Level"
                    onChange={handleGradeLevelChange}
                    required
                    error={!gradeLevel}
                  >
                    {gradeLevels.map((grade) => (
                      <MenuItem key={grade} value={grade}>
                        {grade === 'K' ? 'Kindergarten' : `Grade ${grade}`}
                      </MenuItem>
                    ))}
                  </Select>
                  {!gradeLevel && (
                    <FormHelperText error>Please select a grade level</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">Assessment Type</FormLabel>
                  <RadioGroup
                    row
                    name="assessment-type"
                    value={assessmentType}
                    onChange={handleAssessmentTypeChange}
                  >
                    <FormControlLabel 
                      value="quiz" 
                      control={<Radio />} 
                      label="Quiz" 
                      sx={{ mr: 4 }}
                    />
                    <FormControlLabel 
                      value="test" 
                      control={<Radio />} 
                      label="Test" 
                      sx={{ mr: 4 }}
                    />
                    <FormControlLabel 
                      value="rubric" 
                      control={<Radio />} 
                      label="Rubric" 
                    />
                  </RadioGroup>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <Box mb={3}>
                  <TextField
                    fullWidth
                    id="lessonContent"
                    label="Lesson Content or Learning Objectives *"
                    multiline
                    rows={6}
                    variant="outlined"
                    value={lessonContent}
                    onChange={(e) => setLessonContent(e.target.value)}
                    error={!lessonContent && loading}
                    helperText={(lessonContent && !loading) ? `${lessonContent.length} characters` : "Required - Enter lesson content or learning objectives"}
                  />
                  
                  <Box mt={1} sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ mr: 1, alignSelf: 'center' }}>
                      Sample Templates:
                    </Typography>
                    <Chip 
                      label="Math" 
                      size="small" 
                      color="primary" 
                      variant="outlined" 
                      onClick={() => applySampleTemplate('math')}
                      sx={{ cursor: 'pointer' }}
                    />
                    <Chip 
                      label="English" 
                      size="small" 
                      color="secondary" 
                      variant="outlined" 
                      onClick={() => applySampleTemplate('english')}
                      sx={{ cursor: 'pointer' }}
                    />
                    <Chip 
                      label="Science" 
                      size="small" 
                      color="success" 
                      variant="outlined" 
                      onClick={() => applySampleTemplate('science')}
                      sx={{ cursor: 'pointer' }}
                    />
                    <Chip 
                      label="History" 
                      size="small" 
                      color="warning" 
                      variant="outlined" 
                      onClick={() => applySampleTemplate('history')}
                      sx={{ cursor: 'pointer' }}
                    />
                    <Tooltip title="Clear content">
                      <Chip 
                        label="Clear" 
                        size="small" 
                        color="error" 
                        variant="outlined" 
                        onClick={() => setLessonContent('')}
                        sx={{ cursor: 'pointer' }}
                      />
                    </Tooltip>
                  </Box>
                </Box>
              </Grid>
              
              {assessmentType !== 'rubric' && (
                <>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Number of Questions"
                      variant="outlined"
                      value={questionCount}
                      onChange={(e) => setQuestionCount(parseInt(e.target.value) || 0)}
                      InputProps={{ inputProps: { min: 1, max: 50 } }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth error={selectedQuestionTypes.length === 0}>
                      <FormLabel component="legend">Question Types</FormLabel>
                      <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
                        <Grid container spacing={1}>
                          {questionTypes.map((type) => (
                            <Grid item xs={12} sm={6} key={type.value}>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={selectedQuestionTypes.indexOf(type.value) !== -1}
                                    onChange={() => handleQuestionTypeChange(type.value)}
                                  />
                                }
                                label={
                                  <Box>
                                    <Typography variant="body2">{type.label}</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {type.description}
                                    </Typography>
                                  </Box>
                                }
                              />
                            </Grid>
                          ))}
                        </Grid>
                      </Paper>
                      {selectedQuestionTypes.length === 0 && (
                        <FormHelperText error>Please select at least one question type</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>
                </>
              )}
              
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Box display="flex" justifyContent="space-between">
                  <Button
                    variant="outlined"
                    onClick={handleClearForm}
                  >
                    Clear Form
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AIIcon />}
                    onClick={handleGenerateAssessment}
                    disabled={loading || !lessonContent || !gradeLevel || (assessmentType !== 'rubric' && selectedQuestionTypes.length === 0)}
                  >
                    Generate Assessment
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        ) : loading ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            mt: 4, 
            mb: 2,
            bgcolor: 'background.paper',
            p: 3,
            borderRadius: 2,
            boxShadow: 1
          }}>
            <Typography variant="h6" gutterBottom align="center">
              Generating {assessmentType.charAt(0).toUpperCase() + assessmentType.slice(1)}
            </Typography>
            
            <Box sx={{ width: '100%', maxWidth: 400, mb: 2 }}>
              <List>
                <ListItem>
                  <ListItemIcon>
                    {generationProgress.analyzing ? 
                      <CircularProgress size={20} color="primary" /> : 
                      <CircularProgress size={20} />}
                  </ListItemIcon>
                  <ListItemText 
                    primary="Analyzing lesson content" 
                    secondary={generationProgress.analyzing ? "Extracting key concepts and learning objectives..." : "Waiting..."}
                    primaryTypographyProps={{
                      color: generationProgress.analyzing ? 'text.primary' : 'text.disabled'
                    }}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    {generationProgress.creating ? 
                      <CircularProgress size={20} color="primary" /> : 
                      <CircularProgress size={20} />}
                  </ListItemIcon>
                  <ListItemText 
                    primary="Creating assessment structure" 
                    secondary={generationProgress.creating ? "Generating questions and response options..." : "Waiting..."}
                    primaryTypographyProps={{
                      color: generationProgress.creating ? 'text.primary' : 'text.disabled'
                    }}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    {generationProgress.refining ? 
                      <CircularProgress size={20} color="primary" /> : 
                      <CircularProgress size={20} />}
                  </ListItemIcon>
                  <ListItemText 
                    primary="Refining assessment" 
                    secondary={generationProgress.refining ? "Polishing questions and aligning with objectives..." : "Waiting..."}
                    primaryTypographyProps={{
                      color: generationProgress.refining ? 'text.primary' : 'text.disabled'
                    }}
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    {generationProgress.complete ? 
                      <CheckCircleIcon color="success" /> : 
                      <CircularProgress size={20} />}
                  </ListItemIcon>
                  <ListItemText 
                    primary="Assessment ready" 
                    secondary={generationProgress.complete ? "Your assessment has been generated!" : "Waiting..."}
                    primaryTypographyProps={{
                      color: generationProgress.complete ? 'success.main' : 'text.disabled'
                    }}
                  />
                </ListItem>
              </List>
            </Box>
            
            <Typography variant="caption" color="text.secondary" align="center">
              This may take a few moments. AI is working to create a customized assessment based on your content.
            </Typography>
          </Box>
        ) : (
          // Assessment Preview
          <Box>
            <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">
                {assessmentType.charAt(0).toUpperCase() + assessmentType.slice(1)} Preview
              </Typography>
              <Box>
                <Button 
                  variant="outlined" 
                  onClick={handleTogglePreview}
                  sx={{ mr: 2 }}
                >
                  Edit
                </Button>
                <Button 
                  variant="outlined"
                  startIcon={<PrintIcon />}
                  onClick={handlePrintAssessment}
                  sx={{ mr: 2 }}
                >
                  Print
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveAssessment}
                >
                  Save
                </Button>
              </Box>
            </Box>
            
            {generatedAssessment && (
              <Paper sx={{ p: 3 }} className="assessment-preview">
                <Box textAlign="center" mb={3}>
                  <Typography variant="h5" gutterBottom>
                    {generatedAssessment.title}
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary">
                    {assessmentType.charAt(0).toUpperCase() + assessmentType.slice(1)} • Grade {gradeLevel} • {generatedAssessment.totalPoints} Points
                  </Typography>
                </Box>
                
                <Divider sx={{ mb: 3 }} />
                
                <Box mb={4}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Instructions:
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {generatedAssessment.instructions}
                  </Typography>
                  <Box display="flex" alignItems="center" mt={2}>
                    <Chip 
                      label={`Time Limit: ${generatedAssessment.timeLimit} minutes`} 
                      color="primary" 
                      variant="outlined" 
                      size="small"
                      sx={{ mr: 2 }}
                    />
                    <Chip 
                      label={`Total Points: ${generatedAssessment.totalPoints}`} 
                      color="secondary" 
                      variant="outlined" 
                      size="small" 
                    />
                  </Box>
                </Box>
                
                {assessmentType !== 'rubric' ? (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Questions
                    </Typography>
                    
                    {generatedAssessment.questions.map((question: any, index: number) => (
                      <Card key={question.id} sx={{ mb: 3, border: '1px solid #eee' }}>
                        <CardContent>
                          <Box display="flex" justifyContent="space-between" mb={1}>
                            <Typography variant="subtitle1" fontWeight="bold">
                              Question {index + 1}
                            </Typography>
                            <Chip 
                              label={`${question.points} points`}
                              size="small"
                              color="primary"
                            />
                          </Box>
                          
                          <Typography variant="body1" paragraph>
                            {question.text}
                          </Typography>
                          
                          {question.type === 'multiple-choice' && (
                            <List dense>
                              {question.options.map((option: any) => (
                                <ListItem key={option.id}>
                                  <ListItemIcon sx={{ minWidth: 36 }}>
                                    {option.id === question.correctAnswerId && (
                                      <Tooltip title="Correct Answer (hidden from students)">
                                        <CorrectIcon color="success" fontSize="small" />
                                      </Tooltip>
                                    )}
                                  </ListItemIcon>
                                  <ListItemText primary={option.text} />
                                </ListItem>
                              ))}
                            </List>
                          )}
                          
                          {question.type === 'short-answer' && (
                            <Box mt={2}>
                              <Typography variant="caption" color="text.secondary">
                                Expected answer (hidden from students):
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                {question.expectedAnswer}
                              </Typography>
                              
                              <TextField
                                fullWidth
                                multiline
                                rows={2}
                                variant="outlined"
                                placeholder="Student answer area"
                                disabled
                                sx={{ mt: 1, backgroundColor: '#f5f5f5' }}
                              />
                            </Box>
                          )}
                          
                          {question.type === 'essay' && (
                            <Box mt={2}>
                              <Typography variant="caption" color="text.secondary">
                                Grading criteria (hidden from students):
                              </Typography>
                              <List dense>
                                {question.rubricPoints.map((point: any, i: number) => (
                                  <ListItem key={i}>
                                    <ListItemText 
                                      primary={`${point.criteria} (${point.maxPoints} points)`} 
                                    />
                                  </ListItem>
                                ))}
                              </List>
                              
                              <TextField
                                fullWidth
                                multiline
                                rows={4}
                                variant="outlined"
                                placeholder="Student essay area"
                                disabled
                                sx={{ mt: 1, backgroundColor: '#f5f5f5' }}
                              />
                            </Box>
                          )}
                          
                          {question.type === 'true-false' && (
                            <Box mt={2}>
                              <RadioGroup row>
                                <FormControlLabel 
                                  value="true" 
                                  control={<Radio />} 
                                  label="True" 
                                  disabled
                                />
                                <FormControlLabel 
                                  value="false" 
                                  control={<Radio />} 
                                  label="False" 
                                  disabled
                                />
                              </RadioGroup>
                              
                              <Typography variant="caption" color="text.secondary">
                                Correct answer (hidden from students): {question.correctAnswer ? 'True' : 'False'}
                              </Typography>
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                ) : (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Rubric Criteria
                    </Typography>
                    
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Criteria</TableCell>
                          {[4, 3, 2, 1].map((score) => (
                            <TableCell key={score} align="center">
                              {score} Points
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {generatedAssessment.rubric.criteria.map((criterion: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell component="th" scope="row">
                              <Typography fontWeight="bold">{criterion.name}</Typography>
                            </TableCell>
                            {criterion.levels.map((level: any) => (
                              <TableCell key={level.score} align="center">
                                <Typography variant="body2">
                                  {level.description}
                                </Typography>
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    
                    <Box mt={3}>
                      <Typography variant="subtitle1" gutterBottom>
                        Total Points Possible: {generatedAssessment.rubric.totalPoints}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Paper>
            )}
          </Box>
        )}
      </TabPanel>
      
      {/* My Assessments Tab */}
      <TabPanel value={tabValue} index={1}>
        <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Saved Assessments</Typography>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={() => {
              setTabValue(0);
              handleClearForm();
            }}
          >
            Create New Assessment
          </Button>
        </Box>
        
        {savedAssessments.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary" paragraph>
              You don't have any saved assessments yet.
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<AddIcon />}
              onClick={() => setTabValue(0)}
            >
              Create Your First Assessment
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {savedAssessments.map((assessment) => (
              <Grid item xs={12} md={6} key={assessment.id}>
                <Card>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="h6">{assessment.title}</Typography>
                      <Chip 
                        label={assessment.assessmentType.toUpperCase()}
                        color={
                          assessment.assessmentType === 'quiz' ? 'primary' : 
                          assessment.assessmentType === 'test' ? 'secondary' : 
                          'default'
                        }
                        size="small"
                      />
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Grade {assessment.gradeLevel} • {assessment.totalPoints} Points • {assessment.questions?.length || 0} Questions
                    </Typography>
                    
                    <Typography variant="caption" color="text.secondary" display="block">
                      Created: {new Date(assessment.createdAt).toLocaleDateString()}
                    </Typography>
                    
                    <Box mt={2} display="flex" justifyContent="space-between">
                      <Box>
                        <IconButton 
                          color="primary"
                          onClick={() => {
                            setGeneratedAssessment(assessment);
                            setAssessmentType(assessment.assessmentType);
                            setGradeLevel(assessment.gradeLevel);
                            setPreviewMode(true);
                            setTabValue(0);
                          }}
                        >
                          <PreviewIcon />
                        </IconButton>
                        <IconButton color="primary">
                          <EditIcon />
                        </IconButton>
                        <IconButton color="primary" onClick={handlePrintAssessment}>
                          <PrintIcon />
                        </IconButton>
                      </Box>
                      <IconButton 
                        color="error"
                        onClick={() => handleDeleteAssessment(assessment.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>
      
      {/* Error & Success Snackbars */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
      
      <Snackbar
        open={!!success}
        autoHideDuration={4000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AssessmentGenerator;

// Temporary Table components for the rubric view
const Table = ({ children }: { children: React.ReactNode }) => (
  <Box sx={{ overflowX: 'auto' }}>
    <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #eee' }}>
      {children}
    </table>
  </Box>
);

const TableHead = ({ children }: { children: React.ReactNode }) => (
  <thead style={{ backgroundColor: '#f5f5f5' }}>
    {children}
  </thead>
);

const TableBody = ({ children }: { children: React.ReactNode }) => (
  <tbody>
    {children}
  </tbody>
);

const TableRow = ({ children }: { children: React.ReactNode }) => (
  <tr style={{ borderBottom: '1px solid #eee' }}>
    {children}
  </tr>
);

const TableCell = ({ 
  children, 
  align = 'left', 
  component = 'td', 
  scope 
}: { 
  children: React.ReactNode, 
  align?: 'left' | 'center' | 'right', 
  component?: 'td' | 'th',
  scope?: string
}) => (
  <td 
    style={{ 
      padding: '16px', 
      textAlign: align, 
      border: '1px solid #eee',
      ...(component === 'th' ? { backgroundColor: '#f9f9f9' } : {})
    }} 
    {...(component === 'th' ? { scope } : {})}
  >
    {children}
  </td>
); 