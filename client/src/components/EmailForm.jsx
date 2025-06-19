import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';

const EmailForm = ({ onSendSuccess }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    recipients: '',
    subject: '',
    body: ''
  });
  const [attachments, setAttachments] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setAttachments(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Form validation
    if (!formData.recipients || !formData.subject || !formData.body) {
      setError('All fields are required');
      return;
    }
    
    // Parse recipients
    const recipientList = formData.recipients
      .split(',')
      .map(email => email.trim())
      .filter(email => email);
    
    if (recipientList.length === 0) {
      setError('Please enter at least one recipient email');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccessMessage('');
    
    try {
      // Create form data with files
      const formDataToSend = new FormData();
      formDataToSend.append('recipients', JSON.stringify(recipientList));
      formDataToSend.append('subject', formData.subject);
      formDataToSend.append('body', formData.body);
      formDataToSend.append('userId', user.id);

      // Append each attachment
      if (attachments.length > 0) {
        attachments.forEach((file) => {
          formDataToSend.append('attachments', file);
        });
      }
      
      // Send request with proper headers
      const response = await api.post('/email/send', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Handle success
      setSuccessMessage(`Email sent successfully to ${response.data.results.length} recipient(s)!`);
      
      // Reset form
      setFormData({
        recipients: '',
        subject: '',
        body: ''
      });
      setAttachments([]);
      
      // Notify parent component
      if (onSendSuccess) onSendSuccess();
      
    } catch (error) {
      console.error('Error sending email:', error);
      const errorMessage = error.response?.data?.error || 'Failed to send email. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6">
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6">Send Email</h2>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex flex-wrap sm:flex-nowrap">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 mt-1 sm:mt-0">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-50 border-l-4 border-green-500 p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex flex-wrap sm:flex-nowrap">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 mt-1 sm:mt-0">
              <p className="text-sm text-green-700">{successMessage}</p>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div>
          <label htmlFor="recipients" className="block text-sm font-medium text-gray-700">
            Recipients
          </label>
          <div className="mt-1">
            <textarea
              id="recipients"
              name="recipients"
              rows={3}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full text-sm sm:text-sm border-gray-300 rounded-md p-3 sm:p-4"
              placeholder="recipient1@example.com, recipient2@example.com"
              value={formData.recipients}
              onChange={handleChange}
            />
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Multiple recipients should be separated by commas.
          </p>
        </div>
        
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
            Subject
          </label>
          <div className="mt-1">
            <input
              type="text"
              id="subject"
              name="subject"
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full text-sm sm:text-sm border-gray-300 rounded-md p-3"
              placeholder="Email subject"
              value={formData.subject}
              onChange={handleChange}
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="body" className="block text-sm font-medium text-gray-700">
            Email Body
          </label>
          <div className="mt-1">
            <textarea
              id="body"
              name="body"
              rows={6}
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full text-sm sm:text-sm border-gray-300 rounded-md p-3 sm:p-4"
              placeholder="Compose your email message here"
              value={formData.body}
              onChange={handleChange}
            />
          </div>
          <p className="mt-2 text-xs text-gray-500">
            You can use HTML tags for formatting your email.
          </p>
        </div>

        {/* File Attachments */}
        <div>
          <label htmlFor="attachments" className="block text-sm font-medium text-gray-700">
            Attachments
          </label>
          <div className="mt-1">
            <input
              type="file"
              id="attachments"
              name="attachments"
              multiple
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-medium
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            />
          </div>
          <p className="mt-2 text-xs text-gray-500">
            You can attach up to 5 files (PDF, DOC, DOCX, JPG, PNG, TXT). Max size: 5MB each.
          </p>
          {attachments.length > 0 && (
            <div className="mt-2">
              <p className="text-sm text-gray-600">Selected files:</p>
              <ul className="mt-1 space-y-1">
                {attachments.map((file, index) => (
                  <li key={index} className="text-sm text-gray-600">
                    {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <div className="flex justify-center sm:justify-end">
          <button
            type="submit"
            disabled={loading}
            className={`w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              loading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'
            }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </>
            ) : 'Send Email'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmailForm;