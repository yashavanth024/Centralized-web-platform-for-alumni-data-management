const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const db = require('../config/database');
const { body, validationResult } = require('express-validator');
const { adminOnly, verifiedOnly } = require('../middleware/accessControl');

/* ======================================================
   GET /api/events
   Get all events
====================================================== */
router.get('/', async (req, res) => {
  try {
    const { type, upcoming } = req.query;

    let query = `
      SELECT e.*, u.first_name, u.last_name
      FROM events e
      LEFT JOIN users u ON e.organizer_id = u.id
      WHERE e.deleted_at IS NULL
    `;
    const params = [];

    if (type) {
      query += ' AND e.event_type = ?';
      params.push(type);
    }

    if (upcoming === 'true') {
      query += ' AND e.event_date >= CURDATE()';
    }

    query += ' ORDER BY e.event_date ASC';

    const [events] = await db.query(query, params);
    res.json({ success: true, events });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/* ======================================================
   GET /api/events/user/registered
   Get events registered by current user
   (MUST be before /:id)
====================================================== */
router.get('/user/registered', protect, verifiedOnly, async (req, res) => {
  try {
    const [events] = await db.query(
      `SELECT e.*, r.registration_date, r.attendance_status
       FROM events e
       JOIN event_registrations r ON e.id = r.event_id
       WHERE r.user_id = ?
       AND e.deleted_at IS NULL
       ORDER BY e.event_date DESC`,
      [req.user.id]
    );

    res.json({ success: true, events });

  } catch (error) {
    console.error('Failed to fetch user events:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/* ======================================================
   GET /api/events/:id
   Get event by ID
====================================================== */
router.get('/:id', async (req, res) => {
  try {
    const [events] = await db.query(
      `SELECT e.*, u.first_name, u.last_name, u.email
       FROM events e
       LEFT JOIN users u ON e.organizer_id = u.id
       WHERE e.id = ?
       AND e.deleted_at IS NULL`,
      [req.params.id]
    );

    if (events.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const [registrations] = await db.query(
      `SELECT r.*, u.first_name, u.last_name, u.profile_picture
       FROM event_registrations r
       JOIN users u ON r.user_id = u.id
       WHERE r.event_id = ?`,
      [req.params.id]
    );

    res.json({
      success: true,
      event: events[0],
      registrations
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/* ======================================================
   POST /api/events
   Create event (admin only)
====================================================== */
router.post(
  '/',
  protect,
  adminOnly,
  [
    body('title').notEmpty(),
    body('description').notEmpty(),
    body('event_date').isDate(),
    body('location').notEmpty()
  ],
  async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const {
      title,
      description,
      event_date,
      event_time,
      location,
      event_type,
      max_attendees,
      image_url,
      registration_deadline
    } = req.body;

    try {
      const [result] = await db.query(
        `INSERT INTO events
         (title, description, event_date, event_time, location, event_type,
          max_attendees, organizer_id, image_url, registration_deadline)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          title,
          description,
          event_date,
          event_time,
          location,
          event_type,
          max_attendees,
          req.user.id,
          image_url,
          registration_deadline
        ]
      );

      const [events] = await db.query(
        'SELECT * FROM events WHERE id = ?',
        [result.insertId]
      );

      res.status(201).json({
        success: true,
        message: 'Event created successfully',
        event: events[0]
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

/* ======================================================
   POST /api/events/:id/register
   Register for event
====================================================== */
router.post('/:id/register', protect, verifiedOnly, async (req, res) => {
  try {
    const [events] = await db.query(
      `SELECT * FROM events
       WHERE id = ?
       AND deleted_at IS NULL
       AND (max_attendees IS NULL OR current_attendees < max_attendees)`,
      [req.params.id]
    );

    if (events.length === 0) {
      return res.status(400).json({ success: false, message: 'Event not found or full' });
    }

    const [existingReg] = await db.query(
      'SELECT id FROM event_registrations WHERE event_id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (existingReg.length > 0) {
      return res.status(400).json({ success: false, message: 'Already registered for this event' });
    }

    await db.query(
      'INSERT INTO event_registrations (event_id, user_id) VALUES (?, ?)',
      [req.params.id, req.user.id]
    );

    await db.query(
      'UPDATE events SET current_attendees = current_attendees + 1 WHERE id = ?',
      [req.params.id]
    );

    res.json({
      success: true,
      message: 'Registered for event successfully'
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
