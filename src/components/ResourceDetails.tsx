import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Chip,
  Button,
  Divider,
  Rating,
  Grid,
  Avatar,
  DialogActions,
  Menu,
  MenuItem,
  Tooltip,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Alert,
  LinearProgress,
  Paper,
  Fade
} from '@mui/material';
import {
  Close as CloseIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Bookmark as BookmarkIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Collections as CollectionsIcon,
  OpenInNew as OpenInNewIcon,
  ContentCopy as ContentCopyIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  LinkedIn as LinkedInIcon,
  Email as EmailIcon,
  MoreVert as MoreVertIcon,
  Print as PrintIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { Resource } from '../services/resourceService';
import { motion, AnimatePresence } from 'framer-motion';

interface ResourceDetailsProps {
  resource: Resource | null;
  open: boolean;
  onClose: () => void;
  onToggleSave: (id: number) => void;
  onAddToCollection: (id: number) => void;
}

const ResourceDetails: React.FC<ResourceDetailsProps> = ({
  resource,
  open,
  onClose,
  onToggleSave,
  onAddToCollection
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [shareMenuAnchor, setShareMenuAnchor] = useState<null | HTMLElement>(null);
  const [downloadMenuAnchor, setDownloadMenuAnchor] = useState<null | HTMLElement>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  if (!resource) {
    return null;
  }

  const handleDownload = () => {
    setDownloadMenuAnchor(null);
    setDownloading(true);
    
    // Simulate download progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 10;
      setDownloadProgress(Math.min(progress, 100));
      
      if (progress >= 100) {
        clearInterval(interval);
        setDownloading(false);
        
        // Create download link and trigger it
        const link = document.createElement('a');
        link.href = resource.url || '#';
        link.download = `${resource.title}.${resource.fileType.toLowerCase()}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Show success message
        showSnackbar(`${resource.title} downloaded successfully`);
      }
    }, 200);
  };

  const handleOpenDownloadMenu = (event: React.MouseEvent<HTMLElement>) => {
    setDownloadMenuAnchor(event.currentTarget);
  };

  const handleCloseDownloadMenu = () => {
    setDownloadMenuAnchor(null);
  };

  const handleOpenShareMenu = (event: React.MouseEvent<HTMLElement>) => {
    setShareMenuAnchor(event.currentTarget);
  };

  const handleCloseShareMenu = () => {
    setShareMenuAnchor(null);
  };

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const copyLinkToClipboard = () => {
    const resourceUrl = `${window.location.origin}/resources/${resource.id}`;
    navigator.clipboard.writeText(resourceUrl);
    showSnackbar('Link copied to clipboard');
    handleCloseShareMenu();
  };

  const shareOnSocialMedia = (platform: string) => {
    const resourceTitle = encodeURIComponent(resource.title);
    const resourceUrl = encodeURIComponent(`${window.location.origin}/resources/${resource.id}`);
    let shareUrl = '';

    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${resourceUrl}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${resourceTitle}&url=${resourceUrl}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${resourceUrl}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${resourceTitle}&body=Check out this resource: ${decodeURIComponent(resourceUrl)}`;
        break;
      default:
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank');
    }
    
    handleCloseShareMenu();
  };

  const handlePrintResource = () => {
    window.print();
    handleCloseDownloadMenu();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
      aria-labelledby="resource-details-title"
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
        <DialogTitle id="resource-details-title" sx={{ pr: 6 }}>
          {resource.title}
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        {downloading && (
          <Box sx={{ width: '100%', px: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="caption" color="text.secondary">
                Downloading {resource.title}...
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {Math.round(downloadProgress)}%
              </Typography>
            </Box>
            <LinearProgress variant="determinate" value={downloadProgress} />
          </Box>
        )}

        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box position="relative">
                <img
                  src={showPreview ? resource.previewUrl : resource.imageUrl}
                  alt={resource.title}
                  style={{ 
                    width: '100%', 
                    borderRadius: '8px',
                    maxHeight: showPreview ? '600px' : '300px',
                    objectFit: 'contain'
                  }}
                />
                {resource.previewUrl && !showPreview && (
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => setShowPreview(true)}
                    sx={{ position: 'absolute', bottom: 16, left: 16 }}
                  >
                    Show Preview
                  </Button>
                )}
                {showPreview && (
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => setShowPreview(false)}
                    sx={{ position: 'absolute', bottom: 16, left: 16 }}
                  >
                    Hide Preview
                  </Button>
                )}
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>
                {resource.subject} • {resource.gradeLevel}
              </Typography>
              
              <Box display="flex" alignItems="center" mb={1}>
                <Rating value={resource.rating || 4} precision={0.5} readOnly size="small" />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                  ({resource.rating})
                </Typography>
              </Box>

              <Typography variant="body1" paragraph>
                {resource.description}
              </Typography>

              <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                <Chip label={resource.type} color="primary" variant="outlined" size="small" />
                <Chip label={resource.fileType} size="small" />
                {resource.tags && resource.tags.map(tag => (
                  <Chip key={tag} label={tag} size="small" variant="outlined" />
                ))}
              </Box>

              <Box display="flex" alignItems="center" mb={2}>
                <Avatar sx={{ width: 32, height: 32, mr: 1 }}>
                  {resource.author.substring(0, 1)}
                </Avatar>
                <Typography variant="subtitle2">{resource.author}</Typography>
              </Box>

              <Typography variant="body2" color="text.secondary" gutterBottom>
                Added on {new Date(resource.dateAdded).toLocaleDateString()} • {resource.downloadCount} downloads
              </Typography>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between' }}>
          <Box>
            <Button 
              startIcon={resource.saved ? <BookmarkIcon /> : <BookmarkBorderIcon />}
              onClick={() => onToggleSave(resource.id)}
              color={resource.saved ? "primary" : "inherit"}
            >
              {resource.saved ? "Saved" : "Save"}
            </Button>
            <Button 
              startIcon={<CollectionsIcon />}
              onClick={() => onAddToCollection(resource.id)}
            >
              Add to Collection
            </Button>
          </Box>
          <Box>
            <Button 
              startIcon={<ShareIcon />}
              onClick={handleOpenShareMenu}
              aria-controls="share-menu"
              aria-haspopup="true"
            >
              Share
            </Button>
            <Button 
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={handleOpenDownloadMenu}
              aria-controls="download-menu"
              aria-haspopup="true"
              sx={{ ml: 1 }}
              disabled={downloading}
            >
              Download
            </Button>
          </Box>
        </DialogActions>

        {/* Share Menu */}
        <Menu
          id="share-menu"
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

        {/* Download Menu */}
        <Menu
          id="download-menu"
          anchorEl={downloadMenuAnchor}
          open={Boolean(downloadMenuAnchor)}
          onClose={handleCloseDownloadMenu}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
        >
          <MenuItem onClick={handleDownload}>
            <ListItemIcon>
              <DownloadIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={`Download ${resource.fileType} File`} />
          </MenuItem>
          {resource.previewUrl && (
            <MenuItem onClick={() => {
              window.open(resource.previewUrl, '_blank');
              handleCloseDownloadMenu();
            }}>
              <ListItemIcon>
                <OpenInNewIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Open in New Tab" />
            </MenuItem>
          )}
          <MenuItem onClick={handlePrintResource}>
            <ListItemIcon>
              <PrintIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Print Resource" />
          </MenuItem>
          {resource.fileType === 'PDF' && (
            <MenuItem onClick={() => {
              window.open(resource.url, '_blank');
              handleCloseDownloadMenu();
            }}>
              <ListItemIcon>
                <SaveIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Save PDF" />
            </MenuItem>
          )}
        </Menu>

        {/* Notification Snackbar */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={4000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </motion.div>
    </Dialog>
  );
};

export default ResourceDetails; 