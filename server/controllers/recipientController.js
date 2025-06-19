const Recipient = require('../models/Recipient');
const EmailLog = require('../models/EmailLog');

// Get all recipients for a user
exports.getRecipients = async (req, res) => {
    try {
        const { userId } = req.params;
        const { tag, status, search, limit = 100, page = 1 } = req.query;
        
        const query = { userId };
        
        // Apply filters
        if (tag) {
            query.tags = tag;
        }
        
        if (status) {
            query.status = status;
        }
        
        if (search) {
            query.$or = [
                { email: { $regex: search, $options: 'i' } },
                { name: { $regex: search, $options: 'i' } }
            ];
        }
        
        // Count total matches
        const totalCount = await Recipient.countDocuments(query);
        
        // Paginate results
        const skip = (page - 1) * limit;
        const recipients = await Recipient.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));
        
        res.status(200).json({
            recipients,
            pagination: {
                total: totalCount,
                page: Number(page),
                limit: Number(limit),
                pages: Math.ceil(totalCount / limit)
            }
        });
    } catch (error) {
        console.error('Error in getRecipients:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
};

// Get a single recipient
exports.getRecipient = async (req, res) => {
    try {
        const { recipientId } = req.params;
        
        const recipient = await Recipient.findById(recipientId);
        if (!recipient) {
            return res.status(404).json({ error: 'Recipient not found' });
        }
        
        // Get recent email logs for this recipient
        const emailLogs = await EmailLog.find({ companyEmail: recipient.email })
            .sort({ sentAt: -1 })
            .limit(10);
        
        res.status(200).json({ 
            recipient,
            emailHistory: emailLogs
        });
    } catch (error) {
        console.error('Error in getRecipient:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
};

// Create a new recipient
exports.createRecipient = async (req, res) => {
    try {
        const { email, name, customFields, tags, notes, userId } = req.body;
        
        // Validate required fields
        if (!email || !userId) {
            return res.status(400).json({ error: 'Email and userId are required' });
        }
        
        // Check if recipient already exists
        const existingRecipient = await Recipient.findOne({ email, userId });
        if (existingRecipient) {
            return res.status(400).json({ error: 'A recipient with this email already exists' });
        }
        
        // Create recipient
        const customFieldsMap = new Map();
        if (customFields) {
            Object.entries(customFields).forEach(([key, value]) => {
                customFieldsMap.set(key, value);
            });
        }
        
        const recipient = new Recipient({
            email,
            name,
            customFields: customFieldsMap,
            tags,
            notes,
            userId
        });
        
        await recipient.save();
        
        res.status(201).json({
            message: 'Recipient created successfully',
            recipient
        });
    } catch (error) {
        console.error('Error in createRecipient:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
};

// Update a recipient
exports.updateRecipient = async (req, res) => {
    try {
        const { recipientId } = req.params;
        const { email, name, customFields, tags, notes, status } = req.body;
        
        const recipient = await Recipient.findById(recipientId);
        if (!recipient) {
            return res.status(404).json({ error: 'Recipient not found' });
        }
        
        // Update recipient fields
        if (email) recipient.email = email;
        if (name !== undefined) recipient.name = name;
        
        // Update custom fields
        if (customFields) {
            if (!recipient.customFields) {
                recipient.customFields = new Map();
            }
            
            Object.entries(customFields).forEach(([key, value]) => {
                if (value === null) {
                    // Remove field if value is null
                    recipient.customFields.delete(key);
                } else {
                    recipient.customFields.set(key, value);
                }
            });
        }
        
        // Update tags
        if (tags) {
            recipient.tags = tags;
        }
        
        if (notes !== undefined) recipient.notes = notes;
        if (status) recipient.status = status;
        
        await recipient.save();
        
        res.status(200).json({
            message: 'Recipient updated successfully',
            recipient
        });
    } catch (error) {
        console.error('Error in updateRecipient:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
};

// Delete a recipient
exports.deleteRecipient = async (req, res) => {
    try {
        const { recipientId } = req.params;
        
        const recipient = await Recipient.findById(recipientId);
        if (!recipient) {
            return res.status(404).json({ error: 'Recipient not found' });
        }
        
        await Recipient.findByIdAndDelete(recipientId);
        
        res.status(200).json({
            message: 'Recipient deleted successfully'
        });
    } catch (error) {
        console.error('Error in deleteRecipient:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
};

// Bulk import recipients
exports.bulkImportRecipients = async (req, res) => {
    try {
        const { recipients, userId } = req.body;
        
        if (!Array.isArray(recipients) || recipients.length === 0) {
            return res.status(400).json({ error: 'Recipients array is required' });
        }
        
        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }
        
        const results = {
            total: recipients.length,
            created: 0,
            duplicates: 0,
            failed: 0,
            errors: []
        };
        
        // Process each recipient
        for (const recipientData of recipients) {
            try {
                if (!recipientData.email) {
                    results.failed++;
                    results.errors.push(`Missing email for entry: ${JSON.stringify(recipientData)}`);
                    continue;
                }
                
                // Check if recipient already exists
                const existingRecipient = await Recipient.findOne({ 
                    email: recipientData.email, 
                    userId 
                });
                
                if (existingRecipient) {
                    results.duplicates++;
                    continue;
                }
                
                // Create custom fields map
                const customFieldsMap = new Map();
                if (recipientData.customFields) {
                    Object.entries(recipientData.customFields).forEach(([key, value]) => {
                        customFieldsMap.set(key, value);
                    });
                }
                
                // Create recipient
                const recipient = new Recipient({
                    email: recipientData.email,
                    name: recipientData.name,
                    customFields: customFieldsMap,
                    tags: recipientData.tags || [],
                    notes: recipientData.notes,
                    userId
                });
                
                await recipient.save();
                results.created++;
            } catch (error) {
                results.failed++;
                results.errors.push(`Error with ${recipientData.email}: ${error.message}`);
            }
        }
        
        res.status(200).json({
            message: 'Bulk import completed',
            results
        });
    } catch (error) {
        console.error('Error in bulkImportRecipients:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
}; 