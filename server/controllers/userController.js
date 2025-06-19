const User = require('../models/User.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register a new user
exports.register = async (req, res) => {
    try {
        const { email, password, name } = req.body;
        
        // Validate input
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        
        // Check if user already exists
        const existingUser = await User.findOne({ email, name });
        if (existingUser) {
            // console.log("user already exist");
            
            return res.status(400).json({ error: 'User with this email already exists' });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create user
        const user = new User({
            email,
            password: hashedPassword,
            name
        });
        
        await user.save();
        
        // Generate token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '30d'
        });
        
        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name
            }
        });
    } catch (error) {
        console.error('Error in register:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
};

// Login user
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Validate input
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        
        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        // Generate token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '30d'
        });
        
        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name
            }
        });
    } catch (error) {
        console.error('Error in login:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
};

// Get user profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.status(200).json({ user });
    } catch (error) {
        console.error('Error in getProfile:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
};

// Update user profile
exports.updateProfile = async (req, res) => {
    try {
        const { name, email } = req.body;
        
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Update fields
        if (name) user.name = name;
        if (email) user.email = email;
        
        await user.save();
        
        res.status(200).json({
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                email: user.email,
                name: user.name
            }
        });
    } catch (error) {
        console.error('Error in updateProfile:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
};

// Change password
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Current password and new password are required' });
        }
        
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }
        
        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        
        await user.save();
        
        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Error in changePassword:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
};

// Get user dashboard stats
exports.getDashboardStats = async (req, res) => {
    try {
        const userId = req.userId;
        
        // Get counts
        const emailsSent = await EmailLog.countDocuments({ userId, status: 'sent' });
        const templatesCount = await Template.countDocuments({ userId });
        const recipientsCount = await Recipient.countDocuments({ userId });
        
        // Get recent email logs
        const recentEmails = await EmailLog.find({ userId })
            .sort({ sentAt: -1 })
            .limit(5);
        
        // Get success rate
        const totalEmails = await EmailLog.countDocuments({ userId });
        const successRate = totalEmails > 0 ? (emailsSent / totalEmails) * 100 : 0;
        
        res.status(200).json({
            stats: {
                emailsSent,
                templatesCount,
                recipientsCount,
                successRate
            },
            recentEmails
        });
    } catch (error) {
        console.error('Error in getDashboardStats:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
};

// module.exports = {
//     register,
//     login,
//     getProfile,
//     updateProfile,
//     changePassword,
//     getDashboardStats,
// };