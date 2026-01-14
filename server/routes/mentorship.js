const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { verifiedOnly, alumniOnly, studentOnly, adminOnly } =
  require('../middleware/accessControl');
const db = require('../config/database');

// @route   GET /api/mentorship
// @desc    Get all active mentorship opportunities (Students & Admin only)
router.get('/', protect, async (req, res) => {
  try {
    let query = `
      SELECT m.*, u.first_name, u.last_name, u.current_job_title, u.current_company 
      FROM mentorship m 
      JOIN users u ON m.mentor_id = u.id 
      WHERE m.status = 'active' 
      AND u.is_verified = TRUE
    `;

    // Students see all mentorships
    // Admin sees all mentorships
    // Alumni should NOT see mentorships
    if (req.user.role === 'alumni' && !req.user.is_admin) {
      return res.status(403).json({ 
        success: false, 
        message: 'Alumni cannot browse mentorships' 
      });
    }

    query += ' ORDER BY m.created_at DESC';

    const [mentorships] = await db.query(query);
    res.json({ success: true, mentorships });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/mentorship
// @desc    Create mentorship opportunity (Alumni only)
router.post('/', protect, alumniOnly, verifiedOnly, async (req, res) => {
  const { title, description, expertise_area, max_mentees } = req.body;

  try {
    const [existing] = await db.query(
      'SELECT id FROM mentorship WHERE mentor_id = ? AND status = "active"',
      [req.user.id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'You already have an active mentorship opportunity' 
      });
    }

    const [result] = await db.query(
      'INSERT INTO mentorship (mentor_id, title, description, expertise_area, max_mentees, status) VALUES (?, ?, ?, ?, ?, "active")',
      [req.user.id, title, description, expertise_area, max_mentees]
    );

    const [mentorships] = await db.query(
      `SELECT m.*, u.first_name, u.last_name 
       FROM mentorship m 
       JOIN users u ON m.mentor_id = u.id 
       WHERE m.id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Mentorship opportunity created successfully',
      mentorship: mentorships[0]
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/mentorship/my-mentorships
// @desc    Get alumni's mentorship opportunities
router.get('/my-mentorships', protect, alumniOnly, verifiedOnly, async (req, res) => {
  try {
    const [mentorships] = await db.query(
      `SELECT m.*, 
              COUNT(ma.id) as application_count,
              SUM(CASE WHEN ma.status = 'Pending' THEN 1 ELSE 0 END) as pending_count
       FROM mentorship m
       LEFT JOIN mentorship_applications ma ON m.id = ma.mentorship_id
       WHERE m.mentor_id = ?
       GROUP BY m.id
       ORDER BY m.created_at DESC`,
      [req.user.id]
    );

    res.json({ success: true, mentorships });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/mentorship/:id/applications
// @desc    Get applications for a specific mentorship (Alumni only)
router.get('/:id/applications', protect, alumniOnly, verifiedOnly, async (req, res) => {
  try {
    const [mentorships] = await db.query(
      'SELECT id FROM mentorship WHERE id = ? AND mentor_id = ?',
      [req.params.id, req.user.id]
    );

    if (mentorships.length === 0) {
      return res.status(404).json({ success: false, message: 'Mentorship not found' });
    }

    const [applications] = await db.query(
      `SELECT ma.*, 
              u.first_name, u.last_name, u.email, 
              u.graduation_year, u.department, u.profile_picture
       FROM mentorship_applications ma
       JOIN users u ON ma.mentee_id = u.id
       WHERE ma.mentorship_id = ?
       ORDER BY ma.applied_date DESC`,
      [req.params.id]
    );

    res.json({ success: true, applications });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/mentorship/applications/:id/status
// @desc    Update application status (Alumni only)
router.put('/applications/:id/status', protect, alumniOnly, verifiedOnly, async (req, res) => {
  const { status } = req.body;

  try {
    const [applications] = await db.query(
      `SELECT ma.id 
       FROM mentorship_applications ma
       JOIN mentorship m ON ma.mentorship_id = m.id
       WHERE ma.id = ? AND m.mentor_id = ?`,
      [req.params.id, req.user.id]
    );

    if (applications.length === 0) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    await db.query(
      'UPDATE mentorship_applications SET status = ? WHERE id = ?',
      [status, req.params.id]
    );

    res.json({
      success: true,
      message: `Application ${status.toLowerCase()} successfully`
    });

  } catch (error) {
    console.error('Failed to update application:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/mentorship/:id/apply
// @desc    Apply for mentorship (Students only)
router.post('/:id/apply', protect, studentOnly, verifiedOnly, async (req, res) => {
  const { application_text } = req.body;

  try {
    const [mentorships] = await db.query(
      `SELECT m.*, u.first_name, u.last_name 
       FROM mentorship m 
       JOIN users u ON m.mentor_id = u.id 
       WHERE m.id = ? AND m.status = 'active' 
       AND u.is_verified = TRUE`,
      [req.params.id]
    );

    if (mentorships.length === 0) {
      return res.status(404).json({ success: false, message: 'Mentorship not available' });
    }

    const [existing] = await db.query(
      'SELECT id FROM mentorship_applications WHERE mentorship_id = ? AND mentee_id = ?',
      [req.params.id, req.user.id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'Already applied for this mentorship' });
    }

    await db.query(
      'INSERT INTO mentorship_applications (mentorship_id, mentee_id, application_text) VALUES (?, ?, ?)',
      [req.params.id, req.user.id, application_text]
    );

    await db.query(
      'UPDATE mentorship SET current_mentees = current_mentees + 1 WHERE id = ?',
      [req.params.id]
    );

    res.json({ success: true, message: 'Applied for mentorship successfully' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/mentorship/my-applications
// @desc    Get user's mentorship applications
router.get('/my-applications', protect, verifiedOnly, async (req, res) => {
  try {
    const [applications] = await db.query(
      `SELECT ma.*, m.title, m.description, 
              mentor.first_name as mentor_first_name, mentor.last_name as mentor_last_name,
              mentor.current_job_title as mentor_job_title, mentor.current_company as mentor_company
       FROM mentorship_applications ma
       JOIN mentorship m ON ma.mentorship_id = m.id
       JOIN users mentor ON m.mentor_id = mentor.id
       WHERE ma.mentee_id = ?
       ORDER BY ma.applied_date DESC`,
      [req.user.id]
    );

    res.json({ success: true, applications });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/mentorship/:id/status
// @desc    Update mentorship status (Alumni only)
router.put('/:id/status', protect, alumniOnly, verifiedOnly, async (req, res) => {
  const { status } = req.body;

  try {
    const [mentorships] = await db.query(
      'SELECT id FROM mentorship WHERE id = ? AND mentor_id = ?',
      [req.params.id, req.user.id]
    );

    if (mentorships.length === 0) {
      return res.status(404).json({ success: false, message: 'Mentorship not found' });
    }

    await db.query(
      'UPDATE mentorship SET status = ? WHERE id = ?',
      [status, req.params.id]
    );

    res.json({
      success: true,
      message: `Mentorship ${status === 'active' ? 'activated' : 'deactivated'} successfully`
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
