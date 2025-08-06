import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  Typography,
  Divider,
  TextField,
  CircularProgress,
  IconButton,
  Box
} from '@mui/material';
import {
  Close as CloseIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { Collection, getAllCollections, addResourceToCollection } from '../services/resourceService';

interface AddToCollectionDialogProps {
  open: boolean;
  onClose: () => void;
  resourceId: number | null;
}

const AddToCollectionDialog: React.FC<AddToCollectionDialogProps> = ({
  open,
  onClose,
  resourceId
}) => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);
  const [showNewCollectionForm, setShowNewCollectionForm] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDescription, setNewCollectionDescription] = useState('');

  // Fetch collections when dialog opens
  useEffect(() => {
    if (open && resourceId) {
      fetchCollections();
    }
  }, [open, resourceId]);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      const fetchedCollections = await getAllCollections();
      setCollections(fetchedCollections);
    } catch (error) {
      console.error('Error fetching collections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (id: number) => {
    const currentIndex = selected.indexOf(id);
    const newSelected = [...selected];

    if (currentIndex === -1) {
      newSelected.push(id);
    } else {
      newSelected.splice(currentIndex, 1);
    }

    setSelected(newSelected);
  };

  const handleAddToCollections = async () => {
    if (!resourceId) return;
    
    try {
      setLoading(true);
      // Add resource to each selected collection
      for (const collectionId of selected) {
        await addResourceToCollection(collectionId, resourceId);
      }
      onClose();
    } catch (error) {
      console.error('Error adding to collections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) return;
    
    try {
      setLoading(true);
      // This would call createCollection in a real app
      // For now, we'll just add it to the local state
      const newCollection: Collection = {
        id: Math.max(...collections.map(c => c.id)) + 1,
        name: newCollectionName,
        description: newCollectionDescription,
        resourceCount: resourceId ? 1 : 0,
        resources: resourceId ? [resourceId] : [],
        dateCreated: new Date().toISOString().split('T')[0]
      };
      
      setCollections([...collections, newCollection]);
      setSelected([...selected, newCollection.id]);
      
      // Reset form
      setNewCollectionName('');
      setNewCollectionDescription('');
      setShowNewCollectionForm(false);
    } catch (error) {
      console.error('Error creating collection:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Add to Collection
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {collections.length > 0 ? (
              <List>
                {collections.map((collection) => (
                  <React.Fragment key={collection.id}>
                    <ListItem button onClick={() => handleToggle(collection.id)}>
                      <Checkbox
                        edge="start"
                        checked={selected.indexOf(collection.id) !== -1}
                        tabIndex={-1}
                        disableRipple
                      />
                      <ListItemText 
                        primary={collection.name} 
                        secondary={`${collection.resourceCount} resources • ${collection.description}`} 
                      />
                    </ListItem>
                    <Divider component="li" />
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
                You don't have any collections yet. Create your first one!
              </Typography>
            )}

            {showNewCollectionForm ? (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="subtitle1" gutterBottom>Create New Collection</Typography>
                <TextField
                  label="Collection Name"
                  variant="outlined"
                  fullWidth
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  size="small"
                  sx={{ mb: 2 }}
                />
                <TextField
                  label="Description (optional)"
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={2}
                  value={newCollectionDescription}
                  onChange={(e) => setNewCollectionDescription(e.target.value)}
                  size="small"
                />
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button 
                    onClick={() => setShowNewCollectionForm(false)}
                    sx={{ mr: 1 }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="contained" 
                    onClick={handleCreateCollection}
                    disabled={!newCollectionName.trim()}
                  >
                    Create
                  </Button>
                </Box>
              </Box>
            ) : (
              <Button
                startIcon={<AddIcon />}
                onClick={() => setShowNewCollectionForm(true)}
                fullWidth
                sx={{ mt: 2 }}
              >
                Create New Collection
              </Button>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          variant="contained" 
          onClick={handleAddToCollections} 
          disabled={selected.length === 0 || loading}
        >
          Add to Selected
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddToCollectionDialog; 