const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/accessControl');

const db = require('../config/database');

// GET all published news
router.get('/', async (req, res) => {
  try {
    const [news] = await db.query(
      `SELECT n.*, u.first_name, u.last_name
       FROM news_updates n
       LEFT JOIN users u ON n.author_id = u.id
       WHERE n.is_published = TRUE
       ORDER BY n.created_at DESC`
    );

    res.json({ success: true, news });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// CREATE news (admin only)
router.post('/', protect, adminOnly, async (req, res) => {
  const { title, content, category, image_url } = req.body;

  try {
    const [result] = await db.query(
      `INSERT INTO news_updates 
       (title, content, author_id, category, image_url)
       VALUES (?, ?, ?, ?, ?)`,
      [title, content, req.user.id, category, image_url]
    );

    const [news] = await db.query(
      'SELECT * FROM news_updates WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'News published successfully',
      news: news[0]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
