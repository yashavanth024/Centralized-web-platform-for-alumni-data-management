const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Auth & access control
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/accessControl');

/* ======================================================
   USER VERIFICATION & MANAGEMENT
====================================================== */

// Get users pending verification
router.get('/users/pending', protect, adminOnly, async (req, res) => {
  try {
    const [users] = await db.query(
      `SELECT id, email, first_name, last_name, usn_number, role,
              graduation_year, degree, department, id_card_url,
              created_at
       FROM users
       WHERE is_verified = FALSE
         AND role != 'admin'
       ORDER BY created_at DESC`
    );

    res.json({ success: true, users });
  } catch (error) {
    console.error('Pending users error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Verify user
router.put('/users/:id/verify', protect, adminOnly, async (req, res) => {
  try {
    const [result] = await db.query(
      `UPDATE users
       SET is_verified = TRUE
       WHERE id = ? AND role != 'admin'`,
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found or already verified'
      });
    }

    await db.query(
      `INSERT INTO user_verifications (user_id, admin_id, action)
       VALUES (?, ?, 'approved')`,
      [req.params.id, req.user.id]
    );

    res.json({ success: true, message: 'User verified successfully' });
  } catch (error) {
    console.error('Verify user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Reject & delete user
router.delete('/users/:id', protect, adminOnly, async (req, res) => {
  const { reason } = req.body;

  try {
    const [users] = await db.query(
      'SELECT email FROM users WHERE id = ? AND role != "admin"',
      [req.params.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await db.query(
      `INSERT INTO user_verifications (user_id, admin_id, action, reason)
       VALUES (?, ?, 'rejected', ?)`,

      [req.params.id, req.user.id, reason || 'Rejected by admin']
    );

    await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);

    res.json({
      success: true,
      message: 'User rejected and deleted',
      email: users[0].email
    });
  } catch (error) {
    console.error('Reject user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Permanently delete user
router.delete('/users/:id/permanent', protect, adminOnly, async (req, res) => {
  const { reason } = req.body;

  try {
    const [users] = await db.query(
      'SELECT id FROM users WHERE id = ? AND role != "admin"',
      [req.params.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found or cannot delete admin'
      });
    }

    await db.query(
      `INSERT INTO user_verifications (user_id, admin_id, action, reason)
       VALUES (?, ?, 'deleted', ?)`,

      [req.params.id, req.user.id, reason || 'Admin deleted user']
    );

    await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);

    res.json({ success: true, message: 'User permanently deleted' });
  } catch (error) {
    console.error('Permanent delete error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/* ======================================================
   EVENTS MANAGEMENT
====================================================== */

router.put('/events/:id', protect, adminOnly, async (req, res) => {
  try {
    const [result] = await db.query(
      `UPDATE events
       SET ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [req.body, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    res.json({ success: true, message: 'Event updated successfully' });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.delete('/events/:id', protect, adminOnly, async (req, res) => {
  try {
    await db.query('DELETE FROM events WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ✅ Get event registrations (Admin only)
router.get('/events/:id/registrations', protect, adminOnly, async (req, res) => {
  try {
    const [registrations] = await db.query(
      `SELECT er.*, 
              u.first_name, u.last_name, u.email,
              u.role, u.usn_number, u.department, u.graduation_year
       FROM event_registrations er
       JOIN users u ON er.user_id = u.id
       WHERE er.event_id = ?
       ORDER BY er.registration_date DESC`,
      [req.params.id]
    );

    res.json({ success: true, registrations });
  } catch (error) {
    console.error('Event registrations error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/* ======================================================
   JOB MANAGEMENT
====================================================== */

router.get('/jobs', protect, adminOnly, async (req, res) => {
  try {
    const [jobs] = await db.query(
      `SELECT j.*, 
              u.first_name AS posted_by_name,
              u.last_name AS posted_by_last_name,
              u.email AS posted_by_email,
              u.role AS posted_by_role
       FROM job_postings j
       LEFT JOIN users u ON j.posted_by = u.id
       ORDER BY j.created_at DESC`
    );

    res.json({ success: true, jobs });
  } catch (error) {
    console.error('Failed to fetch jobs:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/jobs/:id', protect, adminOnly, async (req, res) => {
  try {
    const [result] = await db.query(
      `UPDATE job_postings
       SET ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [req.body, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    res.json({ success: true, message: 'Job updated successfully' });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.delete('/jobs/:id', protect, adminOnly, async (req, res) => {
  try {
    await db.query(
      `UPDATE job_postings
       SET deleted_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [req.params.id]
    );

    res.json({ success: true, message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/jobs/:id/applications', protect, adminOnly, async (req, res) => {
  try {
    const [applications] = await db.query(
      `
      SELECT ja.*, 
             u.first_name, 
             u.last_name, 
             u.email, 
             u.profile_picture,
             u.graduation_year, 
             u.department,
             u.current_job_title, 
             u.current_company
      FROM job_applications ja
      JOIN users u ON ja.applicant_id = u.id
      WHERE ja.job_id = ?
        AND u.is_verified = TRUE
      ORDER BY ja.applied_date DESC
      `,
      [req.params.id]
    );

    res.json({
      success: true,
      applications
    });

  } catch (error) {
    console.error('Failed to fetch applications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load applications'
    });
  }
});

router.delete('/jobs/:id/permanent', protect, adminOnly, async (req, res) => {
  try {
    await db.query('DELETE FROM job_postings WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Job permanently deleted successfully' });
  } catch (error) {
    console.error('Failed to delete job:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/* ======================================================
   DONATIONS
====================================================== */

router.get('/donations', protect, adminOnly, async (req, res) => {
  try {
    const [donations] = await db.query(
      `SELECT d.*, 
              CASE 
                WHEN d.is_anonymous THEN 'Anonymous'
                ELSE CONCAT(u.first_name, ' ', u.last_name)
              END AS donor_name
       FROM donations d
       LEFT JOIN users u ON d.donor_id = u.id
       ORDER BY d.donation_date DESC`
    );

    res.json({ success: true, donations });
  } catch (error) {
    console.error('Admin donations error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/* ======================================================
   MENTORSHIPS (ADMIN VIEW)
====================================================== */

router.get('/mentorships', protect, adminOnly, async (req, res) => {
  try {
    const [mentorships] = await db.query(
      `SELECT m.*, u.first_name, u.last_name,
              COUNT(ma.id) AS application_count
       FROM mentorship m
       JOIN users u ON m.mentor_id = u.id
       LEFT JOIN mentorship_applications ma
         ON m.id = ma.mentorship_id
       GROUP BY m.id
       ORDER BY m.created_at DESC`
    );

    res.json({ success: true, mentorships });
  } catch (error) {
    console.error('Admin mentorship error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
