import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  Chip,
  Button,
  CircularProgress,
  DialogActions,
  Divider,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Alert,
  LinearProgress,
  Tooltip,
  Fade
} from '@mui/material';
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Share as ShareIcon,
  Download as DownloadIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Bookmark as BookmarkIcon,
  Delete as DeleteIcon,
  ContentCopy as ContentCopyIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  LinkedIn as LinkedInIcon,
  Email as EmailIcon,
  Archive as ArchiveIcon
} from '@mui/icons-material';
import { 
  Collection, 
  Resource, 
  getCollectionResources, 
  toggleResourceSaved 
} from '../services/resourceService';
import { motion, AnimatePresence } from 'framer-motion';

interface CollectionDetailsProps {
  collection: Collection | null;
  open: boolean;
  onClose: () => void;
  onViewResource: (resource: Resource) => void;
}

const CollectionDetails: React.FC<CollectionDetailsProps> = ({
  collection,
  open,
  onClose,
  onViewResource
}) => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);
  const [shareMenuAnchor, setShareMenuAnchor] = useState<null | HTMLElement>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info'>('success');
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (open && collection) {
      fetchCollectionResources();
    }
  }, [open, collection]);

  const fetchCollectionResources = async () => {
    if (!collection) return;
    
    try {
      setLoading(true);
      const collectionResources = await getCollectionResources(collection.id);
      setResources(collectionResources);
    } catch (error) {
      console.error('Error fetching collection resources:', error);
      showSnackbar('Failed to load collection resources', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSave = async (resourceId: number) => {
    try {
      const updatedResource = await toggleResourceSaved(resourceId);
      setResources(resources.map(r => 
        r.id === resourceId ? updatedResource : r
      ));
      showSnackbar(updatedResource.saved ? 'Resource saved' : 'Resource unsaved', 'info');
    } catch (error) {
      console.error('Error toggling save:', error);
      showSnackbar('Failed to update resource', 'error');
    }
  };

  const handleOpenShareMenu = (event: React.MouseEvent<HTMLElement>) => {
    setShareMenuAnchor(event.currentTarget);
  };

  const handleCloseShareMenu = () => {
    setShareMenuAnchor(null);
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const copyLinkToClipboard = () => {
    if (!collection) return;
    
    const collectionUrl = `${window.location.origin}/collections/${collection.id}`;
    navigator.clipboard.writeText(collectionUrl)
      .then(() => {
        showSnackbar('Collection link copied to clipboard');
      })
      .catch(err => {
        console.error('Failed to copy link: ', err);
        showSnackbar('Failed to copy link', 'error');
      });
      
    handleCloseShareMenu();
  };

  const shareOnSocialMedia = (platform: string) => {
    if (!collection) return;
    
    const collectionTitle = encodeURIComponent(collection.name);
    const collectionDescription = encodeURIComponent(collection.description);
    const collectionUrl = encodeURIComponent(`${window.location.origin}/collections/${collection.id}`);
    let shareUrl = '';

    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${collectionUrl}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${collectionTitle}&url=${collectionUrl}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${collectionUrl}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${collectionTitle}&body=${collectionDescription}%0A%0ACheck out this collection: ${decodeURIComponent(collectionUrl)}`;
        break;
      default:
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank');
    }
    
    handleCloseShareMenu();
  };

  const handleDownloadAll = () => {
    if (resources.length === 0 || isDownloading) return;
    
    setIsDownloading(true);
    setDownloadProgress(0);
    
    // Simulate downloading all resources one by one
    let totalProgress = 0;
    const progressIncrement = 100 / resources.length;
    let resourceIndex = 0;
    
    const downloadNextResource = () => {
      if (resourceIndex >= resources.length) {
        // All resources downloaded
        setTimeout(() => {
          setIsDownloading(false);
          showSnackbar('All resources downloaded successfully');
        }, 500);
        return;
      }
      
      // Simulate single resource download
      const resource = resources[resourceIndex];
      let singleProgress = 0;
      
      const interval = setInterval(() => {
        singleProgress += Math.random() * 20;
        if (singleProgress >= 100) {
          clearInterval(interval);
          
          // Update total progress
          totalProgress += progressIncrement;
          setDownloadProgress(Math.min(totalProgress, 100));
          
          // Create download link for this resource
          const link = document.createElement('a');
          link.href = resource.url || '#';
          link.download = `${resource.title}.${resource.fileType.toLowerCase()}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          // Go to next resource
          resourceIndex++;
          setTimeout(downloadNextResource, 800);
        } else {
          // Update progress within this single resource download
          const currentTotalProgress = totalProgress + (progressIncrement * (singleProgress / 100));
          setDownloadProgress(Math.min(currentTotalProgress, 100));
        }
      }, 100);
    };
    
    // Start the download process
    downloadNextResource();
  };

  if (!collection) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      scroll="paper"
      aria-labelledby="collection-details-title"
      TransitionComponent={Fade}
      TransitionProps={{
        timeout: 300
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <DialogTitle id="collection-details-title" sx={{ pr: 6 }}>
          {collection.name}
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        {isDownloading && (
          <Box sx={{ width: '100%', px: 3, pb: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="body2" color="text.secondary">
                Downloading collection resources...
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {Math.round(downloadProgress)}%
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={downloadProgress} 
              sx={{ height: 6, borderRadius: 3 }}
            />
          </Box>
        )}

        <DialogContent dividers>
          <Box mb={3}>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              {collection.description}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {collection.resourceCount} resources • Created on {new Date(collection.dateCreated || '').toLocaleDateString()}
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">
              Resources in this Collection
            </Typography>
            {resources.length > 0 && (
              <Typography 
                variant="body2" 
                color="primary" 
                sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                onClick={() => {
                  // Here you could implement sorting or filtering options
                  showSnackbar('Sorting options coming soon!', 'info');
                }}
              >
                Sort resources
              </Typography>
            )}
          </Box>

          {loading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : resources.length > 0 ? (
            <Grid container spacing={3}>
              {resources.map((resource, index) => (
                <Grid 
                  item 
                  xs={12} 
                  sm={6} 
                  md={4} 
                  key={resource.id}
                  component={motion.div}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0, 
                    transition: { delay: index * 0.05, duration: 0.3 } 
                  }}
                >
                  <Card sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    borderRadius: 2,
                    overflow: 'hidden',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4
                    }
                  }}>
                    <CardActionArea onClick={() => onViewResource(resource)}>
                      <CardMedia
                        component="img"
                        height="140"
                        image={resource.imageUrl}
                        alt={resource.title}
                      />
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                          <Typography gutterBottom variant="h6" component="div" noWrap sx={{ maxWidth: '90%', fontWeight: 'medium' }}>
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

                        <Box display="flex" gap={0.5} mt={1} mb={2} flexWrap="wrap">
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

                        <Typography variant="caption" color="text.secondary" display="block">
                          {resource.downloadCount.toLocaleString()} downloads
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box textAlign="center" py={4}>
              <Typography variant="body1" color="text.secondary">
                This collection doesn't have any resources yet.
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between' }}>
          <Button 
            color="error" 
            startIcon={<DeleteIcon />}
            onClick={() => {
              if (window.confirm("Are you sure you want to delete this collection?")) {
                showSnackbar("Collection deleted successfully");
                onClose();
              }
            }}
          >
            Delete Collection
          </Button>
          <Box>
            <Button 
              startIcon={<ShareIcon />}
              onClick={handleOpenShareMenu}
              sx={{ mr: 1 }}
            >
              Share
            </Button>
            <Button 
              startIcon={<DownloadIcon />}
              variant="contained"
              onClick={handleDownloadAll}
              disabled={resources.length === 0 || isDownloading}
            >
              {isDownloading ? 'Downloading...' : 'Download All'}
            </Button>
          </Box>
        </DialogActions>

        {/* Share Menu */}
        <Menu
          anchorEl={shareMenuAnchor}
          open={Boolean(shareMenuAnchor)}
          onClose={handleCloseShareMenu}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
        >
          <MenuItem onClick={copyLinkToClipboard}>
            <ListItemIcon>
              <ContentCopyIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Copy Link</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => shareOnSocialMedia('facebook')}>
            <ListItemIcon>
              <FacebookIcon fontSize="small" color="primary" />
            </ListItemIcon>
            <ListItemText>Facebook</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => shareOnSocialMedia('twitter')}>
            <ListItemIcon>
              <TwitterIcon fontSize="small" color="info" />
            </ListItemIcon>
            <ListItemText>Twitter</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => shareOnSocialMedia('linkedin')}>
            <ListItemIcon>
              <LinkedInIcon fontSize="small" color="primary" />
            </ListItemIcon>
            <ListItemText>LinkedIn</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => shareOnSocialMedia('email')}>
            <ListItemIcon>
              <EmailIcon fontSize="small" color="action" />
            </ListItemIcon>
            <ListItemText>Email</ListItemText>
          </MenuItem>
        </Menu>

        {/* Notification Snackbar */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={4000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbarSeverity} 
            sx={{ width: '100%' }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </motion.div>
    </Dialog>
  );
};

export default CollectionDetails; 