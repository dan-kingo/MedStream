import React, { useState } from 'react'
import { Clock, CheckCircle, AlertCircle, Phone, Mail, XCircle } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { profileAPI } from '../services/api'
import toast from 'react-hot-toast'

const PendingApproval: React.FC = () => {
  const { pharmacy, logout, setPharmacy } = useAuthStore()
  const [checking, setChecking] = useState(false)

  const checkStatus = async () => {
    setChecking(true)
    try {
      const response = await profileAPI.getProfile()
      const updatedPharmacy = response.data.pharmacy
      
      if (updatedPharmacy) {
        setPharmacy(updatedPharmacy)
        
        if (updatedPharmacy.status === 'approved' && updatedPharmacy.isActive) {
          toast.success('Your pharmacy has been approved! Redirecting to dashboard...')
          setTimeout(() => {
            window.location.href = '/dashboard'
          }, 2000)
        } else if (updatedPharmacy.status === 'rejected') {
          toast.error('Your pharmacy application has been rejected. Please contact support.')
        } else {
          toast('Your application is still under review. Please check back later.')
        }
      }
    } catch (error) {
      console.error('Error checking status:', error)
      toast.error('Failed to check status. Please try again.')
    } finally {
      setChecking(false)
    }
  }

  const getStatusIcon = () => {
    if (pharmacy?.status === 'rejected') {
      return <XCircle className="h-8 w-8 text-white" />
    }
    return <Clock className="h-8 w-8 text-white" />
  }

  const getStatusColor = () => {
    if (pharmacy?.status === 'rejected') {
      return 'bg-error-500'
    }
    return 'bg-warning-500'
  }

  const getStatusTitle = () => {
    if (pharmacy?.status === 'rejected') {
      return 'Application Rejected'
    }
    return 'Pending Approval'
  }

  const getStatusDescription = () => {
    if (pharmacy?.status === 'rejected') {
      return 'Your pharmacy registration has been rejected'
    }
    return 'Your pharmacy registration is under review'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-warning-50 to-warning-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className={`mx-auto h-16 w-16 ${getStatusColor()} rounded-full flex items-center justify-center shadow-lg`}>
            {getStatusIcon()}
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            {getStatusTitle()}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {getStatusDescription()}
          </p>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {pharmacy?.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {pharmacy?.status === 'rejected' 
                    ? 'Unfortunately, your pharmacy application has been rejected. Please contact our support team for more information.'
                    : 'Thank you for registering with MediMap. Your pharmacy profile has been submitted for review.'
                  }
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-success-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Profile Submitted</p>
                    <p className="text-xs text-gray-500">Your pharmacy information has been received</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  {pharmacy?.status === 'rejected' ? (
                    <XCircle className="h-5 w-5 text-error-500 mt-0.5" />
                  ) : (
                    <Clock className="h-5 w-5 text-warning-500 mt-0.5" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {pharmacy?.status === 'rejected' ? 'Application Rejected' : 'Under Review'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {pharmacy?.status === 'rejected' 
                        ? 'Your application did not meet our requirements'
                        : 'Our team is verifying your pharmacy details'
                      }
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-gray-300 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-400">
                      {pharmacy?.status === 'rejected' ? 'Contact Support' : 'Approval Pending'}
                    </p>
                    <p className="text-xs text-gray-400">
                      {pharmacy?.status === 'rejected' 
                        ? 'Reach out to our team for assistance'
                        : "You'll receive notification once approved"
                      }
                    </p>
                  </div>
                </div>
              </div>

              {pharmacy?.status !== 'rejected' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">What happens next?</h4>
                  <ul className="text-xs text-blue-800 space-y-1">
                    <li>• Our team will verify your pharmacy license and details</li>
                    <li>• You'll receive an email/SMS notification once approved</li>
                    <li>• Approval typically takes 1-3 business days</li>
                    <li>• Once approved, you can access your full dashboard</li>
                  </ul>
                </div>
              )}

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Need Help?</h4>
                <div className="space-y-2 text-xs text-gray-600">
                  <div className="flex items-center">
                    <Phone className="h-3 w-3 mr-2" />
                    <span>Call us: +251-911-123456</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-3 w-3 mr-2" />
                    <span>Email: support@medimap.com</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={checkStatus}
                  disabled={checking}
                  className="btn-primary flex-1"
                >
                  {checking ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Checking...
                    </div>
                  ) : (
                    'Check Status'
                  )}
                </button>
                <button
                  onClick={logout}
                  className="btn-secondary flex-1"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            Status: <span className={`font-medium ${
              pharmacy?.status === 'rejected' ? 'text-error-600' : 'text-warning-600'
            }`}>
              {pharmacy?.status === 'rejected' ? 'Rejected' : 'Pending Approval'}
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}

export default PendingApproval