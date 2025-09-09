const express = require('express');
const { supabase } = require('../config/supabase');
const { authenticateUser } = require('../middleware/auth');

const router = express.Router();

// Get current user profile
router.get('/me', authenticateUser, async (req, res) => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error) {
      console.error('Profile fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch user profile' });
    }

    res.json({
      id: req.user.id,
      email: req.user.email,
      ...profile
    });
  } catch (error) {
    console.error('Auth route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create or update user profile
router.post('/profile', authenticateUser, async (req, res) => {
  try {
    const { display_name, avatar_url, timezone, preferences } = req.body;

    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: req.user.id,
        email: req.user.email,
        display_name,
        avatar_url,
        timezone,
        preferences,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Profile upsert error:', error);
      return res.status(500).json({ error: 'Failed to save profile' });
    }

    res.json(data);
  } catch (error) {
    console.error('Profile creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Sign out (client-side handled, but we can add server-side cleanup if needed)
router.post('/signout', authenticateUser, async (req, res) => {
  try {
    // Supabase handles signout on the client side
    // This endpoint can be used for server-side cleanup if needed
    res.json({ message: 'Signed out successfully' });
  } catch (error) {
    console.error('Signout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

