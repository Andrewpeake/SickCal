const express = require('express');
const { body, validationResult } = require('express-validator');
const { supabase } = require('../config/supabase');
const { authenticateUser } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const validateProject = [
  body('name').notEmpty().withMessage('Project name is required'),
  body('status').isIn(['planning', 'active', 'on-hold', 'completed', 'cancelled']).withMessage('Invalid status'),
  body('priority').isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),
];

// Get all projects for authenticated user
router.get('/', authenticateUser, async (req, res) => {
  try {
    const { data: projects, error } = await supabase
      .from('projects')
      .select(`
        *,
        project_tasks (*),
        project_milestones (*)
      `)
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Projects fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch projects' });
    }

    // Format projects with nested data
    const formattedProjects = projects.map(project => ({
      ...project,
      startDate: new Date(project.start_date),
      tasks: project.project_tasks.map(task => ({
        ...task,
        createdAt: new Date(task.created_at),
        updatedAt: new Date(task.updated_at)
      })),
      milestones: project.project_milestones.map(milestone => ({
        ...milestone,
        dueDate: new Date(milestone.due_date)
      }))
    }));

    // Remove database-specific fields
    formattedProjects.forEach(project => {
      delete project.user_id;
      delete project.created_at;
      delete project.updated_at;
      delete project.start_date;
      delete project.project_tasks;
      delete project.project_milestones;
    });

    res.json(formattedProjects);
  } catch (error) {
    console.error('Projects route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single project
router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const { data: project, error } = await supabase
      .from('projects')
      .select(`
        *,
        project_tasks (*),
        project_milestones (*)
      `)
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Project not found' });
      }
      console.error('Project fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch project' });
    }

    // Format project with nested data
    const formattedProject = {
      ...project,
      startDate: new Date(project.start_date),
      tasks: project.project_tasks.map(task => ({
        ...task,
        createdAt: new Date(task.created_at),
        updatedAt: new Date(task.updated_at)
      })),
      milestones: project.project_milestones.map(milestone => ({
        ...milestone,
        dueDate: new Date(milestone.due_date)
      }))
    };

    // Remove database-specific fields
    delete formattedProject.user_id;
    delete formattedProject.created_at;
    delete formattedProject.updated_at;
    delete formattedProject.start_date;
    delete formattedProject.project_tasks;
    delete formattedProject.project_milestones;

    res.json(formattedProject);
  } catch (error) {
    console.error('Project route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new project
router.post('/', authenticateUser, validateProject, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      description,
      status,
      priority,
      startDate,
      members,
      tasks,
      milestones,
      tags
    } = req.body;

    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        user_id: req.user.id,
        name,
        description,
        status,
        priority,
        start_date: startDate,
        members: members || [],
        tags: tags || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Project creation error:', error);
      return res.status(500).json({ error: 'Failed to create project' });
    }

    // Add tasks if provided
    if (tasks && tasks.length > 0) {
      const tasksToInsert = tasks.map(task => ({
        project_id: project.id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dependencies: task.dependencies || [],
        tags: task.tags || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      const { error: tasksError } = await supabase
        .from('project_tasks')
        .insert(tasksToInsert);

      if (tasksError) {
        console.error('Project tasks creation error:', tasksError);
      }
    }

    // Add milestones if provided
    if (milestones && milestones.length > 0) {
      const milestonesToInsert = milestones.map(milestone => ({
        project_id: project.id,
        title: milestone.title,
        description: milestone.description,
        due_date: milestone.dueDate,
        completed: milestone.completed || false,
        tasks: milestone.tasks || []
      }));

      const { error: milestonesError } = await supabase
        .from('project_milestones')
        .insert(milestonesToInsert);

      if (milestonesError) {
        console.error('Project milestones creation error:', milestonesError);
      }
    }

    // Fetch the complete project with nested data
    const { data: completeProject, error: fetchError } = await supabase
      .from('projects')
      .select(`
        *,
        project_tasks (*),
        project_milestones (*)
      `)
      .eq('id', project.id)
      .single();

    if (fetchError) {
      console.error('Project fetch after creation error:', fetchError);
      return res.status(500).json({ error: 'Failed to fetch created project' });
    }

    // Format response
    const formattedProject = {
      ...completeProject,
      startDate: new Date(completeProject.start_date),
      tasks: completeProject.project_tasks.map(task => ({
        ...task,
        createdAt: new Date(task.created_at),
        updatedAt: new Date(task.updated_at)
      })),
      milestones: completeProject.project_milestones.map(milestone => ({
        ...milestone,
        dueDate: new Date(milestone.due_date)
      }))
    };

    // Remove database-specific fields
    delete formattedProject.user_id;
    delete formattedProject.created_at;
    delete formattedProject.updated_at;
    delete formattedProject.start_date;
    delete formattedProject.project_tasks;
    delete formattedProject.project_milestones;

    res.status(201).json(formattedProject);
  } catch (error) {
    console.error('Project creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update project
router.put('/:id', authenticateUser, validateProject, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      description,
      status,
      priority,
      startDate,
      members,
      tags
    } = req.body;

    const { data: project, error } = await supabase
      .from('projects')
      .update({
        name,
        description,
        status,
        priority,
        start_date: startDate,
        members: members || [],
        tags: tags || [],
        updated_at: new Date().toISOString()
      })
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Project not found' });
      }
      console.error('Project update error:', error);
      return res.status(500).json({ error: 'Failed to update project' });
    }

    // Fetch the complete project with nested data
    const { data: completeProject, error: fetchError } = await supabase
      .from('projects')
      .select(`
        *,
        project_tasks (*),
        project_milestones (*)
      `)
      .eq('id', project.id)
      .single();

    if (fetchError) {
      console.error('Project fetch after update error:', fetchError);
      return res.status(500).json({ error: 'Failed to fetch updated project' });
    }

    // Format response
    const formattedProject = {
      ...completeProject,
      startDate: new Date(completeProject.start_date),
      tasks: completeProject.project_tasks.map(task => ({
        ...task,
        createdAt: new Date(task.created_at),
        updatedAt: new Date(task.updated_at)
      })),
      milestones: completeProject.project_milestones.map(milestone => ({
        ...milestone,
        dueDate: new Date(milestone.due_date)
      }))
    };

    // Remove database-specific fields
    delete formattedProject.user_id;
    delete formattedProject.created_at;
    delete formattedProject.updated_at;
    delete formattedProject.start_date;
    delete formattedProject.project_tasks;
    delete formattedProject.project_milestones;

    res.json(formattedProject);
  } catch (error) {
    console.error('Project update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete project
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    // Delete related tasks and milestones first
    await supabase
      .from('project_tasks')
      .delete()
      .eq('project_id', req.params.id);

    await supabase
      .from('project_milestones')
      .delete()
      .eq('project_id', req.params.id);

    // Delete the project
    const { data, error } = await supabase
      .from('projects')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Project not found' });
      }
      console.error('Project deletion error:', error);
      return res.status(500).json({ error: 'Failed to delete project' });
    }

    res.json({ message: 'Project deleted successfully', id: req.params.id });
  } catch (error) {
    console.error('Project deletion error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

