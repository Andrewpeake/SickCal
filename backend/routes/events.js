const express = require('express');
const { body, validationResult } = require('express-validator');
const { supabase } = require('../config/supabase');
const { authenticateUser } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const validateEvent = [
  body('title').notEmpty().withMessage('Title is required'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required'),
  body('color').isHexColor().withMessage('Valid color is required'),
];

// Get all events for authenticated user
router.get('/', authenticateUser, async (req, res) => {
  try {
    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .eq('user_id', req.user.id)
      .order('start_date', { ascending: true });

    if (error) {
      console.error('Events fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch events' });
    }

    // Convert date strings back to Date objects for frontend compatibility
    const formattedEvents = events.map(event => ({
      ...event,
      startDate: new Date(event.start_date),
      endDate: new Date(event.end_date),
      repeat: event.repeat_pattern ? JSON.parse(event.repeat_pattern) : null
    }));

    res.json(formattedEvents);
  } catch (error) {
    console.error('Events route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single event
router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const { data: event, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Event not found' });
      }
      console.error('Event fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch event' });
    }

    // Convert date strings back to Date objects
    const formattedEvent = {
      ...event,
      startDate: new Date(event.start_date),
      endDate: new Date(event.end_date),
      repeat: event.repeat_pattern ? JSON.parse(event.repeat_pattern) : null
    };

    res.json(formattedEvent);
  } catch (error) {
    console.error('Event route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new event
router.post('/', authenticateUser, validateEvent, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      description,
      startDate,
      endDate,
      color,
      isAllDay,
      isAllWeek,
      location,
      attendees,
      category,
      repeat
    } = req.body;

    const { data: event, error } = await supabase
      .from('events')
      .insert({
        user_id: req.user.id,
        title,
        description,
        start_date: startDate,
        end_date: endDate,
        color,
        is_all_day: isAllDay || false,
        is_all_week: isAllWeek || false,
        location,
        attendees: attendees || [],
        category,
        repeat_pattern: repeat ? JSON.stringify(repeat) : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Event creation error:', error);
      return res.status(500).json({ error: 'Failed to create event' });
    }

    // Convert date strings back to Date objects
    const formattedEvent = {
      ...event,
      startDate: new Date(event.start_date),
      endDate: new Date(event.end_date),
      repeat: event.repeat_pattern ? JSON.parse(event.repeat_pattern) : null
    };

    res.status(201).json(formattedEvent);
  } catch (error) {
    console.error('Event creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update event
router.put('/:id', authenticateUser, validateEvent, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      description,
      startDate,
      endDate,
      color,
      isAllDay,
      isAllWeek,
      location,
      attendees,
      category,
      repeat
    } = req.body;

    const { data: event, error } = await supabase
      .from('events')
      .update({
        title,
        description,
        start_date: startDate,
        end_date: endDate,
        color,
        is_all_day: isAllDay || false,
        is_all_week: isAllWeek || false,
        location,
        attendees: attendees || [],
        category,
        repeat_pattern: repeat ? JSON.stringify(repeat) : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Event not found' });
      }
      console.error('Event update error:', error);
      return res.status(500).json({ error: 'Failed to update event' });
    }

    // Convert date strings back to Date objects
    const formattedEvent = {
      ...event,
      startDate: new Date(event.start_date),
      endDate: new Date(event.end_date),
      repeat: event.repeat_pattern ? JSON.parse(event.repeat_pattern) : null
    };

    res.json(formattedEvent);
  } catch (error) {
    console.error('Event update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete event
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('events')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Event not found' });
      }
      console.error('Event deletion error:', error);
      return res.status(500).json({ error: 'Failed to delete event' });
    }

    res.json({ message: 'Event deleted successfully', id: req.params.id });
  } catch (error) {
    console.error('Event deletion error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

