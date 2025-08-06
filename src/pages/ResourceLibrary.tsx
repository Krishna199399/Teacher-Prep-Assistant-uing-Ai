import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  Tab,
  Tabs,
  Paper,
  CircularProgress,
  Container,
  Tooltip,
  Fade,
  Badge,
  AppBar,
  LinearProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorderOutlined as BookmarkBorderIcon,
  Share as ShareIcon,
  FilterList as FilterListIcon,
  Download as DownloadIcon,
  Collections as CollectionsIcon,
  Sort as SortIcon,
  Add as AddIcon,
  FilterAlt as FilterAltIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

// Import service and components
import { 
  Resource, 
  Collection, 
  getAllResources, 
  getFilteredResources, 
  toggleResourceSaved, 
  getAllCollections, 
  getSavedResources,
  getSubjects,
  getGradeLevels,
  getResourceTypes
} from '../services/resourceService';
import ResourceDetails from '../components/ResourceDetails';
import AddToCollectionDialog from '../components/AddToCollectionDialog';
import CollectionDetails from '../components/CollectionDetails';

// Animation variants for cards
const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  hover: { y: -8, boxShadow: "0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)" }
};

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
      id={`resource-tabpanel-${index}`}
      aria-labelledby={`resource-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const ResourceLibrary: React.FC = () => {
  // State for resources and collections
  const [resources, setResources] = useState<Resource[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [savedResources, setSavedResources] = useState<Resource[]>([]);
  
  // State for filters
  const [searchTerm, setSearchTerm] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [gradeLevelFilter, setGradeLevelFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [gradeLevels, setGradeLevels] = useState<string[]>([]);
  const [resourceTypes, setResourceTypes] = useState<string[]>([]);
  
  // UI state
  const [tabValue, setTabValue] = useState(0);
  const [sortAnchorEl, setSortAnchorEl] = useState<null | HTMLElement>(null);
  const [isGridView, setIsGridView] = useState(true);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [resourceDetailsOpen, setResourceDetailsOpen] = useState(false);
  const [addToCollectionOpen, setAddToCollectionOpen] = useState(false);
  const [collectionDetailsOpen, setCollectionDetailsOpen] = useState(false);
  const [collectionToAddTo, setCollectionToAddTo] = useState<number | null>(null);

  // Initial data load
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        // Fetch resources and options in parallel
        const [
          fetchedResources, 
          fetchedCollections, 
          fetchedSubjects, 
          fetchedGradeLevels, 
          fetchedResourceTypes
        ] = await Promise.all([
          getAllResources(),
          getAllCollections(),
          getSubjects(),
          getGradeLevels(),
          getResourceTypes()
        ]);
        
        setResources(fetchedResources);
        setCollections(fetchedCollections);
        setSubjects(fetchedSubjects);
        setGradeLevels(fetchedGradeLevels);
        setResourceTypes(fetchedResourceTypes);
        
        // Fetch saved resources separately
        const fetchedSavedResources = await getSavedResources();
        setSavedResources(fetchedSavedResources);
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadInitialData();
  }, []);

  // Apply filters when filter values change
  useEffect(() => {
    const applyFilters = async () => {
      if (tabValue === 0) { // Only filter in the Browse tab
        setLoading(true);
        try {
          const filteredResources = await getFilteredResources(
            searchTerm,
            subjectFilter,
            gradeLevelFilter,
            typeFilter
          );
          setResources(filteredResources);
        } catch (error) {
          console.error('Error applying filters:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    const debounce = setTimeout(() => {
      applyFilters();
    }, 300);
    
    return () => clearTimeout(debounce);
  }, [searchTerm, subjectFilter, gradeLevelFilter, typeFilter, tabValue]);

  // Reload saved resources when tab changes to "Saved"
  useEffect(() => {
    if (tabValue === 2) {
      const loadSavedResources = async () => {
        setLoading(true);
        try {
          const fetchedSavedResources = await getSavedResources();
          setSavedResources(fetchedSavedResources);
        } catch (error) {
          console.error('Error loading saved resources:', error);
        } finally {
          setLoading(false);
        }
      };
      
      loadSavedResources();
    }
  }, [tabValue]);

  // Handle filter changes
  const handleSubjectFilterChange = (event: SelectChangeEvent) => {
    setSubjectFilter(event.target.value);
  };

  const handleGradeLevelFilterChange = (event: SelectChangeEvent) => {
    setGradeLevelFilter(event.target.value);
  };

  const handleTypeFilterChange = (event: SelectChangeEvent) => {
    setTypeFilter(event.target.value);
  };

  // Handle search
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // Handle bookmark toggle
  const handleToggleSave = async (id: number) => {
    try {
      const updatedResource = await toggleResourceSaved(id);
      // Update the resource in all relevant state arrays
      setResources(resources.map(r => r.id === id ? updatedResource : r));
      
      if (updatedResource.saved) {
        setSavedResources([...savedResources, updatedResource]);
      } else {
        setSavedResources(savedResources.filter(r => r.id !== id));
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle sort menu
  const handleSortClick = (event: React.MouseEvent<HTMLElement>) => {
    setSortAnchorEl(event.currentTarget);
  };

  const handleSortClose = () => {
    setSortAnchorEl(null);
  };

  // Sort resources
  const sortResources = (method: string) => {
    let sortedResources = [...resources];
    
    switch (method) {
      case 'newest':
        sortedResources.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
        break;
      case 'popular':
        sortedResources.sort((a, b) => b.downloadCount - a.downloadCount);
        break;
      case 'alphabetical':
        sortedResources.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        break;
    }
    
    setResources(sortedResources);
    handleSortClose();
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setSubjectFilter("");
    setGradeLevelFilter("");
    setTypeFilter("");
  };

  // Resource details handlers
  const handleOpenResourceDetails = (resource: Resource) => {
    setSelectedResource(resource);
    setResourceDetailsOpen(true);
  };

  const handleCloseResourceDetails = () => {
    setResourceDetailsOpen(false);
  };

  // Add to collection handlers
  const handleOpenAddToCollection = (resourceId: number) => {
    setCollectionToAddTo(resourceId);
    setAddToCollectionOpen(true);
  };

  const handleCloseAddToCollection = () => {
    setAddToCollectionOpen(false);
    setCollectionToAddTo(null);
  };

  // Collection details handlers
  const handleOpenCollectionDetails = (collection: Collection) => {
    setSelectedCollection(collection);
    setCollectionDetailsOpen(true);
  };

  const handleCloseCollectionDetails = () => {
    setCollectionDetailsOpen(false);
  };

  // Resource card component to avoid repetition
  const ResourceCard = ({ resource, animate = true }: { resource: Resource, animate?: boolean }) => {
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [downloading, setDownloading] = useState(false);
    
    const handleDownloadFromCard = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      setDownloading(true);
      
      // Simulate download progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 15;
        setDownloadProgress(Math.min(progress, 100));
        
        if (progress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setDownloading(false);
            setDownloadProgress(0);
            
            // Create download link and trigger it
            const link = document.createElement('a');
            link.href = resource.url || '#';
            link.download = `${resource.title}.${resource.fileType.toLowerCase()}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }, 500);
        }
      }, 200);
    };
    
    const handleShareFromCard = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (navigator.share) {
        // Use Web Share API if available
        navigator.share({
          title: resource.title,
          text: resource.description,
          url: `${window.location.origin}/resources/${resource.id}`
        }).catch(err => {
          console.error('Share failed:', err);
          // Fallback if share fails
          copyLinkToClipboard(e);
        });
      } else {
        // Fallback to copy to clipboard
        copyLinkToClipboard(e);
      }
    };
    
    const copyLinkToClipboard = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      const resourceUrl = `${window.location.origin}/resources/${resource.id}`;
      navigator.clipboard.writeText(resourceUrl)
        .then(() => {
          // Create and show toast notification
          const toast = document.createElement('div');
          toast.innerText = 'Link copied to clipboard!';
          toast.style.position = 'fixed';
          toast.style.bottom = '20px';
          toast.style.left = '50%';
          toast.style.transform = 'translateX(-50%)';
          toast.style.backgroundColor = '#333';
          toast.style.color = 'white';
          toast.style.padding = '10px 20px';
          toast.style.borderRadius = '4px';
          toast.style.zIndex = '9999';
          toast.style.boxShadow = '0 3px 6px rgba(0,0,0,0.2)';
          
          document.body.appendChild(toast);
          
          // Remove toast after 3 seconds
          setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.5s ease';
            setTimeout(() => document.body.removeChild(toast), 500);
          }, 3000);
        })
        .catch(err => console.error('Could not copy text: ', err));
    };
    
    return (
      <motion.div 
        variants={animate ? cardVariants : undefined}
        initial="initial"
        animate="animate"
        whileHover="hover"
        style={{ height: '100%' }}
      >
        <Card 
          sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            position: 'relative',
            overflow: 'visible',
            borderRadius: 2
          }}
        >
          {downloading && (
            <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 5, px: 2, pt: 2, pb: 1, backgroundColor: 'rgba(255,255,255,0.9)' }}>
              <Typography variant="caption" display="block" gutterBottom align="center">
                Downloading {Math.round(downloadProgress)}%
              </Typography>
              <LinearProgress variant="determinate" value={downloadProgress} sx={{ height: 6, borderRadius: 3 }} />
            </Box>
          )}
          <CardActionArea 
            sx={{ flexGrow: 1 }}
            onClick={() => handleOpenResourceDetails(resource)}
            disabled={downloading}
          >
            <CardMedia
              component="img"
              height={isGridView ? "140" : "100"}
              image={resource.imageUrl}
              alt={resource.title}
              sx={{ objectFit: isGridView ? 'cover' : 'contain' }}
            />
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Typography gutterBottom variant="h6" component="div" noWrap sx={{ flexGrow: 1, fontWeight: 'bold' }}>
                  {resource.title}
                </Typography>
                <Tooltip title={resource.saved ? "Remove from saved" : "Save resource"}>
                  <IconButton 
                    size="small" 
                    color={resource.saved ? "primary" : "default"}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleToggleSave(resource.id);
                    }}
                    sx={{ 
                      backgroundColor: 'rgba(255,255,255,0.7)',
                      '&:hover': { backgroundColor: 'rgba(255,255,255,0.9)' }
                    }}
                  >
                    {resource.saved ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                  </IconButton>
                </Tooltip>
              </Box>
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {resource.subject} • {resource.gradeLevel}
              </Typography>
              
              {isGridView && (
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ 
                    mb: 2,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    height: '40px'
                  }}
                >
                  {resource.description}
                </Typography>
              )}
              
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 2 }}>
                <Chip 
                  label={resource.type} 
                  size="small" 
                  color="primary"
                  sx={{ borderRadius: '4px' }}
                />
                <Chip 
                  label={resource.fileType} 
                  size="small" 
                  variant="outlined"
                  sx={{ borderRadius: '4px' }}
                />
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  {resource.downloadCount.toLocaleString()} downloads
                </Typography>
                <Box>
                  <Tooltip title="Share">
                    <IconButton 
                      size="small" 
                      onClick={handleShareFromCard}
                      sx={{
                        transition: 'transform 0.2s',
                        '&:hover': { transform: 'scale(1.2)' }
                      }}
                    >
                      <ShareIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Download">
                    <IconButton 
                      size="small" 
                      onClick={handleDownloadFromCard}
                      disabled={downloading}
                      sx={{
                        transition: 'transform 0.2s',
                        '&:hover': { transform: 'scale(1.2)' }
                      }}
                    >
                      <DownloadIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Add to collection">
                    <IconButton 
                      size="small" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenAddToCollection(resource.id);
                      }}
                      sx={{
                        transition: 'transform 0.2s',
                        '&:hover': { transform: 'scale(1.2)' }
                      }}
                    >
                      <CollectionsIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </CardContent>
          </CardActionArea>
        </Card>
      </motion.div>
    );
  };

  return (
    <Box>
      <Box sx={{ mb: 4, backgroundColor: '#f5f9fc', py: 3, px: 2, borderRadius: 2 }}>
        <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
          Resource Library
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Find, save, and organize teaching materials to enhance your lessons
        </Typography>
      </Box>
      
      {/* Search and Filter Bar */}
      <Paper 
        elevation={2} 
        sx={{ 
          p: 2, 
          mb: 3, 
          borderRadius: 2,
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: 3
          }
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search resources..."
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={7}>
            <Box display="flex" gap={2} flexWrap="wrap">
              <FormControl size="small" sx={{ minWidth: 120, flexGrow: { xs: 1, md: 0 } }}>
                <InputLabel id="subject-filter-label">Subject</InputLabel>
                <Select
                  labelId="subject-filter-label"
                  value={subjectFilter}
                  label="Subject"
                  onChange={handleSubjectFilterChange}
                >
                  <MenuItem value="">All</MenuItem>
                  {subjects.map(subject => (
                    <MenuItem key={subject} value={subject}>{subject}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl size="small" sx={{ minWidth: 120, flexGrow: { xs: 1, md: 0 } }}>
                <InputLabel id="grade-filter-label">Grade Level</InputLabel>
                <Select
                  labelId="grade-filter-label"
                  value={gradeLevelFilter}
                  label="Grade Level"
                  onChange={handleGradeLevelFilterChange}
                >
                  <MenuItem value="">All</MenuItem>
                  {gradeLevels.map(grade => (
                    <MenuItem key={grade} value={grade}>{grade}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl size="small" sx={{ minWidth: 120, flexGrow: { xs: 1, md: 0 } }}>
                <InputLabel id="type-filter-label">Resource Type</InputLabel>
                <Select
                  labelId="type-filter-label"
                  value={typeFilter}
                  label="Resource Type"
                  onChange={handleTypeFilterChange}
                >
                  <MenuItem value="">All</MenuItem>
                  {resourceTypes.map(type => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Grid>
          <Grid item xs={12} md={1} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Tooltip title="Sort">
              <IconButton onClick={handleSortClick}>
                <SortIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={isGridView ? "List view" : "Grid view"}>
              <IconButton onClick={() => setIsGridView(!isGridView)}>
                {isGridView ? <ViewListIcon /> : <ViewModuleIcon />}
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={sortAnchorEl}
              open={Boolean(sortAnchorEl)}
              onClose={handleSortClose}
            >
              <MenuItem onClick={() => sortResources('newest')}>Newest First</MenuItem>
              <MenuItem onClick={() => sortResources('popular')}>Most Popular</MenuItem>
              <MenuItem onClick={() => sortResources('alphabetical')}>Alphabetical</MenuItem>
            </Menu>
          </Grid>
        </Grid>
        
        {(searchTerm || subjectFilter || gradeLevelFilter || typeFilter) && (
          <Box display="flex" justifyContent="flex-end" mt={2}>
            <Button 
              size="small" 
              startIcon={<FilterAltIcon />} 
              onClick={clearFilters}
            >
              Clear Filters
            </Button>
          </Box>
        )}
      </Paper>
      
      {/* Tabs */}
      <Box
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          position: 'sticky',
          top: 0,
          backgroundColor: 'background.paper',
          zIndex: 10
        }}
      >
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          aria-label="resource library tabs"
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab 
            label={
              <Box display="flex" alignItems="center" gap={1}>
                <FilterListIcon fontSize="small" />
                <span>Browse Resources</span>
              </Box>
            } 
          />
          <Tab 
            label={
              <Box display="flex" alignItems="center" gap={1}>
                <Badge badgeContent={collections.length} color="primary">
                  <CollectionsIcon fontSize="small" />
                </Badge>
                <span>My Collections</span>
              </Box>
            } 
          />
          <Tab 
            label={
              <Box display="flex" alignItems="center" gap={1}>
                <Badge badgeContent={savedResources.length} color="primary">
                  <BookmarkIcon fontSize="small" />
                </Badge>
                <span>Saved Resources</span>
              </Box>
            } 
          />
        </Tabs>
      </Box>
      
      {/* Loading indicator */}
      {loading && (
        <Box display="flex" justifyContent="center" alignItems="center" py={8}>
          <CircularProgress />
        </Box>
      )}
      
      {/* Browse Resources Tab */}
      <TabPanel value={tabValue} index={0}>
        {!loading && (
          <>
            {resources.length > 0 ? (
              <Grid container spacing={3}>
                {resources.map((resource, index) => (
                  <Grid 
                    item 
                    xs={12} 
                    sm={isGridView ? 6 : 12} 
                    md={isGridView ? 4 : 12} 
                    lg={isGridView ? 3 : 12} 
                    key={resource.id}
                    component={motion.div}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0, 
                      transition: { delay: index * 0.05, duration: 0.3 } 
                    }}
                  >
                    <ResourceCard resource={resource} />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No resources found matching your filters
                </Typography>
                <Button 
                  variant="contained" 
                  sx={{ mt: 2 }}
                  onClick={clearFilters}
                >
                  Clear Filters
                </Button>
              </Box>
            )}
          </>
        )}
      </TabPanel>
      
      {/* My Collections Tab */}
      <TabPanel value={tabValue} index={1}>
        {!loading && (
          <>
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                mb: 3,
                alignItems: 'center'
              }}
            >
              <Typography variant="h6">My Resource Collections</Typography>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={() => handleOpenAddToCollection(-1)} // -1 indicates creating a new collection
                color="primary"
              >
                New Collection
              </Button>
            </Box>
            
            {collections.length > 0 ? (
              <Grid container spacing={3}>
                {collections.map((collection, index) => (
                  <Grid 
                    item 
                    xs={12} 
                    sm={6} 
                    lg={4} 
                    key={collection.id}
                    component={motion.div}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0, 
                      transition: { delay: index * 0.05, duration: 0.3 } 
                    }}
                  >
                    <motion.div whileHover={{ y: -8, transition: { duration: 0.2 } }}>
                      <Card 
                        sx={{ 
                          height: '100%',
                          borderRadius: 2,
                          boxShadow: 2,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            boxShadow: 6
                          }
                        }}
                      >
                        <CardActionArea 
                          sx={{ height: '100%', p: 2 }}
                          onClick={() => handleOpenCollectionDetails(collection)}
                        >
                          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <Box 
                              sx={{ 
                                display: 'flex', 
                                justifyContent: 'space-between',
                                alignItems: 'flex-start'
                              }}
                            >
                              <Typography variant="h6" component="div" fontWeight="bold">
                                {collection.name}
                              </Typography>
                              <Chip 
                                label={`${collection.resourceCount} resources`} 
                                size="small" 
                                color="primary" 
                                variant="outlined"
                              />
                            </Box>
                            
                            <Typography 
                              variant="body2" 
                              color="text.secondary" 
                              sx={{ mt: 1, flexGrow: 1 }}
                            >
                              {collection.description}
                            </Typography>
                            
                            <Divider sx={{ my: 2 }} />
                            
                            <Box 
                              sx={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center' 
                              }}
                            >
                              <Typography variant="caption" color="text.secondary">
                                Created {collection.dateCreated}
                              </Typography>
                              <Tooltip title="Share collection">
                                <IconButton 
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigator.clipboard.writeText(window.location.href + '?collectionId=' + collection.id);
                                    alert('Collection link copied to clipboard!');
                                  }}
                                >
                                  <ShareIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </Box>
                        </CardActionArea>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  You don't have any collections yet
                </Typography>
                <Button 
                  variant="contained" 
                  sx={{ mt: 2 }}
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenAddToCollection(-1)}
                >
                  Create Your First Collection
                </Button>
              </Box>
            )}
          </>
        )}
      </TabPanel>
      
      {/* Saved Resources Tab */}
      <TabPanel value={tabValue} index={2}>
        {!loading && (
          <>
            <Typography variant="h6" gutterBottom>Saved Resources</Typography>
            
            {savedResources.length > 0 ? (
              <Grid container spacing={3}>
                {savedResources.map((resource, index) => (
                  <Grid 
                    item 
                    xs={12} 
                    sm={isGridView ? 6 : 12} 
                    md={isGridView ? 4 : 12} 
                    lg={isGridView ? 3 : 12} 
                    key={resource.id}
                    component={motion.div}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0, 
                      transition: { delay: index * 0.05, duration: 0.3 } 
                    }}
                  >
                    <ResourceCard resource={resource} />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  You haven't saved any resources yet.
                </Typography>
                <Button 
                  variant="contained" 
                  sx={{ mt: 2 }}
                  onClick={() => setTabValue(0)}
                >
                  Browse Resources
                </Button>
              </Box>
            )}
          </>
        )}
      </TabPanel>
      
      {/* Dialogs */}
      {selectedResource && (
        <ResourceDetails
          resource={selectedResource}
          open={resourceDetailsOpen}
          onClose={handleCloseResourceDetails}
          onToggleSave={handleToggleSave}
          onAddToCollection={(id) => handleOpenAddToCollection(id)}
        />
      )}
      
      <AddToCollectionDialog
        open={addToCollectionOpen}
        onClose={handleCloseAddToCollection}
        resourceId={collectionToAddTo}
      />
      
      {selectedCollection && (
        <CollectionDetails
          collection={selectedCollection}
          open={collectionDetailsOpen}
          onClose={handleCloseCollectionDetails}
          onViewResource={handleOpenResourceDetails}
        />
      )}
    </Box>
  );
};

export default ResourceLibrary; 