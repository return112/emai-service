const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// Email sending route with file upload support
router.post('/send', auth, upload.array('attachments', 5), emailController.sendEmail);

// Email history route
router.get('/history/:userId', auth, emailController.getEmailHistory);

module.exports = router;
