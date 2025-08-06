import React from 'react';
import {
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Switch,
  Button,
  DialogContent,
  DialogActions
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format, parseISO } from 'date-fns';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { CalendarEvent } from '../../types/calendarTypes';

interface EventFormProps {
  eventForm: Partial<CalendarEvent>;
  editingEvent: CalendarEvent | null;
  onFormChange: (field: keyof CalendarEvent, value: any) => void;
  onSave: () => void;
  onDelete: () => void;
  onClose: () => void;
}

/**
 * Component for editing or creating calendar events
 */
const EventForm: React.FC<EventFormProps> = ({
  eventForm,
  editingEvent,
  onFormChange,
  onSave,
  onDelete,
  onClose
}) => {
  return (
    <>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Event Title"
              value={eventForm.title || ''}
              onChange={(e) => onFormChange('title', e.target.value)}
              required
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <DatePicker
              label="Date"
              value={parseISO(eventForm.date || '')}
              onChange={(date) => onFormChange('date', date ? format(date, 'yyyy-MM-dd') : '')}
              slotProps={{ textField: { fullWidth: true, margin: 'normal' } }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Event Type</InputLabel>
              <Select
                value={eventForm.type || 'meeting'}
                label="Event Type"
                onChange={(e: SelectChangeEvent<string>) => 
                  onFormChange('type', e.target.value as CalendarEvent['type'])
                }
              >
                <MenuItem value="assessment">Assessment</MenuItem>
                <MenuItem value="meeting">Meeting</MenuItem>
                <MenuItem value="deadline">Deadline</MenuItem>
                <MenuItem value="lesson">Lesson</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Class / Group"
              value={eventForm.className || ''}
              onChange={(e) => onFormChange('className', e.target.value)}
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={eventForm.description || ''}
              onChange={(e) => onFormChange('description', e.target.value)}
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Location"
              value={eventForm.location || ''}
              onChange={(e) => onFormChange('location', e.target.value)}
              margin="normal"
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Start Time"
              type="time"
              value={eventForm.startTime || ''}
              onChange={(e) => onFormChange('startTime', e.target.value)}
              margin="normal"
              InputLabelProps={{ shrink: true }}
              disabled={eventForm.isAllDay}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="End Time"
              type="time"
              value={eventForm.endTime || ''}
              onChange={(e) => onFormChange('endTime', e.target.value)}
              margin="normal"
              InputLabelProps={{ shrink: true }}
              disabled={eventForm.isAllDay}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl component="fieldset" margin="normal">
              <Grid component="label" container alignItems="center" spacing={1}>
                <Grid item>All Day</Grid>
                <Grid item>
                  <Switch
                    checked={eventForm.isAllDay || false}
                    onChange={(e) => onFormChange('isAllDay', e.target.checked)}
                  />
                </Grid>
              </Grid>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl component="fieldset" margin="normal">
              <Grid component="label" container alignItems="center" spacing={1}>
                <Grid item>Reminder</Grid>
                <Grid item>
                  <Switch
                    checked={eventForm.reminder || false}
                    onChange={(e) => onFormChange('reminder', e.target.checked)}
                  />
                </Grid>
              </Grid>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions>
        {editingEvent && (
          <Button 
            startIcon={<DeleteIcon />} 
            onClick={onDelete} 
            color="error"
            sx={{ mr: 'auto' }}
          >
            Delete
          </Button>
        )}
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          variant="contained" 
          onClick={onSave}
          disabled={!eventForm.title || !eventForm.date}
        >
          {editingEvent ? 'Update' : 'Add'}
        </Button>
      </DialogActions>
    </>
  );
};

export default EventForm; 