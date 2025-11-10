import React, { useState, useEffect } from 'react'
import { Save, MapPin, Phone, Mail, Building, FileText, AlertCircle, ArrowLeft } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useAuthStore } from '../stores/authStore'
import { useNavigate, useSearchParams } from 'react-router-dom'

const Profile: React.FC = () => {
  const { updateProfile, loading } = useAuth()
  const { pharmacy, isProfileComplete } = useAuthStore()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isEditing = searchParams.get('edit') === 'true'
  
  const [formData, setFormData] = useState({
    name: '',
    ownerName: '',
    licenseNumber: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    woreda: '',
    deliveryAvailable: false,
    location: {
      coordinates: [0, 0] as [number, number]
    }
  })
  
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')

  useEffect(() => {
    if (pharmacy) {
      setFormData({
        name: pharmacy.name || '',
        ownerName: pharmacy.ownerName || '',
        licenseNumber: pharmacy.licenseNumber || '',
        phone: pharmacy.phone || '',
        email: pharmacy.email || '',
        address: pharmacy.address || '',
        city: pharmacy.city || '',
        woreda: pharmacy.woreda || '',
        deliveryAvailable: pharmacy.deliveryAvailable || false,
        location: {
          coordinates: pharmacy.location?.coordinates || [0, 0]
        }
      })
    }
  }, [pharmacy])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')

    try {
      const profileData = {
        ...formData,
        location: {
          type: 'Point' as const,
          coordinates: formData.location.coordinates
        }
      }

      await updateProfile(profileData)
      
      setMessage('Profile updated successfully!')
      setMessageType('success')
      
      // If this was the first time setup, redirect to pending approval or dashboard
      if (!isProfileComplete) {
        setTimeout(() => {
          navigate('/pending-approval')
        }, 2000)
      } else if (isEditing) {
        setTimeout(() => {
          navigate('/dashboard')
        }, 2000)
      }
      
      // Clear message after 5 seconds
      setTimeout(() => setMessage(''), 5000)
    } catch (error: any) {
      setMessage(error.message || 'Failed to update profile. Please try again.')
      setMessageType('error')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    
    if (name === 'longitude' || name === 'latitude') {
      const coord = parseFloat(value) || 0
      const index = name === 'longitude' ? 0 : 1
      setFormData(prev => ({
        ...prev,
        location: {
          coordinates: [
            index === 0 ? coord : prev.location.coordinates[0],
            index === 1 ? coord : prev.location.coordinates[1]
          ] as [number, number]
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
      }))
    }
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            location: {
              coordinates: [position.coords.longitude, position.coords.latitude]
            }
          }))
          setMessage('Location updated successfully!')
          setMessageType('success')
          setTimeout(() => setMessage(''), 3000)
        },
        (_error) => {
          setMessage('Unable to get your location. Please enter coordinates manually.')
          setMessageType('error')
          setTimeout(() => setMessage(''), 5000)
        }
      )
    } else {
      setMessage('Geolocation is not supported by this browser.')
      setMessageType('error')
    }
  }

  const pageTitle = !isProfileComplete 
    ? 'Complete Your Pharmacy Profile' 
    : isEditing 
      ? 'Edit Pharmacy Profile' 
      : 'Pharmacy Profile'

  const pageDescription = !isProfileComplete 
    ? 'Please complete your pharmacy information to continue' 
    : isEditing 
      ? 'Update your pharmacy information and settings' 
      : 'Manage your pharmacy information and settings'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
          <p className="text-gray-600">{pageDescription}</p>
        </div>
        {isEditing && isProfileComplete && (
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-secondary flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </button>
        )}
      </div>

      {!isProfileComplete && (
        <div className="bg-warning-50 border border-warning-200 text-warning-700 px-4 py-3 rounded-lg flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Profile Incomplete</p>
            <p className="text-sm">Please complete all required fields to access your dashboard.</p>
          </div>
        </div>
      )}

      {message && (
        <div className={`p-4 rounded-lg flex items-center ${
          messageType === 'success' 
            ? 'bg-success-50 text-success-700 border border-success-200' 
            : 'bg-error-50 text-error-700 border border-error-200'
        }`}>
          {messageType === 'error' && <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />}
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Building className="h-5 w-5 mr-2" />
              Basic Information
            </h3>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Pharmacy Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="input"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter pharmacy name"
                />
              </div>

              <div>
                <label htmlFor="ownerName" className="block text-sm font-medium text-gray-700 mb-2">
                  Owner Name *
                </label>
                <input
                  type="text"
                  id="ownerName"
                  name="ownerName"
                  required
                  className="input"
                  value={formData.ownerName}
                  onChange={handleChange}
                  placeholder="Enter owner name"
                />
              </div>

              <div>
                <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  License Number *
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    id="licenseNumber"
                    name="licenseNumber"
                    required
                    className="input pl-10"
                    value={formData.licenseNumber}
                    onChange={handleChange}
                    placeholder="Enter license number"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    className="input pl-10"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="input pl-10"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email address"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Location Information */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Location Information
            </h3>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  className="input"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter street address"
                />
              </div>

              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  required
                  className="input"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Enter city"
                />
              </div>

              <div>
                <label htmlFor="woreda" className="block text-sm font-medium text-gray-700 mb-2">
                  Woreda *
                </label>
                <input
                  type="text"
                  id="woreda"
                  name="woreda"
                  required
                  className="input"
                  value={formData.woreda}
                  onChange={handleChange}
                  placeholder="Enter woreda"
                />
              </div>

              <div>
                <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-2">
                  Longitude (GPS)
                </label>
                <input
                  type="number"
                  id="longitude"
                  name="longitude"
                  step="any"
                  className="input"
                  value={formData.location.coordinates[0]}
                  onChange={handleChange}
                  placeholder="Enter longitude"
                />
              </div>

              <div>
                <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-2">
                  Latitude (GPS)
                </label>
                <input
                  type="number"
                  id="latitude"
                  name="latitude"
                  step="any"
                  className="input"
                  value={formData.location.coordinates[1]}
                  onChange={handleChange}
                  placeholder="Enter latitude"
                />
              </div>

              <div className="md:col-span-2">
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  className="btn-secondary"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Get Current Location
                </button>
                <p className="text-sm text-gray-500 mt-2">
                  Click to automatically fill in your current GPS coordinates
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Service Settings */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Service Settings</h3>
          </div>
          <div className="card-body">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="deliveryAvailable"
                name="deliveryAvailable"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                checked={formData.deliveryAvailable}
                onChange={handleChange}
              />
              <label htmlFor="deliveryAvailable" className="ml-2 block text-sm text-gray-900">
                Delivery service available
              </label>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              Enable this option if you provide delivery services to customers
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </div>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {!isProfileComplete ? 'Complete Profile' : 'Save Changes'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

export default Profile