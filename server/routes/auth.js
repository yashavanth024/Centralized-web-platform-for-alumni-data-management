const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const upload = require('../middleware/upload');
const { body, validationResult } = require('express-validator');

/* =====================================================
   REGISTER USER (STUDENT / ALUMNI) WITH ID CARD UPLOAD
===================================================== */
router.post(
  '/register',
  upload.single('id_card'),
  [
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    body('first_name').notEmpty(),
    body('last_name').notEmpty(),
    body('usn_number').notEmpty(),
    body('role').isIn(['student', 'alumni'])
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'ID card upload is required'
      });
    }

    const {
      email,
      password,
      first_name,
      last_name,
      usn_number,
      role,
      graduation_year,
      degree,
      department
    } = req.body;

    const id_card_url = `/uploads/${req.file.filename}`;

    try {
      // Email check
      const [emailExists] = await db.query(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );
      if (emailExists.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Email already registered'
        });
      }

      // USN check
      const [usnExists] = await db.query(
        'SELECT id FROM users WHERE usn_number = ?',
        [usn_number]
      );
      if (usnExists.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'USN already registered'
        });
      }

      // Alumni validation
      if (role === 'alumni' && !graduation_year) {
        return res.status(400).json({
          success: false,
          message: 'Graduation year is required for alumni'
        });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Insert user (NOT VERIFIED by default)
      const [result] = await db.query(
        `INSERT INTO users (
          email, password, first_name, last_name,
          usn_number, role, graduation_year,
          degree, department, id_card_url,
          is_verified, is_admin
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, FALSE, FALSE)`,
        [
          email,
          hashedPassword,
          first_name,
          last_name,
          usn_number,
          role,
          graduation_year || null,
          degree || null,
          department || null,
          id_card_url
        ]
      );

      const userId = result.insertId;

      // JWT token
      const token = jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
      );

      return res.status(201).json({
        success: true,
        token,
        user: {
          id: userId,
          email,
          first_name,
          last_name,
          usn_number,
          role,
          is_verified: false,
          is_admin: false
        }
      });

    } catch (error) {
      console.error('REGISTER ERROR:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }
);

/* =====================================================
   LOGIN USER
===================================================== */
router.post(
  '/login',
  [
    body('email').isEmail(),
    body('password').notEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const [users] = await db.query(
        `SELECT id, email, password, first_name, last_name,
                role, is_admin, is_verified
         FROM users
         WHERE email = ?`,
        [email]
      );

      if (users.length === 0) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      const user = users[0];

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      const token = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
      );

      delete user.password;

      res.json({
        success: true,
        token,
        user
      });

    } catch (error) {
      console.error('LOGIN ERROR:', error);
      res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }
  }
);

/* =====================================================
   GET CURRENT USER (/api/auth/me)
===================================================== */
router.get('/me', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token provided'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const [users] = await db.query(
      `SELECT id, email, first_name, last_name,
              role, usn_number, graduation_year,
              degree, department,
              current_job_title, current_company,
              location, contact_number, linkedin_url,
              profile_picture, id_card_url,
              is_admin, is_verified, created_at
       FROM users
       WHERE id = ?`,
      [decoded.id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: users[0]
    });

  } catch (error) {
    console.error('AUTH ME ERROR:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
});

module.exports = router;
