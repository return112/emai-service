import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import Navbar from './Navbar';
import EmailForm from './EmailForm';
import EmailHistory from './EmailHistory';

const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('send');
  const [emailHistory, setEmailHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchEmailHistory();
    }
  }, [user]);

  const fetchEmailHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/email/history/${user.id}`);
      setEmailHistory(response.data.emailLogs || []);
    } catch (error) {
      console.error('Error fetching email history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendSuccess = () => {
    // Refresh email history after sending
    fetchEmailHistory();
    // Show history tab
    setActiveTab('history');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        <div className="sm:px-0">
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex flex-wrap" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab('send')}
                  className={`${
                    activeTab === 'send'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } w-1/2 py-3 sm:py-4 px-1 text-center border-b-2 font-medium text-xs sm:text-sm focus:outline-none`}
                >
                  Send Email
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`${
                    activeTab === 'history'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } w-1/2 py-3 sm:py-4 px-1 text-center border-b-2 font-medium text-xs sm:text-sm focus:outline-none`}
                >
                  Email History
                </button>
              </nav>
            </div>

            <div className="p-2 sm:p-6">
              <div className={activeTab === 'send' ? 'block' : 'hidden'}>
                <EmailForm onSendSuccess={handleSendSuccess} />
              </div>
              <div className={activeTab === 'history' ? 'block' : 'hidden'}>
                <EmailHistory 
                  emails={emailHistory} 
                  loading={loading} 
                  onRefresh={fetchEmailHistory} 
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
