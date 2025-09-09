const express = require('express');
const { body, validationResult } = require('express-validator');
const { supabase } = require('../config/supabase');
const { authenticateUser } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const validateTask = [
  body('title').notEmpty().withMessage('Title is required'),
  body('dueDate').isISO8601().withMessage('Valid due date is required'),
  body('priority').isIn(['low', 'medium', 'high']).withMessage('Priority must be low, medium, or high'),
];

// Get all tasks for authenticated user
router.get('/', authenticateUser, async (req, res) => {
  try {
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', req.user.id)
      .order('due_date', { ascending: true });

    if (error) {
      console.error('Tasks fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch tasks' });
    }

    // Convert date strings back to Date objects for frontend compatibility
    const formattedTasks = tasks.map(task => ({
      ...task,
      dueDate: new Date(task.due_date),
      softDeadline: task.soft_deadline ? new Date(task.soft_deadline) : null,
      startTime: task.start_time ? new Date(task.start_time) : null,
      endTime: task.end_time ? new Date(task.end_time) : null
    }));

    res.json(formattedTasks);
  } catch (error) {
    console.error('Tasks route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single task
router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const { data: task, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Task not found' });
      }
      console.error('Task fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch task' });
    }

    // Convert date strings back to Date objects
    const formattedTask = {
      ...task,
      dueDate: new Date(task.due_date),
      softDeadline: task.soft_deadline ? new Date(task.soft_deadline) : null,
      startTime: task.start_time ? new Date(task.start_time) : null,
      endTime: task.end_time ? new Date(task.end_time) : null
    };

    res.json(formattedTask);
  } catch (error) {
    console.error('Task route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new task
router.post('/', authenticateUser, validateTask, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      description,
      dueDate,
      softDeadline,
      startTime,
      endTime,
      completed,
      priority,
      category
    } = req.body;

    const { data: task, error } = await supabase
      .from('tasks')
      .insert({
        user_id: req.user.id,
        title,
        description,
        due_date: dueDate,
        soft_deadline: softDeadline,
        start_time: startTime,
        end_time: endTime,
        completed: completed || false,
        priority,
        category,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Task creation error:', error);
      return res.status(500).json({ error: 'Failed to create task' });
    }

    // Convert date strings back to Date objects
    const formattedTask = {
      ...task,
      dueDate: new Date(task.due_date),
      softDeadline: task.soft_deadline ? new Date(task.soft_deadline) : null,
      startTime: task.start_time ? new Date(task.start_time) : null,
      endTime: task.end_time ? new Date(task.end_time) : null
    };

    res.status(201).json(formattedTask);
  } catch (error) {
    console.error('Task creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update task
router.put('/:id', authenticateUser, validateTask, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      description,
      dueDate,
      softDeadline,
      startTime,
      endTime,
      completed,
      priority,
      category
    } = req.body;

    const { data: task, error } = await supabase
      .from('tasks')
      .update({
        title,
        description,
        due_date: dueDate,
        soft_deadline: softDeadline,
        start_time: startTime,
        end_time: endTime,
        completed: completed || false,
        priority,
        category,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Task not found' });
      }
      console.error('Task update error:', error);
      return res.status(500).json({ error: 'Failed to update task' });
    }

    // Convert date strings back to Date objects
    const formattedTask = {
      ...task,
      dueDate: new Date(task.due_date),
      softDeadline: task.soft_deadline ? new Date(task.soft_deadline) : null,
      startTime: task.start_time ? new Date(task.start_time) : null,
      endTime: task.end_time ? new Date(task.end_time) : null
    };

    res.json(formattedTask);
  } catch (error) {
    console.error('Task update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete task
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Task not found' });
      }
      console.error('Task deletion error:', error);
      return res.status(500).json({ error: 'Failed to delete task' });
    }

    res.json({ message: 'Task deleted successfully', id: req.params.id });
  } catch (error) {
    console.error('Task deletion error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Toggle task completion
router.patch('/:id/toggle', authenticateUser, async (req, res) => {
  try {
    const { data: task, error } = await supabase
      .from('tasks')
      .update({
        completed: req.body.completed,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Task not found' });
      }
      console.error('Task toggle error:', error);
      return res.status(500).json({ error: 'Failed to toggle task' });
    }

    // Convert date strings back to Date objects
    const formattedTask = {
      ...task,
      dueDate: new Date(task.due_date),
      softDeadline: task.soft_deadline ? new Date(task.soft_deadline) : null,
      startTime: task.start_time ? new Date(task.start_time) : null,
      endTime: task.end_time ? new Date(task.end_time) : null
    };

    res.json(formattedTask);
  } catch (error) {
    console.error('Task toggle error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

