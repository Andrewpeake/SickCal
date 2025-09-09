const express = require('express');
const { supabase } = require('../config/supabase');
const { authenticateUser } = require('../middleware/auth');

const router = express.Router();

// Get user settings
router.get('/', authenticateUser, async (req, res) => {
  try {
    const { data: settings, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', req.user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No settings found, return default settings
        const defaultSettings = {
          theme: 'light',
          primaryColor: '#0ea5e9',
          hourHeight: 60,
          gridLineOpacity: 0.3,
          showWeekNumbers: false,
          showTodayHighlight: true,
          showLiveTimeIndicator: true,
          defaultView: 'week',
          defaultStartHour: 6,
          defaultEndHour: 22,
          weekStartsOn: 1,
          showWeekend: true,
          defaultEventDuration: 60,
          allowEventOverlap: true,
          showEventCount: true,
          eventColorScheme: 'category',
          quickEventTitles: [],
          enableDragAndDrop: true,
          enableDoubleRightClickDelete: true,
          enableKeyboardShortcuts: true,
          enableZoomScroll: true,
          enableNotifications: true,
          reminderTime: 15,
          soundNotifications: false,
          autoSave: true,
          backupFrequency: 'daily',
          exportFormat: 'json',
          timeFormat: '12h',
          dateFormat: 'MM/DD/YYYY',
          language: 'en',
          timezone: 'UTC'
        };
        return res.json(defaultSettings);
      }
      console.error('Settings fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch settings' });
    }

    // Parse JSON fields
    const formattedSettings = {
      ...settings,
      quickEventTitles: settings.quick_event_titles ? JSON.parse(settings.quick_event_titles) : []
    };

    // Remove database-specific fields
    delete formattedSettings.user_id;
    delete formattedSettings.created_at;
    delete formattedSettings.updated_at;
    delete formattedSettings.quick_event_titles;

    res.json(formattedSettings);
  } catch (error) {
    console.error('Settings route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user settings
router.put('/', authenticateUser, async (req, res) => {
  try {
    const settings = req.body;

    // Validate required fields
    if (!settings.theme || !settings.primaryColor) {
      return res.status(400).json({ error: 'Missing required settings fields' });
    }

    const { data: updatedSettings, error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: req.user.id,
        theme: settings.theme,
        primary_color: settings.primaryColor,
        hour_height: settings.hourHeight,
        grid_line_opacity: settings.gridLineOpacity,
        show_week_numbers: settings.showWeekNumbers,
        show_today_highlight: settings.showTodayHighlight,
        show_live_time_indicator: settings.showLiveTimeIndicator,
        default_view: settings.defaultView,
        default_start_hour: settings.defaultStartHour,
        default_end_hour: settings.defaultEndHour,
        week_starts_on: settings.weekStartsOn,
        show_weekend: settings.showWeekend,
        default_event_duration: settings.defaultEventDuration,
        allow_event_overlap: settings.allowEventOverlap,
        show_event_count: settings.showEventCount,
        event_color_scheme: settings.eventColorScheme,
        quick_event_titles: JSON.stringify(settings.quickEventTitles || []),
        enable_drag_and_drop: settings.enableDragAndDrop,
        enable_double_right_click_delete: settings.enableDoubleRightClickDelete,
        enable_keyboard_shortcuts: settings.enableKeyboardShortcuts,
        enable_zoom_scroll: settings.enableZoomScroll,
        enable_notifications: settings.enableNotifications,
        reminder_time: settings.reminderTime,
        sound_notifications: settings.soundNotifications,
        auto_save: settings.autoSave,
        backup_frequency: settings.backupFrequency,
        export_format: settings.exportFormat,
        time_format: settings.timeFormat,
        date_format: settings.dateFormat,
        language: settings.language,
        timezone: settings.timezone,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Settings update error:', error);
      return res.status(500).json({ error: 'Failed to update settings' });
    }

    // Format response
    const formattedSettings = {
      ...updatedSettings,
      quickEventTitles: updatedSettings.quick_event_titles ? JSON.parse(updatedSettings.quick_event_titles) : []
    };

    // Remove database-specific fields
    delete formattedSettings.user_id;
    delete formattedSettings.created_at;
    delete formattedSettings.updated_at;
    delete formattedSettings.quick_event_titles;

    res.json(formattedSettings);
  } catch (error) {
    console.error('Settings update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reset settings to defaults
router.post('/reset', authenticateUser, async (req, res) => {
  try {
    const defaultSettings = {
      theme: 'light',
      primaryColor: '#0ea5e9',
      hourHeight: 60,
      gridLineOpacity: 0.3,
      showWeekNumbers: false,
      showTodayHighlight: true,
      showLiveTimeIndicator: true,
      defaultView: 'week',
      defaultStartHour: 6,
      defaultEndHour: 22,
      weekStartsOn: 1,
      showWeekend: true,
      defaultEventDuration: 60,
      allowEventOverlap: true,
      showEventCount: true,
      eventColorScheme: 'category',
      quickEventTitles: [],
      enableDragAndDrop: true,
      enableDoubleRightClickDelete: true,
      enableKeyboardShortcuts: true,
      enableZoomScroll: true,
      enableNotifications: true,
      reminderTime: 15,
      soundNotifications: false,
      autoSave: true,
      backupFrequency: 'daily',
      exportFormat: 'json',
      timeFormat: '12h',
      dateFormat: 'MM/DD/YYYY',
      language: 'en',
      timezone: 'UTC'
    };

    const { data: updatedSettings, error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: req.user.id,
        theme: defaultSettings.theme,
        primary_color: defaultSettings.primaryColor,
        hour_height: defaultSettings.hourHeight,
        grid_line_opacity: defaultSettings.gridLineOpacity,
        show_week_numbers: defaultSettings.showWeekNumbers,
        show_today_highlight: defaultSettings.showTodayHighlight,
        show_live_time_indicator: defaultSettings.showLiveTimeIndicator,
        default_view: defaultSettings.defaultView,
        default_start_hour: defaultSettings.defaultStartHour,
        default_end_hour: defaultSettings.defaultEndHour,
        week_starts_on: defaultSettings.weekStartsOn,
        show_weekend: defaultSettings.showWeekend,
        default_event_duration: defaultSettings.defaultEventDuration,
        allow_event_overlap: defaultSettings.allowEventOverlap,
        show_event_count: defaultSettings.showEventCount,
        event_color_scheme: defaultSettings.eventColorScheme,
        quick_event_titles: JSON.stringify(defaultSettings.quickEventTitles),
        enable_drag_and_drop: defaultSettings.enableDragAndDrop,
        enable_double_right_click_delete: defaultSettings.enableDoubleRightClickDelete,
        enable_keyboard_shortcuts: defaultSettings.enableKeyboardShortcuts,
        enable_zoom_scroll: defaultSettings.enableZoomScroll,
        enable_notifications: defaultSettings.enableNotifications,
        reminder_time: defaultSettings.reminderTime,
        sound_notifications: defaultSettings.soundNotifications,
        auto_save: defaultSettings.autoSave,
        backup_frequency: defaultSettings.backupFrequency,
        export_format: defaultSettings.exportFormat,
        time_format: defaultSettings.timeFormat,
        date_format: defaultSettings.dateFormat,
        language: defaultSettings.language,
        timezone: defaultSettings.timezone,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Settings reset error:', error);
      return res.status(500).json({ error: 'Failed to reset settings' });
    }

    res.json(defaultSettings);
  } catch (error) {
    console.error('Settings reset error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

