const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const db = require('../config/database');

// @route   GET /api/users
// @desc    Get all alumni (with filters)
router.get('/', async (req, res) => {
    try {
        const { graduation_year, department, search } = req.query;
        let query = `
            SELECT id, first_name, last_name, graduation_year, degree, department, 
                   current_job_title, current_company, location, profile_picture
            FROM users 
            WHERE is_verified = TRUE
        `;
        const params = [];

        if (graduation_year) {
            query += ' AND graduation_year = ?';
            params.push(graduation_year);
        }

        if (department) {
            query += ' AND department = ?';
            params.push(department);
        }

        if (search) {
            query += ' AND (first_name LIKE ? OR last_name LIKE ? OR current_company LIKE ?)';
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        query += ' ORDER BY first_name ASC';

        const [users] = await db.query(query, params);
        res.json({ success: true, count: users.length, users });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
router.get('/:id', async (req, res) => {
    try {
        const [users] = await db.query(
            `SELECT id, email, first_name, last_name, graduation_year, degree, department,
                    current_job_title, current_company, location, contact_number, linkedin_url,
                    profile_picture, is_verified, created_at
             FROM users WHERE id = ?`,
            [req.params.id]
        );

        if (users.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({ success: true, user: users[0] });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
router.put('/profile', protect, async (req, res) => {
    const {
        first_name, last_name, graduation_year, degree, department,
        current_job_title, current_company, location, contact_number, linkedin_url
    } = req.body;

    try {
        await db.query(
            `UPDATE users 
             SET first_name = ?, last_name = ?, graduation_year = ?, degree = ?, department = ?,
                 current_job_title = ?, current_company = ?, location = ?, 
                 contact_number = ?, linkedin_url = ?, updated_at = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [
                first_name, last_name, graduation_year, degree, department,
                current_job_title, current_company, location, contact_number, linkedin_url,
                req.user.id
            ]
        );

        // Get updated user
        const [users] = await db.query(
            'SELECT id, first_name, last_name, graduation_year, degree, department, current_job_title, current_company FROM users WHERE id = ?',
            [req.user.id]
        );

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: users[0]
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/users/stats
// @desc    Get alumni statistics
router.get('/stats/summary', async (req, res) => {
    try {
        // Get total alumni count
        const [[{ total }]] = await db.query(
            'SELECT COUNT(*) as total FROM users WHERE is_verified = TRUE'
        );

        // Get count by graduation year
        const [years] = await db.query(
            'SELECT graduation_year, COUNT(*) as count FROM users WHERE is_verified = TRUE GROUP BY graduation_year ORDER BY graduation_year DESC'
        );

        // Get count by department
        const [departments] = await db.query(
            'SELECT department, COUNT(*) as count FROM users WHERE is_verified = TRUE AND department IS NOT NULL GROUP BY department'
        );

        // Get top companies
        const [companies] = await db.query(
            `SELECT current_company, COUNT(*) as count 
             FROM users 
             WHERE is_verified = TRUE AND current_company IS NOT NULL 
             GROUP BY current_company 
             ORDER BY count DESC 
             LIMIT 10`
        );

        res.json({
            success: true,
            stats: {
                total_alumni: total,
                by_graduation_year: years,
                by_department: departments,
                top_companies: companies
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;