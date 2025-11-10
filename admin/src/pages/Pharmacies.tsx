import React, { useEffect, useState } from 'react'
import { Search, Building2, Check, X, ToggleLeft, ToggleRight, MapPin, Phone, Mail } from 'lucide-react'
import { adminAPI } from '../services/api'
import toast from 'react-hot-toast'

interface Pharmacy {
  _id: string
  name: string
  ownerName: string
  licenseNumber: string
  phone: string
  email: string
  address: string
  city: string
  woreda: string
  status: 'pending' | 'approved' | 'rejected'
  isActive: boolean
  deliveryAvailable: boolean
  createdAt: string
}

const Pharmacies: React.FC = () => {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    const fetchPharmacies = async () => {
      try {
        const response = await adminAPI.getAllPharmacies()
        setPharmacies(response.data)
      } catch (error) {
        console.error('Error fetching pharmacies:', error)
        toast.error('Failed to load pharmacies')
      } finally {
        setLoading(false)
      }
    }

    fetchPharmacies()
  }, [])

  const handleApprove = async (id: string) => {
    try {
      await adminAPI.approvePharmacy(id)
      setPharmacies(prev => prev.map(p => 
        p._id === id ? { ...p, status: 'approved', isActive: true } : p
      ))
      toast.success('Pharmacy approved successfully')
    } catch (error) {
      toast.error('Failed to approve pharmacy')
    }
  }

  const handleReject = async (id: string) => {
    try {
      await adminAPI.rejectPharmacy(id)
      setPharmacies(prev => prev.map(p => 
        p._id === id ? { ...p, status: 'rejected', isActive: false } : p
      ))
      toast.success('Pharmacy rejected')
    } catch (error) {
      toast.error('Failed to reject pharmacy')
    }
  }

  const handleToggleStatus = async (id: string) => {
    try {
      await adminAPI.togglePharmacyStatus(id)
      setPharmacies(prev => prev.map(p => 
        p._id === id ? { ...p, isActive: !p.isActive } : p
      ))
      toast.success('Pharmacy status updated')
    } catch (error) {
      toast.error('Failed to update pharmacy status')
    }
  }

  const filteredPharmacies = pharmacies.filter(pharmacy => {
    const matchesSearch = pharmacy.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pharmacy.ownerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pharmacy.city?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !statusFilter || pharmacy.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': return 'badge-success'
      case 'rejected': return 'badge-error'
      case 'pending': return 'badge-warning'
      default: return 'badge-gray'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pharmacy Management</h1>
        <p className="text-gray-600">Review and manage pharmacy applications</p>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="card-body">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search pharmacies..."
                  className="input pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <select 
              className="input sm:w-48"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Pharmacies Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredPharmacies.map((pharmacy) => (
          <div key={pharmacy._id} className="card">
            <div className="card-body">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{pharmacy.name}</h3>
                  <p className="text-sm text-gray-600">Owner: {pharmacy.ownerName}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`badge ${getStatusBadge(pharmacy.status)}`}>
                    {pharmacy.status}
                  </span>
                  {pharmacy.status === 'approved' && (
                    <button
                      onClick={() => handleToggleStatus(pharmacy._id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {pharmacy.isActive ? (
                        <ToggleRight className="h-5 w-5 text-green-500" />
                      ) : (
                        <ToggleLeft className="h-5 w-5" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Building2 className="h-4 w-4 mr-2 text-gray-400" />
                  License: {pharmacy.licenseNumber}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-2 text-gray-400" />
                  {pharmacy.phone}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-2 text-gray-400" />
                  {pharmacy.email}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                  {pharmacy.city}, {pharmacy.woreda}
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span>Delivery: {pharmacy.deliveryAvailable ? 'Available' : 'Not Available'}</span>
                <span>Applied: {new Date(pharmacy.createdAt).toLocaleDateString()}</span>
              </div>

              <div className="flex space-x-2">
                {pharmacy.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleApprove(pharmacy._id)}
                      className="btn-success flex-1"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(pharmacy._id)}
                      className="btn-error flex-1"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Reject
                    </button>
                  </>
                )}
                
                {pharmacy.status === 'rejected' && (
                  <button
                    onClick={() => handleApprove(pharmacy._id)}
                    className="btn-success flex-1"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Approve
                  </button>
                )}

                {pharmacy.status === 'approved' && (
                  <div className="text-center w-full">
                    <span className={`text-sm ${pharmacy.isActive ? 'text-green-600' : 'text-gray-500'}`}>
                      {pharmacy.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPharmacies.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No pharmacies found</h3>
          <p className="text-gray-600">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  )
}

export default Pharmacies