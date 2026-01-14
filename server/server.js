const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./config/database');

// Load env vars
dotenv.config();

// Initialize app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test Database Connection
db.query('SELECT 1')
  .then(() => console.log('Database connected'))
  .catch(err => console.error('DB error:', err));

// Import Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const eventRoutes = require('./routes/events');
const mentorshipRoutes = require('./routes/mentorship');
const jobRoutes = require('./routes/jobs');
const donationRoutes = require('./routes/donations');
const newsRoutes = require('./routes/news');
const adminRoutes = require('./routes/admin');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/mentorship', mentorshipRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/uploads', express.static('uploads'));


// Welcome route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Alumni Portal API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});