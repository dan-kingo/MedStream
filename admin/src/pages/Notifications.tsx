import React, { useState } from 'react'
import { Send, Bell, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  target: string;
  timestamp: Date;
}

const Notifications: React.FC = () => {
  const [notificationData, setNotificationData] = useState({
    title: '',
    message: '',
    type: 'info',
    target: 'all', // all, users, pharmacies
  })
  const [sending, setSending] = useState(false)
  const [recentNotifications, setRecentNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'System Maintenance Scheduled',
      message: 'The system will be under maintenance on Sunday from 2:00 AM to 4:00 AM.',
      type: 'warning',
      target: 'all',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
    },
    {
      id: '2',
      title: 'New Feature: Order Tracking',
      message: 'We\'ve added real-time order tracking for all your prescriptions.',
      type: 'success',
      target: 'all',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
    }
  ])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Add new notification to recent notifications
      const newNotification: Notification = {
        id: Math.random().toString(36).substring(2, 9),
        title: notificationData.title,
        message: notificationData.message,
        type: notificationData.type,
        target: notificationData.target,
        timestamp: new Date()
      }
      
      setRecentNotifications(prev => [newNotification, ...prev])
      toast.success('Notification sent successfully!')
      
      // Reset form
      setNotificationData({
        title: '',
        message: '',
        type: 'info',
        target: 'all',
      })
    } catch (error) {
      toast.error('Failed to send notification')
    } finally {
      setSending(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setNotificationData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'warning': return AlertTriangle
      case 'success': return Bell
      default: return Bell
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'warning': return 'text-warning-600 bg-warning-100'
      case 'success': return 'text-success-600 bg-success-100'
      case 'error': return 'text-error-600 bg-error-100'
      default: return 'text-primary-600 bg-primary-100'
    }
  }

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
    
    let interval = Math.floor(seconds / 31536000)
    if (interval >= 1) return `${interval} year${interval === 1 ? '' : 's'} ago`
    
    interval = Math.floor(seconds / 2592000)
    if (interval >= 1) return `${interval} month${interval === 1 ? '' : 's'} ago`
    
    interval = Math.floor(seconds / 86400)
    if (interval >= 1) return `${interval} day${interval === 1 ? '' : 's'} ago`
    
    interval = Math.floor(seconds / 3600)
    if (interval >= 1) return `${interval} hour${interval === 1 ? '' : 's'} ago`
    
    interval = Math.floor(seconds / 60)
    if (interval >= 1) return `${interval} minute${interval === 1 ? '' : 's'} ago`
    
    return `${Math.floor(seconds)} second${seconds === 1 ? '' : 's'} ago`
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">System Notifications</h1>
        <p className="text-gray-600">Send alerts and announcements to users and pharmacies</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Send Notification Form */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Send New Notification</h3>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  className="input"
                  placeholder="Notification title"
                  value={notificationData.title}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  name="message"
                  required
                  rows={4}
                  className="input"
                  placeholder="Enter your message here..."
                  value={notificationData.message}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type
                  </label>
                  <select
                    name="type"
                    className="input"
                    value={notificationData.type}
                    onChange={handleChange}
                  >
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="success">Success</option>
                    <option value="error">Error</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Audience
                  </label>
                  <select
                    name="target"
                    className="input"
                    value={notificationData.target}
                    onChange={handleChange}
                  >
                    <option value="all">All Users</option>
                    <option value="users">Patients Only</option>
                    <option value="pharmacies">Pharmacies Only</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={sending}
                className="btn-primary w-full"
              >
                {sending ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </div>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Notification
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Preview */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Preview</h3>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-full ${getTypeColor(notificationData.type)}`}>
                    {React.createElement(getTypeIcon(notificationData.type), { className: 'h-4 w-4' })}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">
                      {notificationData.title || 'Notification Title'}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {notificationData.message || 'Your notification message will appear here...'}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Just now
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-sm text-gray-600">
                <p><strong>Target:</strong> {
                  notificationData.target === 'all' ? 'All Users' :
                  notificationData.target === 'users' ? 'Patients Only' :
                  'Pharmacies Only'
                }</p>
                <p><strong>Type:</strong> {notificationData.type}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Notifications */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900">Recent Notifications</h3>
        </div>
        <div className="card-body">
          <div className="space-y-4">
            {recentNotifications.map(notification => (
              <div key={notification.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className={`p-2 rounded-full ${getTypeColor(notification.type)}`}>
                  {React.createElement(getTypeIcon(notification.type), { className: 'h-4 w-4' })}
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900">{notification.title}</h4>
                  <p className="text-sm text-gray-600">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatTimeAgo(notification.timestamp)} • {
                      notification.target === 'all' ? 'All Users' :
                      notification.target === 'users' ? 'Patients Only' :
                      'Pharmacies Only'
                    }
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Notifications