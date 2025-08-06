import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Grid,
  IconButton,
  InputAdornment,
  Link,
  Paper,
  Rating,
  TextField,
  Typography,
  Tooltip,
  useTheme
} from '@mui/material';
import {
  Search as SearchIcon,
  LocalLibrary as ResourceIcon,
  VideoLibrary as VideoIcon,
  Assessment as WorksheetIcon,
  Games as ActivityIcon,
  Quiz as AssessmentIcon,
  MenuBook as ReadingIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  OpenInNew as OpenIcon,
  Share as ShareIcon,
  GetApp as DownloadIcon,
  FilterList as FilterIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { getResourceRecommendations } from '../services/resourceService';

interface ResourceRecommenderProps {
  lessonContent?: string;
  gradeLevel?: string;
  subject?: string;
  isDialog?: boolean;
  onClose?: () => void;
}

const resourceTypes = [
  { value: 'video', label: 'Videos', icon: <VideoIcon /> },
  { value: 'worksheet', label: 'Worksheets', icon: <WorksheetIcon /> },
  { value: 'activity', label: 'Interactive Activities', icon: <ActivityIcon /> },
  { value: 'assessment', label: 'Assessments', icon: <AssessmentIcon /> },
  { value: 'reading', label: 'Reading Materials', icon: <ReadingIcon /> }
];

const ResourceRecommender: React.FC<ResourceRecommenderProps> = ({
  lessonContent = '',
  gradeLevel = '',
  subject = '',
  isDialog = false,
  onClose
}) => {
  const theme = useTheme();
  
  // State
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localLessonContent, setLocalLessonContent] = useState(lessonContent);
  const [localGradeLevel, setLocalGradeLevel] = useState(gradeLevel);
  const [localSubject, setLocalSubject] = useState(subject);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);
  
  // Load resources based on props or local state
  useEffect(() => {
    if (lessonContent) {
      setLocalLessonContent(lessonContent);
    }
    
    if (gradeLevel) {
      setLocalGradeLevel(gradeLevel);
    }
    
    if (subject) {
      setLocalSubject(subject);
    }
  }, [lessonContent, gradeLevel, subject]);
  
  // Handle resource type selection
  const handleTypeChange = (type: string) => {
    const currentIndex = selectedTypes.indexOf(type);
    const newSelectedTypes = [...selectedTypes];

    if (currentIndex === -1) {
      newSelectedTypes.push(type);
    } else {
      newSelectedTypes.splice(currentIndex, 1);
    }

    setSelectedTypes(newSelectedTypes);
  };
  
  // Fetch recommendations
  const fetchRecommendations = async () => {
    if (!localLessonContent || !localGradeLevel || !localSubject) {
      setError('Please provide lesson content, grade level, and subject');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const recommendations = await getResourceRecommendations(
        localLessonContent,
        localGradeLevel,
        localSubject,
        selectedTypes
      );
      
      setResources(recommendations);
    } catch (err: any) {
      setError(err.message || 'Failed to get resource recommendations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle favorite toggle
  const toggleFavorite = (id: string) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter(fav => fav !== id));
    } else {
      setFavorites([...favorites, id]);
    }
  };
  
  // Get icon for resource type
  const getResourceTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <VideoIcon />;
      case 'worksheet':
        return <WorksheetIcon />;
      case 'activity':
        return <ActivityIcon />;
      case 'assessment':
        return <AssessmentIcon />;
      case 'reading':
        return <ReadingIcon />;
      default:
        return <ResourceIcon />;
    }
  };
  
  // Get color for resource type
  const getResourceTypeColor = (type: string) => {
    switch (type) {
      case 'video':
        return theme.palette.primary.main;
      case 'worksheet':
        return theme.palette.secondary.main;
      case 'activity':
        return theme.palette.success.main;
      case 'assessment':
        return theme.palette.warning.main;
      case 'reading':
        return theme.palette.info.main;
      default:
        return theme.palette.grey[500];
    }
  };
  
  // Submit search form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRecommendations();
  };
  
  // Toggle filters dialog
  const toggleFilters = () => {
    setFilterOpen(!filterOpen);
  };
  
  // Render resource card
  const renderResourceCard = (resource: any) => (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'transform 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 3
        }
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height={resource.type === 'video' ? 140 : 120}
          image={resource.thumbnail}
          alt={resource.title}
        />
        <Chip
          label={resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
          size="small"
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            backgroundColor: getResourceTypeColor(resource.type),
            color: 'white'
          }}
        />
      </Box>
      
      <CardContent sx={{ flexGrow: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Typography 
            variant="subtitle1" 
            component="h3" 
            gutterBottom
            sx={{ 
              fontWeight: 'bold',
              display: '-webkit-box',
              overflow: 'hidden',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: 2,
              height: 48
            }}
          >
            {resource.title}
          </Typography>
          <IconButton 
            size="small" 
            onClick={() => toggleFavorite(resource.id)}
            color="error"
          >
            {favorites.includes(resource.id) ? <FavoriteIcon /> : <FavoriteBorderIcon />}
          </IconButton>
        </Box>
        
        <Box display="flex" alignItems="center" mb={1}>
          <Rating value={parseFloat(resource.rating)} precision={0.5} size="small" readOnly />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
            {resource.rating}
          </Typography>
        </Box>
        
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{
            display: '-webkit-box',
            overflow: 'hidden',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 3,
            height: 60
          }}
        >
          {resource.description}
        </Typography>
        
        <Box mt={2}>
          <Grid container spacing={1}>
            {resource.type === 'video' && (
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">
                  {resource.source} • {resource.duration}
                </Typography>
              </Grid>
            )}
            
            {resource.type === 'worksheet' && (
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">
                  {resource.format} • {resource.pages} pages
                </Typography>
              </Grid>
            )}
            
            {resource.type === 'activity' && (
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">
                  {resource.format} • Est. time: {resource.estimatedTime}
                </Typography>
              </Grid>
            )}
            
            {resource.type === 'assessment' && (
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">
                  {resource.format} • {resource.questionCount} questions
                </Typography>
              </Grid>
            )}
            
            {resource.type === 'reading' && (
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">
                  {resource.format} • Reading level: Grade {resource.readingLevel}
                </Typography>
              </Grid>
            )}
          </Grid>
        </Box>
      </CardContent>
      
      <Divider />
      
      <CardActions>
        <Tooltip title="Open resource">
          <Button 
            size="small" 
            startIcon={<OpenIcon />}
            component="a"
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open
          </Button>
        </Tooltip>
        
        <Box flexGrow={1} />
        
        <Tooltip title="Share">
          <IconButton size="small">
            <ShareIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Download">
          <IconButton size="small">
            <DownloadIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
  
  // Main content
  const content = (
    <Box>
      {/* Search form */}
      <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={2} alignItems="flex-start">
          <Grid item xs={12} md={isDialog ? 12 : 4}>
            <TextField
              fullWidth
              label="Lesson Content or Topic"
              variant="outlined"
              value={localLessonContent}
              onChange={(e) => setLocalLessonContent(e.target.value)}
              placeholder="Enter lesson content, topic, or standards"
              required
              multiline={isDialog}
              rows={isDialog ? 3 : 1}
            />
          </Grid>
          
          <Grid item xs={12} md={isDialog ? 6 : 3}>
            <TextField
              fullWidth
              label="Subject"
              variant="outlined"
              value={localSubject}
              onChange={(e) => setLocalSubject(e.target.value)}
              placeholder="e.g., Math, Science, English"
              required
            />
          </Grid>
          
          <Grid item xs={12} md={isDialog ? 6 : 3}>
            <TextField
              fullWidth
              label="Grade Level"
              variant="outlined"
              value={localGradeLevel}
              onChange={(e) => setLocalGradeLevel(e.target.value)}
              placeholder="e.g., K, 1, 2, 3"
              required
            />
          </Grid>
          
          <Grid item xs={12} md={isDialog ? 12 : 2}>
            <Box display="flex" height="100%">
              <Button
                variant="outlined"
                onClick={toggleFilters}
                startIcon={<FilterIcon />}
                sx={{ mr: 1, height: isDialog ? 'auto' : '100%' }}
              >
                Filters
              </Button>
              
              <Button 
                variant="contained" 
                color="primary" 
                type="submit"
                disabled={loading || !localLessonContent || !localGradeLevel || !localSubject}
                sx={{ flexGrow: 1, height: isDialog ? 'auto' : '100%' }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Find Resources'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Filter dialog */}
      <Dialog open={filterOpen} onClose={toggleFilters} maxWidth="xs" fullWidth>
        <DialogTitle>
          Filter Resources
          <IconButton
            aria-label="close"
            onClick={toggleFilters}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <FormControl component="fieldset" sx={{ mt: 1 }}>
            <FormLabel component="legend">Resource Types</FormLabel>
            <FormGroup>
              {resourceTypes.map((type) => (
                <FormControlLabel
                  key={type.value}
                  control={
                    <Checkbox
                      checked={selectedTypes.indexOf(type.value) !== -1}
                      onChange={() => handleTypeChange(type.value)}
                      icon={<Box 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          color: 'grey.500',
                          '& > svg': { mr: 1 }
                        }}
                      >
                        {type.icon}
                      </Box>}
                      checkedIcon={<Box 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          color: getResourceTypeColor(type.value),
                          '& > svg': { mr: 1 }
                        }}
                      >
                        {type.icon}
                      </Box>}
                    />
                  }
                  label={type.label}
                />
              ))}
            </FormGroup>
          </FormControl>
          
          <Box mt={3} display="flex" justifyContent="space-between">
            <Button onClick={() => setSelectedTypes([])}>
              Clear All
            </Button>
            <Button 
              variant="contained" 
              onClick={toggleFilters}
            >
              Apply Filters
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
      
      {/* Error message */}
      {error && (
        <Paper 
          sx={{ 
            p: 3, 
            mb: 4, 
            backgroundColor: 'error.light', 
            color: 'error.dark' 
          }}
        >
          <Typography variant="body1">{error}</Typography>
        </Paper>
      )}
      
      {/* Results */}
      {resources.length > 0 ? (
        <Box>
          <Box 
            display="flex" 
            justifyContent="space-between" 
            alignItems="center" 
            mb={2}
          >
            <Typography variant="h6" component="h2">
              Recommended Resources ({resources.length})
            </Typography>
            
            {selectedTypes.length > 0 && (
              <Box>
                {selectedTypes.map((type) => (
                  <Chip
                    key={type}
                    label={type.charAt(0).toUpperCase() + type.slice(1)}
                    onDelete={() => handleTypeChange(type)}
                    size="small"
                    icon={getResourceTypeIcon(type)}
                    sx={{ mr: 1 }}
                  />
                ))}
                
                <Button 
                  size="small" 
                  onClick={() => setSelectedTypes([])}
                >
                  Clear
                </Button>
              </Box>
            )}
          </Box>
          
          <Grid container spacing={3}>
            {resources.map((resource) => (
              <Grid item xs={12} sm={6} md={isDialog ? 6 : 4} lg={isDialog ? 4 : 3} key={resource.id}>
                {renderResourceCard(resource)}
              </Grid>
            ))}
          </Grid>
        </Box>
      ) : !loading && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <ResourceIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No resources found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search terms or filters to find teaching resources.
          </Typography>
        </Paper>
      )}
      
      {/* Loading state */}
      {loading && (
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          minHeight={300}
        >
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
  
  return isDialog ? (
    <Dialog
      open={true}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle>
        Resource Recommendations
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {content}
      </DialogContent>
    </Dialog>
  ) : (
    <Box>
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <ResourceIcon sx={{ mr: 2, fontSize: 32 }} />
          Resource Recommender
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" paragraph>
          Find the perfect teaching resources for your lessons
        </Typography>
      </Box>
      
      {content}
    </Box>
  );
};

export default ResourceRecommender; 