const express = require('express');
const router = express.Router();

// ✅ FIXED IMPORTS
const { protect } = require('../middleware/auth');
const { verifiedOnly } = require('../middleware/accessControl');

const db = require('../config/database');

// ==============================
// CREATE DONATION
// ==============================
// @route   POST /api/donations
// @desc    Create donation (verified users only)
router.post('/', protect, verifiedOnly, async (req, res) => {
  const { amount, donation_type, message, is_anonymous } = req.body;

  try {
    const donationAmount = parseFloat(amount);
    if (isNaN(donationAmount) || donationAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid donation amount'
      });
    }

    const [result] = await db.query(
      `INSERT INTO donations 
       (donor_id, amount, donation_type, message, is_anonymous, payment_status) 
       VALUES (?, ?, ?, ?, ?, 'Completed')`,
      [req.user.id, donationAmount, donation_type, message, is_anonymous]
    );

    res.status(201).json({
      success: true,
      message: 'Thank you for your donation!',
      donationId: result.insertId,
      amount: donationAmount
    });

  } catch (error) {
    console.error('Donation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// ==============================
// DONATION STATS (ADMIN / PUBLIC)
// ==============================
// @route   GET /api/donations/stats
router.get('/stats', async (req, res) => {
  try {
    const [[{ total_amount }]] = await db.query(
      `SELECT COALESCE(SUM(amount), 0) AS total_amount
       FROM donations
       WHERE payment_status = 'Completed'`
    );

    const [[{ donation_count }]] = await db.query(
      `SELECT COUNT(*) AS donation_count
       FROM donations
       WHERE payment_status = 'Completed'`
    );

    const [recent] = await db.query(
      `SELECT d.*,
              CASE 
                WHEN d.is_anonymous THEN 'Anonymous'
                ELSE CONCAT(u.first_name, ' ', u.last_name)
              END AS donor_name,
              u.email AS donor_email
       FROM donations d
       LEFT JOIN users u ON d.donor_id = u.id
       WHERE d.payment_status = 'Completed'
       ORDER BY d.donation_date DESC
       LIMIT 10`
    );

    res.json({
      success: true,
      stats: {
        total_amount: Number(total_amount),
        donation_count: Number(donation_count),
        recent_donations: recent
      }
    });

  } catch (error) {
    console.error('Donation stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load donation statistics'
    });
  }
});

// ==============================
// USER DONATION HISTORY
// ==============================
// @route   GET /api/donations/user
router.get('/user', protect, verifiedOnly, async (req, res) => {
  try {
    const [donations] = await db.query(
      `SELECT *
       FROM donations
       WHERE donor_id = ?
       ORDER BY donation_date DESC`,
      [req.user.id]
    );

    res.json({
      success: true,
      donations
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
