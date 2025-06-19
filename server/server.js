const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db.js');
const userRoutes = require('./routes/userRoutes.js');
const emailRoutes = require('./routes/emailRoutes.js');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Function to find an available port
const findAvailablePort = async (startPort) => {
    const net = require('net');
    return new Promise((resolve, reject) => {
        const server = net.createServer();
        server.unref();
        server.on('error', () => {
            resolve(findAvailablePort(startPort + 1));
        });
        server.listen(startPort, () => {
            server.close(() => {
                resolve(startPort);
            });
        });
    });
};

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    res.json({ message: 'Email Service API' });
});

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/email', emailRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    
    // Handle multer errors
    if (err.name === 'MulterError') {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                error: 'File too large',
                message: 'File size should not exceed 5MB'
            });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                error: 'Too many files',
                message: 'You can only upload up to 5 files'
            });
        }
        return res.status(400).json({
            error: 'File upload error',
            message: err.message
        });
    }

    res.status(500).json({
        error: 'Server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred'
    });
});

// Handle 404 errors
app.use((req, res) => {
    res.status(404).json({ error: 'Resource not found' });
});

// Start the server
(async () => {
    try {
        const availablePort = await findAvailablePort(PORT);
        app.listen(availablePort, () => {
            console.log(`Server running on port ${availablePort}`);
            if (availablePort !== PORT) {
                console.log(`Note: Original port ${PORT} was in use, using port ${availablePort} instead`);
            }
        });
    } catch (error) {
        console.error('Failed to start server:', error);
    }
})();