const express = require('express');
const router = express.Router();

// AUTH middleware (JWT)
const { protect } = require('../middleware/auth');

// ROLE / ACCESS middleware
const {
  verifiedOnly,
  alumniOnly,
  studentOnly,
  adminOnly
} = require('../middleware/accessControl');

const db = require('../config/database');

/**
 * @route   GET /api/jobs
 * @desc    Get all active job postings (Students & Admin)
 *          Alumni are redirected on frontend to /jobs/my
 */
router.get('/', protect, async (req, res) => {
  try {
    let query = `
      SELECT j.*, 
             CONCAT(u.first_name, ' ', u.last_name) AS posted_by_name
      FROM job_postings j
      LEFT JOIN users u ON j.posted_by = u.id
      WHERE j.is_active = TRUE
        AND j.deleted_at IS NULL
      ORDER BY j.created_at DESC
    `;

    const [jobs] = await db.query(query);
    res.json({ success: true, jobs });

  } catch (error) {
    console.error('GET /jobs error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   GET /api/jobs/my
 * @desc    Get jobs posted by logged-in alumni/admin
 */
router.get('/my', protect, verifiedOnly, async (req, res) => {
  if (req.user.role !== 'alumni' && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Only alumni or admin can access this'
    });
  }

  try {
    const [jobs] = await db.query(
      `SELECT *
       FROM job_postings
       WHERE posted_by = ?
         AND deleted_at IS NULL
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    res.json({ success: true, jobs });

  } catch (error) {
    console.error('GET /jobs/my error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   POST /api/jobs
 * @desc    Create job (Alumni & Admin only)
 */
router.post('/', protect, verifiedOnly, async (req, res) => {
  if (req.user.role !== 'alumni' && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Only alumni or admin can post jobs'
    });
  }

  const {
    company_name,
    job_title,
    job_description,
    requirements,
    location,
    job_type,
    salary_range,
    application_deadline
  } = req.body;

  try {
    const [result] = await db.query(
      `INSERT INTO job_postings
       (posted_by, company_name, job_title, job_description,
        requirements, location, job_type, salary_range,
        application_deadline, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
      [
        req.user.id,
        company_name,
        job_title,
        job_description,
        requirements,
        location,
        job_type,
        salary_range,
        application_deadline
      ]
    );

    const [[job]] = await db.query(
      'SELECT * FROM job_postings WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Job posted successfully',
      job
    });

  } catch (error) {
    console.error('POST /jobs error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   PUT /api/jobs/:id
 * @desc    Update job (Owner or Admin)
 */
router.put('/:id', protect, verifiedOnly, async (req, res) => {
  try {
    const [[job]] = await db.query(
      `SELECT posted_by
       FROM job_postings
       WHERE id = ?
         AND deleted_at IS NULL`,
      [req.params.id]
    );

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (job.posted_by !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await db.query(
      `UPDATE job_postings
       SET company_name = ?, job_title = ?, job_description = ?,
           requirements = ?, location = ?, job_type = ?,
           salary_range = ?, application_deadline = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        req.body.company_name,
        req.body.job_title,
        req.body.job_description,
        req.body.requirements,
        req.body.location,
        req.body.job_type,
        req.body.salary_range,
        req.body.application_deadline,
        req.params.id
      ]
    );

    res.json({ success: true, message: 'Job updated successfully' });

  } catch (error) {
    console.error('PUT /jobs/:id error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   DELETE /api/jobs/:id
 * @desc    Soft delete job (Owner or Admin)
 */
router.delete('/:id', protect, verifiedOnly, async (req, res) => {
  try {
    const [[job]] = await db.query(
      `SELECT posted_by
       FROM job_postings
       WHERE id = ?
         AND deleted_at IS NULL`,
      [req.params.id]
    );

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (job.posted_by !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await db.query(
      `UPDATE job_postings
       SET deleted_at = CURRENT_TIMESTAMP, is_active = FALSE
       WHERE id = ?`,
      [req.params.id]
    );

    res.json({ success: true, message: 'Job deleted successfully' });

  } catch (error) {
    console.error('DELETE /jobs/:id error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   POST /api/jobs/:id/apply
 * @desc    Apply for a job (Students only)
 */
router.post('/:id/apply', protect, studentOnly, verifiedOnly, async (req, res) => {
  try {
    const [[job]] = await db.query(
      `SELECT id
       FROM job_postings
       WHERE id = ?
         AND is_active = TRUE
         AND deleted_at IS NULL`,
      [req.params.id]
    );

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not available' });
    }

    const [[existing]] = await db.query(
      `SELECT id
       FROM job_applications
       WHERE job_id = ? AND applicant_id = ?`,
      [req.params.id, req.user.id]
    );

    if (existing) {
      return res.status(400).json({ success: false, message: 'Already applied' });
    }

    await db.query(
      `INSERT INTO job_applications
       (job_id, applicant_id, cover_letter, resume_url)
       VALUES (?, ?, ?, ?)`,
      [req.params.id, req.user.id, req.body.cover_letter, req.body.resume_url]
    );

    res.json({ success: true, message: 'Application submitted' });

  } catch (error) {
    console.error('POST /jobs/:id/apply error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   GET /api/jobs/user/applications
 * @desc    Get logged-in user's job applications
 */
router.get('/user/applications', protect, verifiedOnly, async (req, res) => {
  try {
    const [applications] = await db.query(
      `SELECT ja.*, j.job_title, j.company_name
       FROM job_applications ja
       JOIN job_postings j ON ja.job_id = j.id
       WHERE ja.applicant_id = ?
         AND j.deleted_at IS NULL
       ORDER BY ja.applied_date DESC`,
      [req.user.id]
    );

    res.json({ success: true, applications });

  } catch (error) {
    console.error('GET /jobs/user/applications error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
