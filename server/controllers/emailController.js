const nodemailer = require("nodemailer");
const EmailLog = require("../models/EmailLog");
const Template = require("../models/Template");
const Recipient = require("../models/Recipient");
const User = require("../models/User");
const fs = require("fs");
const path = require("path");

// Function to replace template variables
const replaceTemplateVariables = (text, recipient) => {
  let result = text;
  // Replace basic variables
  result = result.replace(/{{name}}/g, recipient.name || "");
  result = result.replace(/{{email}}/g, recipient.email || "");

  // Replace custom fields
  if (recipient.customFields) {
    Object.entries(recipient.customFields).forEach(([key, value]) => {
      result = result.replace(new RegExp(`{{${key}}}`, "g"), value || "");
    });
  }

  return result;
};

// Create email transporter
const createTransporter = (userEmail) => {
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || "gmail",
    auth: {
      user: userEmail || process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Send a single email
const sendEmail = async (recipient, template, userId, transporter, sender) => {
  try {
    // Prepare personalized content
    const personalizedSubject = replaceTemplateVariables(
      template.subject,
      recipient
    );
    const personalizedBody = replaceTemplateVariables(template.body, recipient);

    // Send email
    await transporter.sendMail({
      from: sender || process.env.EMAIL_USER,
      to: recipient.email,
      subject: personalizedSubject,
      text: template.isHtml ? undefined : personalizedBody,
      html: template.isHtml ? personalizedBody : undefined,
    });

    // Store custom fields for logging
    const customFieldsMap = {};
    if (recipient.customFields) {
      Object.entries(recipient.customFields).forEach(([key, value]) => {
        customFieldsMap[key] = value;
      });
    }

    // Log successful email
    const emailLog = new EmailLog({
      userId,
      companyEmail: recipient.email,
      recipientName: recipient.name,
      status: "sent",
      sentAt: new Date(),
      template: {
        subject: personalizedSubject,
        body: personalizedBody,
      },
      customFields: customFieldsMap,
    });
    await emailLog.save();

    // Update recipient's lastEmailSent
    if (recipient._id) {
      await Recipient.findByIdAndUpdate(recipient._id, {
        lastEmailSent: new Date(),
      });
    }

    return {
      email: recipient.email,
      name: recipient.name,
      status: "success",
    };
  } catch (error) {
    // Log failed email
    const emailLog = new EmailLog({
      userId,
      companyEmail: recipient.email,
      recipientName: recipient.name,
      status: "failed",
      error: error.message,
      sentAt: new Date(),
    });
    await emailLog.save();

    return {
      email: recipient.email,
      name: recipient.name,
      status: "failed",
      error: error.message,
    };
  }
};

// Controller to send bulk emails
exports.sendEmail = async (req, res) => {
  try {
    let { recipients, subject, body, userId } = req.body;

    // Parse recipients if it's a string
    if (typeof recipients === "string") {
      try {
        recipients = JSON.parse(recipients);
      } catch (error) {
        return res.status(400).json({ error: "Invalid recipients format" });
      }
    }

    // Validate required fields
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({ error: "Recipients are required" });
    }

    if (!subject) {
      return res.status(400).json({ error: "Subject is required" });
    }

    if (!body) {
      return res.status(400).json({ error: "Email body is required" });
    }

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Get the user who is sending the email (authenticated user)
    const senderUser = req.user;
    if (!senderUser || !senderUser.email) {
      return res.status(400).json({ error: "User email not found" });
    }

    // Create transporter with the authenticated user's email
    const transporter = createTransporter(senderUser.email);

    // Process attachments if any
    const attachments = [];
    if (req.files && req.files.length > 0) {
      attachments.push(
        ...req.files.map((file) => ({
          filename: file.originalname,
          path: file.path,
        }))
      );
    }

    // Send emails
    const results = [];
    for (const email of recipients) {
      try {
        // Send email with attachments
        await transporter.sendMail({
          from: senderUser.email,
          to: email,
          subject: subject,
          text: body,
          html: body,
          attachments: attachments,
        });

        // Log successful email
        const emailLog = new EmailLog({
          userId,
          companyEmail: email,
          status: "sent",
          sentAt: new Date(),
          template: {
            subject,
            body,
          },
          attachments: req.files
            ? req.files.map((file) => ({
                filename: file.originalname,
                path: file.filename,
              }))
            : [],
        });
        await emailLog.save();

        results.push({
          email,
          status: "success",
        });
      } catch (error) {
        // Log failed email
        const emailLog = new EmailLog({
          userId,
          companyEmail: email,
          status: "failed",
          error: error.message,
          sentAt: new Date(),
        });
        await emailLog.save();

        results.push({
          email,
          status: "failed",
          error: error.message,
        });
      }
    }

    // Clean up uploaded files after sending
    if (req.files) {
      req.files.forEach((file) => {
        fs.unlink(file.path, (err) => {
          if (err) console.error("Error deleting file:", err);
        });
      });
    }

    // Check if any emails failed
    const failedEmails = results.filter((result) => result.status === "failed");

    if (failedEmails.length > 0) {
      if (failedEmails.length === recipients.length) {
        return res.status(500).json({
          message: "All emails failed to send",
          results,
        });
      }

      return res.status(207).json({
        message: "Some emails failed to send",
        results,
        stats: {
          total: results.length,
          sent: results.length - failedEmails.length,
          failed: failedEmails.length,
        },
      });
    }

    return res.status(200).json({
      message: "All emails sent successfully",
      results,
    });
  } catch (error) {
    console.error("Error in sendEmail:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
};

// Controller to save templates
exports.saveTemplate = async (req, res) => {
  try {
    const { name, subject, body, description, isHtml, category, userId } =
      req.body;

    // Validate required fields
    if (!name || !subject || !body || !userId) {
      return res
        .status(400)
        .json({ error: "Name, subject, body, and userId are required" });
    }

    // Extract variables from template
    const variableRegex = /{{([^}]+)}}/g;
    const matches = [
      ...body.matchAll(variableRegex),
      ...subject.matchAll(variableRegex),
    ];
    const variables = [...new Set(matches.map((match) => match[1]))];

    // Create or update template
    const template = new Template({
      name,
      subject,
      body,
      description,
      isHtml: isHtml !== undefined ? isHtml : true,
      category,
      userId,
      variables,
    });

    await template.save();

    res.status(201).json({
      message: "Template saved successfully",
      template,
    });
  } catch (error) {
    console.error("Error in saveTemplate:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
};

// Controller to manage recipients
exports.addRecipient = async (req, res) => {
  try {
    const { email, name, customFields, tags, notes, userId } = req.body;

    // Validate required fields
    if (!email || !userId) {
      return res.status(400).json({ error: "Email and userId are required" });
    }

    // Check if recipient already exists
    const existingRecipient = await Recipient.findOne({ email, userId });
    if (existingRecipient) {
      // Update existing recipient
      existingRecipient.name = name || existingRecipient.name;

      // Update custom fields
      if (customFields) {
        if (!existingRecipient.customFields) {
          existingRecipient.customFields = new Map();
        }
        Object.entries(customFields).forEach(([key, value]) => {
          existingRecipient.customFields.set(key, value);
        });
      }

      // Update tags
      if (tags) {
        existingRecipient.tags = [
          ...new Set([...(existingRecipient.tags || []), ...tags]),
        ];
      }

      existingRecipient.notes = notes || existingRecipient.notes;

      await existingRecipient.save();

      res.status(200).json({
        message: "Recipient updated successfully",
        recipient: existingRecipient,
      });
    } else {
      // Create new recipient
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
        userId,
      });

      await recipient.save();

      res.status(201).json({
        message: "Recipient added successfully",
        recipient,
      });
    }
  } catch (error) {
    console.error("Error in addRecipient:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
};

// Get email analytics
exports.getEmailAnalytics = async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, endDate } = req.query;

    const query = { userId };

    // Add date range if provided
    if (startDate || endDate) {
      query.sentAt = {};
      if (startDate) query.sentAt.$gte = new Date(startDate);
      if (endDate) query.sentAt.$lte = new Date(endDate);
    }

    // Get analytics data
    const totalCount = await EmailLog.countDocuments(query);
    const sentCount = await EmailLog.countDocuments({
      ...query,
      status: "sent",
    });
    const failedCount = await EmailLog.countDocuments({
      ...query,
      status: "failed",
    });
    const repliedCount = await EmailLog.countDocuments({
      ...query,
      status: "replied",
    });
    const interviewedCount = await EmailLog.countDocuments({
      ...query,
      status: "interviewed",
    });

    res.status(200).json({
      analytics: {
        total: totalCount,
        sent: sentCount,
        failed: failedCount,
        replied: repliedCount,
        interviewed: interviewedCount,
        successRate: totalCount > 0 ? (sentCount / totalCount) * 100 : 0,
        replyRate: sentCount > 0 ? (repliedCount / sentCount) * 100 : 0,
        interviewRate:
          sentCount > 0 ? (interviewedCount / sentCount) * 100 : 0,
      },
    });
  } catch (error) {
    console.error("Error in getEmailAnalytics:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
};

// Get email history for a user
exports.getEmailHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    const emailLogs = await EmailLog.find({ userId })
      .sort({ sentAt: -1 })
      .limit(20);

    res.status(200).json({ emailLogs });
  } catch (error) {
    console.error("Error in getEmailHistory:", error);
    return res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
};
