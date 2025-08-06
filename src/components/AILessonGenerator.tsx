import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
  Snackbar,
  Alert,
  Stepper,
  Step,
  StepLabel,
  ListItem,
  List,
  Chip
} from '@mui/material';
import {
  Lightbulb as LightbulbIcon,
  AutoAwesome as MagicIcon,
  School as SchoolIcon,
  Timer as TimerIcon,
  Assignment as AssignmentIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { generateLessonPlan } from '../services/aiService';
import { logActivity } from '../services/dashboardService';

const subjects = [
  'Math', 'Science', 'English', 'History', 'Geography', 
  'Art', 'Music', 'Physical Education', 'Computer Science', 'Foreign Language'
];

const gradeLevels = [
  'Kindergarten', '1st Grade', '2nd Grade', '3rd Grade', '4th Grade',
  '5th Grade', '6th Grade', '7th Grade', '8th Grade', '9th Grade',
  '10th Grade', '11th Grade', '12th Grade'
];

const durations = [
  '30 minutes', '45 minutes', '60 minutes', '90 minutes', '2 hours'
];

const AILessonGenerator: React.FC<{
  onSave?: (lessonPlan: any) => void;
}> = ({ onSave }) => {
  // Form state
  const [subject, setSubject] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [duration, setDuration] = useState('');
  const [objectives, setObjectives] = useState('');
  const [standards, setStandards] = useState('');
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);
  const [activeStep, setActiveStep] = useState(0);
  
  const steps = ['Enter Basic Info', 'Define Objectives', 'Generate Plan'];
  
  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };
  
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };
  
  const handleGenerate = async () => {
    // Validate form
    if (!subject || !gradeLevel || !duration || !objectives) {
      setError('Please fill in all required fields');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Call AI service to generate lesson plan
      const generatedLessonPlan = await generateLessonPlan(
        subject,
        gradeLevel,
        duration,
        objectives,
        standards
      );
      
      // Update state with generated plan
      setGeneratedPlan(generatedLessonPlan);
      
      // Log activity
      await logActivity(
        `Generated AI lesson plan: ${generatedLessonPlan.title}`,
        'lesson',
        `${subject}, ${gradeLevel}, ${duration}`
      );
      
    } catch (err: any) {
      setError(err.message || 'Failed to generate lesson plan');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSave = () => {
    if (generatedPlan && onSave) {
      onSave(generatedPlan);
    }
  };
  
  const handleCloseError = () => {
    setError(null);
  };
  
  const handleRegenerate = () => {
    setGeneratedPlan(null);
    setActiveStep(0);
  };

  return (
    <Paper sx={{ p: 3, borderRadius: 2 }}>
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
        <MagicIcon color="primary" sx={{ mr: 1, fontSize: 30 }} />
        <Typography variant="h5" component="h2">
          AI Lesson Plan Generator
        </Typography>
      </Box>
      
      <Divider sx={{ mb: 3 }} />
      
      {!generatedPlan ? (
        <Box>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          
          {activeStep === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Subject</InputLabel>
                  <Select
                    value={subject}
                    label="Subject"
                    onChange={(e) => setSubject(e.target.value)}
                  >
                    {subjects.map((subj) => (
                      <MenuItem key={subj} value={subj}>{subj}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Grade Level</InputLabel>
                  <Select
                    value={gradeLevel}
                    label="Grade Level"
                    onChange={(e) => setGradeLevel(e.target.value)}
                  >
                    {gradeLevels.map((grade) => (
                      <MenuItem key={grade} value={grade}>{grade}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Duration</InputLabel>
                  <Select
                    value={duration}
                    label="Duration"
                    onChange={(e) => setDuration(e.target.value)}
                  >
                    {durations.map((dur) => (
                      <MenuItem key={dur} value={dur}>{dur}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          )}
          
          {activeStep === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Learning Objectives"
                  multiline
                  rows={3}
                  value={objectives}
                  onChange={(e) => setObjectives(e.target.value)}
                  placeholder="e.g., Students will be able to identify and explain the water cycle"
                  helperText="Describe what students should learn or be able to do by the end of the lesson"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Standards (optional)"
                  multiline
                  rows={2}
                  value={standards}
                  onChange={(e) => setStandards(e.target.value)}
                  placeholder="e.g., NGSS 5-ESS2-1, Common Core ELA.L.5.1"
                  helperText="Enter any academic standards this lesson should address"
                />
              </Grid>
            </Grid>
          )}
          
          {activeStep === 2 && (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <Typography variant="h6" gutterBottom>
                Ready to Generate Your Lesson Plan
              </Typography>
              <Typography color="text.secondary" paragraph>
                Our AI will create a complete lesson plan based on your inputs.
              </Typography>
              <Box sx={{ mt: 3 }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <LightbulbIcon />}
                  onClick={handleGenerate}
                  disabled={loading}
                >
                  {loading ? 'Generating...' : 'Generate Lesson Plan'}
                </Button>
              </Box>
              
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                This typically takes 15-30 seconds
              </Typography>
            </Box>
          )}
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button 
              disabled={activeStep === 0}
              onClick={handleBack}
            >
              Back
            </Button>
            <Button
              variant="contained"
              onClick={activeStep === steps.length - 1 ? handleGenerate : handleNext}
              disabled={(activeStep === steps.length - 1 && loading) || 
                        (activeStep === 0 && (!subject || !gradeLevel || !duration)) ||
                        (activeStep === 1 && !objectives)}
            >
              {activeStep === steps.length - 1 ? 'Generate' : 'Next'}
            </Button>
          </Box>
        </Box>
      ) : (
        <Box>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                {generatedPlan.title}
              </Typography>
              
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={4}>
                  <Chip icon={<SchoolIcon />} label={`${subject} - ${gradeLevel}`} size="small" />
                </Grid>
                <Grid item xs={4} sx={{ textAlign: 'center' }}>
                  <Chip icon={<TimerIcon />} label={duration} size="small" />
                </Grid>
                <Grid item xs={4} sx={{ textAlign: 'right' }}>
                  <Chip icon={<MagicIcon />} label="AI Generated" color="primary" size="small" />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <LightbulbIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Objectives
                  </Typography>
                  <Typography variant="body2" paragraph>
                    {generatedPlan.objectives}
                  </Typography>
                  
                  {generatedPlan.standards && (
                    <>
                      <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                        Standards:
                      </Typography>
                      <Typography variant="body2">
                        {generatedPlan.standards}
                      </Typography>
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    <AssignmentIcon fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Materials
                  </Typography>
                  {generatedPlan.materials && generatedPlan.materials.length > 0 ? (
                    <List dense>
                      {generatedPlan.materials.map((material: string, index: number) => (
                        <ListItem key={index}>
                          <Typography variant="body2">• {material}</Typography>
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2">No specific materials required.</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Warm-Up ({generatedPlan.warmUp.duration})
                  </Typography>
                  <Typography variant="subtitle1">{generatedPlan.warmUp.title}</Typography>
                  <Typography variant="body2" paragraph>
                    {generatedPlan.warmUp.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Main Activities
                  </Typography>
                  
                  {generatedPlan.mainActivities.map((activity: any, index: number) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Typography variant="subtitle1">
                        {activity.title} ({activity.duration})
                      </Typography>
                      <Typography variant="body2" paragraph>
                        {activity.description}
                      </Typography>
                      {index < generatedPlan.mainActivities.length - 1 && (
                        <Divider sx={{ my: 1 }} />
                      )}
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Assessment
                  </Typography>
                  <Typography variant="subtitle2">{generatedPlan.assessment.method}</Typography>
                  <Typography variant="body2" paragraph>
                    {generatedPlan.assessment.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Closure ({generatedPlan.closure.duration})
                  </Typography>
                  <Typography variant="body2">
                    {generatedPlan.closure.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              onClick={handleRegenerate}
            >
              Create Another Plan
            </Button>
            
            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              onClick={handleSave}
            >
              Save Lesson Plan
            </Button>
          </Box>
        </Box>
      )}
      
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
    </Paper>
  );
};

export default AILessonGenerator; 