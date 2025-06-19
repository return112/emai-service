import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from './Navbar'

const FeatureCard = ({ icon, title, description }) => (
  <div className="relative p-6 bg-white/60 backdrop-blur-md rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
    <div className="absolute -top-6 left-6 flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md">
      {icon}
    </div>
    <div className="mt-8">
      <h3 className="text-lg font-bold text-gray-900">{title}</h3>
      <p className="mt-2 text-gray-600">{description}</p>
    </div>
  </div>
)

const Homepage = () => {
  const { isAuthenticated } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 text-gray-900">
      <Navbar />

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2 text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight">
                Simplify Your
                <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                  Email Communications
                </span>
              </h1>
              <p className="mt-4 text-lg text-gray-600 max-w-xl mx-auto lg:mx-0">
                Send personalized emails to multiple recipients with ease. Streamline your workflow and save valuable time.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row sm:justify-center lg:justify-start gap-4">
                {isAuthenticated ? (
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center justify-center px-8 py-3 text-base font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg transition-all duration-300"
                  >
                    Go to Dashboard
                  </Link>
                ) : (
                  <>
                    
<Link to='/register' className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"> Get Started
</Link>

                    <Link
                      to="/login"
                      className="inline-flex items-center justify-center px-8 py-3 border border-gray-300 text-base font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-100 shadow-md transition-all duration-300"
                    >
                      Log In
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="lg:w-1/2">
              <img
                className="rounded-2xl shadow-xl object-cover w-full"
                src="https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=2850&q=80"
                alt="Email Service"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Wave Divider */}
      <div className="relative -mt-12 z-10">
        <svg className="w-full" viewBox="0 0 1440 320" fill="none">
          <path
            fill="#ffffff"
            d="M0,96L60,112C120,128,240,160,360,176C480,192,600,192,720,170.7C840,149,960,107,1080,122.7C1200,139,1320,213,1380,250.7L1440,288V320H0Z"
          />
        </svg>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-base font-semibold tracking-widest text-blue-600 uppercase">Features</h2>
            <p className="mt-2 text-4xl font-extrabold text-gray-900">Everything You Need</p>
            <p className="mt-4 text-xl text-gray-500 max-w-2xl mx-auto">
              Tools to help you send, manage, and secure your email communication.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<MailIcon />}
              title="Multiple Recipients"
              description="Send one email to many without extra work."
            />
            <FeatureCard
              icon={<CodeIcon />}
              title="HTML Support"
              description="Create beautiful, formatted messages with HTML."
            />
            <FeatureCard
              icon={<HistoryIcon />}
              title="Email History"
              description="Track delivery and view sent email history."
            />
            <FeatureCard
              icon={<LockIcon />}
              title="Secure Authentication"
              description="Protect your account with secure JWT login."
            />
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-extrabold text-white">Ready to streamline your email communications?</h2>
          <p className="mt-4 text-lg text-blue-100">
            Join thousands of users who save time every day.
          </p>
          <div className="mt-8">
            <Link
              to={isAuthenticated ? "/dashboard" : "/register"}
              className="inline-block px-10 py-4 bg-white text-blue-700 font-semibold text-lg rounded-xl hover:bg-blue-100 transition-all duration-300"
            >
              {isAuthenticated ? "Go to Dashboard" : "Get Started for Free"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Homepage

// ICONS
const MailIcon = () => (
  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
)
const CodeIcon = () => (
  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
  </svg>
)
const HistoryIcon = () => (
  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
)
const LockIcon = () => (
  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
)
