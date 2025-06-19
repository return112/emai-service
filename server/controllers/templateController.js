const Template = require('../models/Template');

// Get all templates for a user
exports.getTemplates = async (req, res) => {
    try {
        const { userId } = req.params;
        const { category } = req.query;
        
        const query = { userId };
        if (category) {
            query.category = category;
        }
        
        const templates = await Template.find(query).sort({ createdAt: -1 });
        
        res.status(200).json({ templates });
    } catch (error) {
        console.error('Error in getTemplates:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
};

// Get a single template
exports.getTemplate = async (req, res) => {
    try {
        const { templateId } = req.params;
        
        const template = await Template.findById(templateId);
        if (!template) {
            return res.status(404).json({ error: 'Template not found' });
        }
        
        res.status(200).json({ template });
    } catch (error) {
        console.error('Error in getTemplate:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
};

// Create a new template
exports.createTemplate = async (req, res) => {
    try {
        const { name, subject, body, description, isHtml, category, userId } = req.body;
        
        // Validate required fields
        if (!name || !subject || !body || !userId) {
            return res.status(400).json({ error: 'Name, subject, body, and userId are required' });
        }
        
        // Extract variables from template
        const variableRegex = /{{([^}]+)}}/g;
        const matches = [...body.matchAll(variableRegex), ...subject.matchAll(variableRegex)];
        const variables = [...new Set(matches.map(match => match[1]))];
        
        // Create template
        const template = new Template({
            name,
            subject,
            body,
            description,
            isHtml: isHtml !== undefined ? isHtml : true,
            category,
            userId,
            variables
        });
        
        await template.save();
        
        res.status(201).json({
            message: 'Template created successfully',
            template
        });
    } catch (error) {
        console.error('Error in createTemplate:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
};

// Update a template
exports.updateTemplate = async (req, res) => {
    try {
        const { templateId } = req.params;
        const { name, subject, body, description, isHtml, category, isActive } = req.body;
        
        const template = await Template.findById(templateId);
        if (!template) {
            return res.status(404).json({ error: 'Template not found' });
        }
        
        // Update template fields
        if (name) template.name = name;
        if (subject) template.subject = subject;
        if (body) template.body = body;
        if (description !== undefined) template.description = description;
        if (isHtml !== undefined) template.isHtml = isHtml;
        if (category) template.category = category;
        if (isActive !== undefined) template.isActive = isActive;
        
        // Re-extract variables if subject or body changed
        if (subject || body) {
            const variableRegex = /{{([^}]+)}}/g;
            const updatedSubject = subject || template.subject;
            const updatedBody = body || template.body;
            
            const matches = [...updatedBody.matchAll(variableRegex), ...updatedSubject.matchAll(variableRegex)];
            template.variables = [...new Set(matches.map(match => match[1]))];
        }
        
        await template.save();
        
        res.status(200).json({
            message: 'Template updated successfully',
            template
        });
    } catch (error) {
        console.error('Error in updateTemplate:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
};

// Delete a template
exports.deleteTemplate = async (req, res) => {
    try {
        const { templateId } = req.params;
        
        const template = await Template.findById(templateId);
        if (!template) {
            return res.status(404).json({ error: 'Template not found' });
        }
        
        await Template.findByIdAndDelete(templateId);
        
        res.status(200).json({
            message: 'Template deleted successfully'
        });
    } catch (error) {
        console.error('Error in deleteTemplate:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
};

// Duplicate a template
exports.duplicateTemplate = async (req, res) => {
    try {
        const { templateId } = req.params;
        
        const template = await Template.findById(templateId);
        if (!template) {
            return res.status(404).json({ error: 'Template not found' });
        }
        
        // Create a new template with the same content
        const newTemplate = new Template({
            name: `${template.name} (Copy)`,
            subject: template.subject,
            body: template.body,
            description: template.description,
            isHtml: template.isHtml,
            category: template.category,
            userId: template.userId,
            variables: template.variables
        });
        
        await newTemplate.save();
        
        res.status(201).json({
            message: 'Template duplicated successfully',
            template: newTemplate
        });
    } catch (error) {
        console.error('Error in duplicateTemplate:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
}; 