import React from 'react';

const EmailHistory = ({ emails, loading, onRefresh }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="w-full mx-auto px-2 sm:px-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-3 sm:mb-0">Email History</h2>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg 
            className={`mr-1.5 h-4 w-4 ${loading ? 'animate-spin' : ''}`} 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
            />
          </svg>
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center my-12">
          <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : emails.length === 0 ? (
        <div className="bg-gray-50 p-4 sm:p-6 text-center rounded-lg border border-gray-200">
          <svg 
            className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
            />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">No emails sent yet</h3>
          <p className="mt-1 text-sm text-gray-500">Start sending emails to see your history here.</p>
        </div>
      ) : (
        <div className="overflow-x-auto -mx-2 sm:mx-0">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              {/* Mobile view - card layout */}
              <div className="sm:hidden">
                {emails.map((email) => (
                  <div key={email._id} className="bg-white px-4 py-3 border-b border-gray-200 last:border-b-0">
                    <div className="flex justify-between items-start mb-1">
                      <div className="text-sm font-medium text-gray-900 break-all">{email.companyEmail}</div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(email.status)}`}>
                        {email.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mb-1 truncate">
                      {email.template?.subject || 'No subject'}
                    </div>
                    <div className="text-xs text-gray-500">{formatDate(email.sentAt)}</div>
                    {email.error && (
                      <div className="mt-1 text-xs text-red-500 overflow-hidden overflow-ellipsis">
                        Error: {email.error.substring(0, 100)}{email.error.length > 100 ? '...' : ''}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Desktop view - table layout */}
              <table className="hidden sm:table min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Recipient</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Subject</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Sent At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {emails.map((email) => (
                    <tr key={email._id} className="hover:bg-gray-50">
                      <td className="py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 max-w-[200px] truncate">{email.companyEmail}</td>
                      <td className="px-3 py-4 text-sm text-gray-500 max-w-[250px] truncate">{email.template?.subject || 'No subject'}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(email.status)}`}>
                          {email.status}
                        </span>
                        {email.error && (
                          <span className="ml-2 text-xs text-red-500" title={email.error}>
                            ⚠️
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{formatDate(email.sentAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailHistory; 